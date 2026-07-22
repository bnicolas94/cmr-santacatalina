import {
  getCurrentUser,
  hasPermission,
} from "../../../../src/domains/auth/index.ts";
import {
  getOrderById,
  updateOrderStatus,
} from "../../../../src/domains/orders/index.ts";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderById(id);

  if (!order || order.organizationId !== user.organizationId) {
    return Response.json({ error: "Pedido no encontrado." }, { status: 404 });
  }

  return Response.json({ status: "ok", order });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  if (!hasPermission(user, "orders:update")) {
    return Response.json(
      { error: "No posee permisos para cambiar el estado de pedidos." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const body = await request.json();
  const { status, notes } = body || {};

  if (!status || typeof status !== "string") {
    return Response.json(
      { error: "El nuevo estado del pedido es obligatorio." },
      { status: 400 },
    );
  }

  try {
    const updated = await updateOrderStatus({
      orderId: id,
      status,
      notes,
      actorUserId: user.id,
    });

    return Response.json({ status: "ok", order: updated });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al actualizar el estado del pedido.",
      },
      { status: 400 },
    );
  }
}
