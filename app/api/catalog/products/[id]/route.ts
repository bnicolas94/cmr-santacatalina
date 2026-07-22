import {
  getCurrentUser,
  hasPermission,
} from "../../../../../src/domains/auth/index.ts";
import {
  getProductById,
  updateProduct,
} from "../../../../../src/domains/catalog/index.ts";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  const { id } = await params;
  const product = await getProductById(id);

  if (!product || product.organizationId !== user.organizationId) {
    return Response.json({ error: "Producto no encontrado." }, { status: 404 });
  }

  return Response.json({ status: "ok", product });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  if (!hasPermission(user, "catalog:write")) {
    return Response.json(
      { error: "No posee permisos para administrar el catálogo." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const updated = await updateProduct(id, body, user.id);
    return Response.json({ status: "ok", product: updated });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al actualizar producto.",
      },
      { status: 400 },
    );
  }
}
