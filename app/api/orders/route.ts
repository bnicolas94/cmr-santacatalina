import {
  getCurrentUser,
  hasPermission,
} from "../../../src/domains/auth/index.ts";
import { listOrders, createOrder } from "../../../src/domains/orders/index.ts";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const customerId = url.searchParams.get("customerId") || undefined;

  const orders = await listOrders(user.organizationId, { status, customerId });

  return Response.json({ status: "ok", orders });
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  if (!hasPermission(user, "orders:create")) {
    return Response.json(
      { error: "No posee permisos para crear pedidos." },
      { status: 403 },
    );
  }

  const body = await request.json();

  try {
    const order = await createOrder(
      {
        ...body,
        organizationId: user.organizationId,
      },
      user.id,
    );

    return Response.json({ status: "ok", order }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Error creando el pedido.",
      },
      { status: 400 },
    );
  }
}
