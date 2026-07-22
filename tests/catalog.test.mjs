import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import {
  listCategories,
  createCategory,
  updateCategory,
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
} from "../src/domains/catalog/index.ts";
import { loginUser } from "../src/domains/auth/index.ts";
import { GET as getCategoriesRoute } from "../app/api/catalog/categories/route.ts";
import { GET as getProductsRoute } from "../app/api/catalog/products/route.ts";

test("listCategories y listProducts consultan los datos sembrados", async () => {
  const prisma = new PrismaClient();
  try {
    const org = await prisma.organization.findFirst();
    assert.ok(org);

    const categories = await listCategories(org.id, true, prisma);
    assert.ok(categories.length >= 4);

    const products = await listProducts(org.id, {}, prisma);
    assert.ok(products.length >= 6);

    const empanadasCategory = categories.find((c) => c.name === "Empanadas");
    assert.ok(empanadasCategory);

    const empanadasProducts = await listProducts(
      org.id,
      { categoryId: empanadasCategory.id },
      prisma,
    );
    assert.ok(empanadasProducts.length >= 2);
  } finally {
    await prisma.$disconnect();
  }
});

test("createCategory, updateCategory, createProduct y updateProduct con precios Decimal", async () => {
  const prisma = new PrismaClient();
  try {
    const org = await prisma.organization.findFirst();
    const admin = await prisma.user.findFirst({
      where: { organizationId: org.id },
    });

    // 1. Categoría
    const cat = await createCategory(
      {
        organizationId: org.id,
        name: "Especiales de Estación",
        sortOrder: 10,
      },
      admin.id,
      prisma,
    );
    assert.ok(cat.id);

    const updatedCat = await updateCategory(
      cat.id,
      { name: "Especiales de Invierno" },
      admin.id,
      prisma,
    );
    assert.equal(updatedCat.name, "Especiales de Invierno");

    // 2. Producto con precio Decimal
    const prod = await createProduct(
      {
        organizationId: org.id,
        categoryId: cat.id,
        name: "Guiso de Lentejas Especial",
        price: 8500.5,
        unit: "PORCION",
      },
      admin.id,
      prisma,
    );
    assert.ok(prod.id);
    assert.equal(prod.price.toString(), "8500.5");

    const updatedProd = await updateProduct(
      prod.id,
      { price: 8900.0 },
      admin.id,
      prisma,
    );
    assert.equal(updatedProd.price.toString(), "8900");

    const fetched = await getProductById(prod.id, prisma);
    assert.ok(fetched);
    assert.equal(fetched.name, "Guiso de Lentejas Especial");
  } finally {
    await prisma.$disconnect();
  }
});

test("rutas API /api/catalog/categories y /api/catalog/products", async () => {
  const authRes = await loginUser({
    email: "admin@santacatalina.local",
    password: "Admin123!",
  });

  // 1. GET /api/catalog/categories
  const catReq = new Request("http://localhost/api/catalog/categories", {
    headers: { Cookie: `sc_session=${authRes.token}` },
  });
  const catRes = await getCategoriesRoute(catReq);
  assert.equal(catRes.status, 200);
  const catBody = await catRes.json();
  assert.equal(catBody.status, "ok");
  assert.ok(Array.isArray(catBody.categories));

  // 2. GET /api/catalog/products
  const prodReq = new Request(
    "http://localhost/api/catalog/products?search=Empanada",
    {
      headers: { Cookie: `sc_session=${authRes.token}` },
    },
  );
  const prodRes = await getProductsRoute(prodReq);
  assert.equal(prodRes.status, 200);
  const prodBody = await prodRes.json();
  assert.equal(prodBody.status, "ok");
  assert.ok(Array.isArray(prodBody.products));
});
