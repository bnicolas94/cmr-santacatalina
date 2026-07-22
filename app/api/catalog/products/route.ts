import {
  getCurrentUser,
  hasPermission,
} from "../../../../src/domains/auth/index.ts";
import {
  listProducts,
  createProduct,
} from "../../../../src/domains/catalog/index.ts";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  const url = new URL(request.url);
  const categoryId = url.searchParams.get("categoryId") || undefined;
  const search = url.searchParams.get("search") || undefined;
  const includeInactive = url.searchParams.get("includeInactive") === "true";

  const products = await listProducts(user.organizationId, {
    categoryId,
    search,
    activeOnly: !includeInactive,
  });

  return Response.json({ status: "ok", products });
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
  const { categoryId, name, price, description, sku, unit, stock, imageUrl } =
    body || {};

  if (
    !categoryId ||
    typeof categoryId !== "string" ||
    !name ||
    typeof name !== "string" ||
    price === undefined
  ) {
    return Response.json(
      { error: "Categoría, nombre y precio son obligatorios." },
      { status: 400 },
    );
  }

  const product = await createProduct(
    {
      organizationId: user.organizationId,
      categoryId,
      name: name.trim(),
      price,
      description,
      sku,
      unit,
      stock,
      imageUrl,
    },
    user.id,
  );

  return Response.json({ status: "ok", product }, { status: 201 });
}
