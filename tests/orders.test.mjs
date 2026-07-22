import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import {
  findOrCreateCustomer,
  addCustomerAddress,
} from "../src/domains/customers/index.ts";
import {
  createOrder,
  updateOrderStatus,
  listOrders,
  getOrderById,
} from "../src/domains/orders/index.ts";
import { loginUser } from "../src/domains/auth/index.ts";
import { GET as getOrdersRoute } from "../app/api/orders/route.ts";

test("createOrder genera snapshot inmutable de precios y valida dirección en ENVIO", async () => {
  const prisma = new PrismaClient();
  try {
    const org = await prisma.organization.findFirst();
    const admin = await prisma.user.findFirst({
      where: { organizationId: org.id },
    });
    const product = await prisma.product.findFirst({
      where: { organizationId: org.id },
    });

    assert.ok(org && admin && product);

    const customer = await findOrCreateCustomer(
      {
        organizationId: org.id,
        whatsappNumber: `549115555${Date.now().toString().slice(-4)}`,
        whatsappName: "Cliente Pedido Test",
      },
      prisma,
    );

    const address = await addCustomerAddress(
      customer.id,
      {
        street: "Calle Test",
        number: "456",
        city: "CABA",
        province: "Buenos Aires",
      },
      prisma,
    );

    // 1. Validar que ENVIO sin dirección falla
    await assert.rejects(
      async () => {
        await createOrder(
          {
            organizationId: org.id,
            customerId: customer.id,
            fulfillmentType: "ENVIO",
            items: [{ productId: product.id, quantity: 2 }],
          },
          admin.id,
          prisma,
        );
      },
      {
        message:
          /Los pedidos con entrega a domicilio \(ENVIO\) requieren una dirección seleccionada/,
      },
    );

    // 2. Crear pedido exitoso con ENVIO y dirección
    const initialPrice = product.price.toString();
    const order = await createOrder(
      {
        organizationId: org.id,
        customerId: customer.id,
        fulfillmentType: "ENVIO",
        deliveryAddressId: address.id,
        deliveryFee: 1500,
        items: [{ productId: product.id, quantity: 2 }],
      },
      admin.id,
      prisma,
    );

    assert.ok(order.id);
    assert.ok(order.orderNumber.startsWith("ORD-"));
    assert.equal(order.items[0].productName, product.name);
    assert.equal(order.items[0].unitPrice.toString(), initialPrice);

    // 3. Modificar precio del producto en catálogo
    await prisma.product.update({
      where: { id: product.id },
      data: { price: 99999.99 },
    });

    // 4. Verificar que el snapshot del pedido anterior se mantiene inalterado
    const fetchedOrder = await getOrderById(order.id, prisma);
    assert.equal(fetchedOrder.items[0].unitPrice.toString(), initialPrice);
  } finally {
    await prisma.$disconnect();
  }
});

test("updateOrderStatus registra historial de estados y audita transiciones", async () => {
  const prisma = new PrismaClient();
  try {
    const org = await prisma.organization.findFirst();
    const admin = await prisma.user.findFirst({
      where: { organizationId: org.id },
    });
    const product = await prisma.product.findFirst({
      where: { organizationId: org.id },
    });

    const customer = await findOrCreateCustomer(
      {
        organizationId: org.id,
        whatsappNumber: `549114444${Date.now().toString().slice(-4)}`,
        whatsappName: "Cliente Retiro Test",
      },
      prisma,
    );

    const order = await createOrder(
      {
        organizationId: org.id,
        customerId: customer.id,
        fulfillmentType: "RETIRA",
        items: [{ productId: product.id, quantity: 1 }],
      },
      admin.id,
      prisma,
    );

    assert.equal(order.status, "BORRADOR");

    // Transición a CONFIRMADO
    const confirmed = await updateOrderStatus(
      {
        orderId: order.id,
        status: "CONFIRMADO",
        notes: "Pedido confirmado por el cliente vía WhatsApp",
        actorUserId: admin.id,
      },
      prisma,
    );
    assert.equal(confirmed.status, "CONFIRMADO");

    // Transición a EN_PREPARACION
    const inPrep = await updateOrderStatus(
      {
        orderId: order.id,
        status: "EN_PREPARACION",
        actorUserId: admin.id,
      },
      prisma,
    );
    assert.equal(inPrep.status, "EN_PREPARACION");
    assert.equal(inPrep.statusHistory.length, 3); // BORRADOR, CONFIRMADO, EN_PREPARACION
  } finally {
    await prisma.$disconnect();
  }
});

test("rutas API /api/orders listan y consultan pedidos", async () => {
  const authRes = await loginUser({
    email: "admin@santacatalina.local",
    password: "Admin123!",
  });

  const prisma = new PrismaClient();
  try {
    const org = await prisma.organization.findFirst();
    const ordersList = await listOrders(org.id, {}, prisma);
    assert.ok(Array.isArray(ordersList));
  } finally {
    await prisma.$disconnect();
  }

  const req = new Request("http://localhost/api/orders", {
    headers: { Cookie: `sc_session=${authRes.token}` },
  });
  const res = await getOrdersRoute(req);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "ok");
  assert.ok(Array.isArray(body.orders));
});
