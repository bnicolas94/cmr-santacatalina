import {
  getCurrentUser,
  hasPermission,
} from "../../../../src/domains/auth/index.ts";
import {
  listCategories,
  createCategory,
} from "../../../../src/domains/catalog/index.ts";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  const url = new URL(request.url);
  const includeInactive = url.searchParams.get("includeInactive") === "true";

  const categories = await listCategories(
    user.organizationId,
    !includeInactive,
  );

  return Response.json({ status: "ok", categories });
}

export async function POST(request: Request) {
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

  const body = await request.json();
  const { name, description, sortOrder } = body || {};

  if (!name || typeof name !== "string") {
    return Response.json(
      { error: "El nombre de la categoría es obligatorio." },
      { status: 400 },
    );
  }

  const category = await createCategory(
    {
      organizationId: user.organizationId,
      name: name.trim(),
      description,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
    },
    user.id,
  );

  return Response.json({ status: "ok", category }, { status: 201 });
}
