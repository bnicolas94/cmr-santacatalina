import { PrismaClient, type Category, type Product } from "@prisma/client";
import { recordAuditLog } from "../audit/index.ts";

const defaultPrisma = new PrismaClient();

export interface CreateCategoryParams {
  organizationId: string;
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateCategoryParams {
  name?: string;
  description?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface CreateProductParams {
  organizationId: string;
  categoryId: string;
  sku?: string;
  name: string;
  description?: string;
  price: number | string;
  unit?: string;
  stock?: number;
  imageUrl?: string;
}

export interface UpdateProductParams {
  categoryId?: string;
  sku?: string;
  name?: string;
  description?: string;
  price?: number | string;
  unit?: string;
  stock?: number;
  imageUrl?: string;
  active?: boolean;
}

export async function listCategories(
  organizationId: string,
  activeOnly = true,
  client: PrismaClient = defaultPrisma,
): Promise<Category[]> {
  return client.category.findMany({
    where: {
      organizationId,
      ...(activeOnly ? { active: true } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createCategory(
  params: CreateCategoryParams,
  actorUserId?: string,
  client: PrismaClient = defaultPrisma,
): Promise<Category> {
  const category = await client.category.create({
    data: {
      organizationId: params.organizationId,
      name: params.name,
      description: params.description ?? null,
      sortOrder: params.sortOrder ?? 0,
    },
  });

  await recordAuditLog(
    {
      organizationId: params.organizationId,
      actorUserId,
      action: "catalog:category_create",
      entityType: "Category",
      entityId: category.id,
      after: { name: category.name },
    },
    client,
  );

  return category;
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryParams,
  actorUserId?: string,
  client: PrismaClient = defaultPrisma,
): Promise<Category> {
  const existing = await client.category.findUniqueOrThrow({ where: { id } });

  const updated = await client.category.update({
    where: { id },
    data,
  });

  await recordAuditLog(
    {
      organizationId: existing.organizationId,
      actorUserId,
      action: "catalog:category_update",
      entityType: "Category",
      entityId: id,
      before: { name: existing.name, active: existing.active },
      after: { name: updated.name, active: updated.active },
    },
    client,
  );

  return updated;
}

export async function listProducts(
  organizationId: string,
  params: { categoryId?: string; search?: string; activeOnly?: boolean } = {},
  client: PrismaClient = defaultPrisma,
): Promise<Product[]> {
  const { categoryId, search, activeOnly = true } = params;

  return client.product.findMany({
    where: {
      organizationId,
      ...(activeOnly ? { active: true } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
    },
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
  });
}

export async function getProductById(
  id: string,
  client: PrismaClient = defaultPrisma,
): Promise<Product | null> {
  return client.product.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function createProduct(
  params: CreateProductParams,
  actorUserId?: string,
  client: PrismaClient = defaultPrisma,
): Promise<Product> {
  const product = await client.product.create({
    data: {
      organizationId: params.organizationId,
      categoryId: params.categoryId,
      sku: params.sku ?? null,
      name: params.name,
      description: params.description ?? null,
      price: params.price,
      unit: params.unit ?? "UNIDAD",
      stock: params.stock ?? null,
      imageUrl: params.imageUrl ?? null,
    },
    include: { category: true },
  });

  await recordAuditLog(
    {
      organizationId: params.organizationId,
      actorUserId,
      action: "catalog:product_create",
      entityType: "Product",
      entityId: product.id,
      after: { name: product.name, price: product.price.toString() },
    },
    client,
  );

  return product;
}

export async function updateProduct(
  id: string,
  data: UpdateProductParams,
  actorUserId?: string,
  client: PrismaClient = defaultPrisma,
): Promise<Product> {
  const existing = await client.product.findUniqueOrThrow({ where: { id } });

  const updated = await client.product.update({
    where: { id },
    data,
    include: { category: true },
  });

  await recordAuditLog(
    {
      organizationId: existing.organizationId,
      actorUserId,
      action: "catalog:product_update",
      entityType: "Product",
      entityId: id,
      before: {
        name: existing.name,
        price: existing.price.toString(),
        active: existing.active,
      },
      after: {
        name: updated.name,
        price: updated.price.toString(),
        active: updated.active,
      },
    },
    client,
  );

  return updated;
}
