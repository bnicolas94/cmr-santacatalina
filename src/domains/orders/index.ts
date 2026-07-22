import { PrismaClient, type Order } from "@prisma/client";
import { recordAuditLog } from "../audit/index.ts";

const defaultPrisma = new PrismaClient();

export interface CreateOrderItemParams {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface CreateOrderParams {
  organizationId: string;
  branchId?: string;
  customerId: string;
  conversationId?: string;
  fulfillmentType: "ENVIO" | "RETIRA";
  deliveryAddressId?: string;
  deliveryFee?: number;
  discount?: number;
  paymentMethod?: string;
  notes?: string;
  items: CreateOrderItemParams[];
}

export interface UpdateOrderStatusParams {
  orderId: string;
  status: string;
  actorUserId: string;
  notes?: string;
}

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, "0")
    .toUpperCase();
  return `ORD-${dateStr}-${randomHex}`;
}

export async function createOrder(
  params: CreateOrderParams,
  createdByUserId: string,
  client: PrismaClient = defaultPrisma,
): Promise<Order> {
  // 1. Validaciones de Reglas de Negocio
  if (!params.items || params.items.length === 0) {
    throw new Error("El pedido debe contener al menos un producto.");
  }

  if (
    params.fulfillmentType !== "ENVIO" &&
    params.fulfillmentType !== "RETIRA"
  ) {
    throw new Error("El tipo de entrega debe ser ENVIO o RETIRA.");
  }

  if (params.fulfillmentType === "ENVIO" && !params.deliveryAddressId) {
    throw new Error(
      "Los pedidos con entrega a domicilio (ENVIO) requieren una dirección seleccionada.",
    );
  }

  // 2. Obtener productos y realizar Snapshot Inmutable de Precios
  const productIds = params.items.map((i) => i.productId);
  const products = await client.product.findMany({
    where: {
      id: { in: productIds },
      organizationId: params.organizationId,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotalAcc = 0;
  const orderItemsData = params.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Producto ${item.productId} no encontrado o inactivo.`);
    }

    const unitPriceNum = Number(product.price);
    const itemSubtotal = unitPriceNum * item.quantity;
    subtotalAcc += itemSubtotal;

    return {
      productId: product.id,
      productName: product.name,
      unitPrice: product.price, // Snapshot inmutable de la base de datos
      quantity: item.quantity,
      subtotal: itemSubtotal,
      notes: item.notes ?? null,
    };
  });

  const deliveryFee = params.deliveryFee ?? 0;
  const discount = params.discount ?? 0;
  const total = subtotalAcc + deliveryFee - discount;

  const orderNumber = generateOrderNumber();

  // 3. Inserción Transaccional en Base de Datos
  const order = await client.order.create({
    data: {
      organizationId: params.organizationId,
      branchId: params.branchId ?? null,
      customerId: params.customerId,
      conversationId: params.conversationId ?? null,
      orderNumber,
      fulfillmentType: params.fulfillmentType,
      deliveryAddressId: params.deliveryAddressId ?? null,
      status: "BORRADOR",
      subtotal: subtotalAcc,
      deliveryFee,
      discount,
      total,
      paymentMethod: params.paymentMethod ?? null,
      paymentStatus: "PENDIENTE",
      notes: params.notes ?? null,
      createdByUserId,
      items: {
        create: orderItemsData,
      },
      statusHistory: {
        create: {
          fromStatus: null,
          toStatus: "BORRADOR",
          changedByUserId: createdByUserId,
          notes: "Creación inicial del pedido",
        },
      },
    },
    include: {
      items: true,
      customer: true,
      deliveryAddress: true,
      statusHistory: true,
    },
  });

  await recordAuditLog(
    {
      organizationId: params.organizationId,
      actorUserId: createdByUserId,
      action: "order:create",
      entityType: "Order",
      entityId: order.id,
      after: {
        orderNumber: order.orderNumber,
        total: order.total.toString(),
        fulfillmentType: order.fulfillmentType,
      },
    },
    client,
  );

  return order;
}

export async function updateOrderStatus(
  params: UpdateOrderStatusParams,
  client: PrismaClient = defaultPrisma,
): Promise<Order> {
  const existing = await client.order.findUniqueOrThrow({
    where: { id: params.orderId },
  });

  const validStatuses = [
    "BORRADOR",
    "PENDIENTE_CONFIRMACION",
    "CONFIRMADO",
    "EN_PREPARACION",
    "EN_CAMINO",
    "ENTREGADO",
    "CANCELADO",
  ];

  if (!validStatuses.includes(params.status)) {
    throw new Error(`Estado de pedido no válido: ${params.status}`);
  }

  // Regla: No confirmar pedidos con tipo ENVIO sin dirección
  if (
    params.status === "CONFIRMADO" &&
    existing.fulfillmentType === "ENVIO" &&
    !existing.deliveryAddressId
  ) {
    throw new Error(
      "No se puede confirmar un pedido con entrega a domicilio sin dirección registrada.",
    );
  }

  const updated = await client.order.update({
    where: { id: params.orderId },
    data: {
      status: params.status,
      statusHistory: {
        create: {
          fromStatus: existing.status,
          toStatus: params.status,
          changedByUserId: params.actorUserId,
          notes: params.notes ?? null,
        },
      },
    },
    include: {
      items: true,
      customer: true,
      deliveryAddress: true,
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  await recordAuditLog(
    {
      organizationId: existing.organizationId,
      actorUserId: params.actorUserId,
      action: "order:status_update",
      entityType: "Order",
      entityId: existing.id,
      before: { status: existing.status },
      after: { status: params.status },
    },
    client,
  );

  return updated;
}

export async function listOrders(
  organizationId: string,
  filters: { customerId?: string; status?: string } = {},
  client: PrismaClient = defaultPrisma,
): Promise<Order[]> {
  return client.order.findMany({
    where: {
      organizationId,
      ...(filters.customerId ? { customerId: filters.customerId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    include: {
      customer: true,
      items: true,
      deliveryAddress: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getOrderById(
  id: string,
  client: PrismaClient = defaultPrisma,
): Promise<Order | null> {
  return client.order.findUnique({
    where: { id },
    include: {
      customer: {
        include: { addresses: true },
      },
      deliveryAddress: true,
      items: {
        include: { product: true },
      },
      statusHistory: {
        include: {
          changedByUser: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
