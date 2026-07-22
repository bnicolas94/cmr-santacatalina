import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/domains/auth/password.ts";

const prisma = new PrismaClient();

const PERMISSIONS = [
  { key: "users:read", description: "Ver lista y detalles de usuarios" },
  { key: "users:write", description: "Crear y editar usuarios" },
  { key: "roles:read", description: "Ver roles y sus permisos" },
  { key: "roles:write", description: "Gestionar asignación de permisos" },
  { key: "conversations:read", description: "Ver bandeja de conversaciones" },
  { key: "conversations:reply", description: "Responder mensajes en conversaciones" },
  { key: "conversations:assign", description: "Asignar conversaciones a usuarios" },
  { key: "conversations:close", description: "Cerrar y archivar conversaciones" },
  { key: "orders:read", description: "Ver lista y detalle de pedidos" },
  { key: "orders:create", description: "Crear nuevos pedidos" },
  { key: "orders:update", description: "Cambiar estado de pedidos" },
  { key: "customers:read", description: "Ver lista de clientes" },
  { key: "customers:write", description: "Crear y editar clientes" },
  { key: "catalog:read", description: "Ver catálogo de productos" },
  { key: "catalog:write", description: "Gestionar productos y precios" },
  { key: "branches:read", description: "Ver sedes" },
  { key: "branches:write", description: "Gestionar sedes" },
  { key: "audit:read", description: "Ver registros de auditoría" },
  { key: "reports:read", description: "Ver reportes y métricas" },
];

const DEFAULT_ROLES = [
  { name: "ADMINISTRADOR", description: "Acceso total al sistema y administración" },
  { name: "SUPERVISOR", description: "Supervisión de atención, pedidos y catálogo" },
  { name: "TELEFONISTA", description: "Atención de conversaciones y toma de pedidos" },
  { name: "PRODUCCION", description: "Visualización de comandas de cocina/horno" },
  { name: "REPARTO", description: "Visualización de hoja de ruta de delivery" },
  { name: "AUDITOR", description: "Acceso de lectura a auditoría y reportes" },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMINISTRADOR: PERMISSIONS.map((p) => p.key),
  SUPERVISOR: [
    "conversations:read",
    "conversations:reply",
    "conversations:assign",
    "conversations:close",
    "orders:read",
    "orders:create",
    "orders:update",
    "customers:read",
    "customers:write",
    "catalog:read",
    "catalog:write",
    "reports:read",
    "audit:read",
  ],
  TELEFONISTA: [
    "conversations:read",
    "conversations:reply",
    "conversations:assign",
    "conversations:close",
    "orders:read",
    "orders:create",
    "orders:update",
    "customers:read",
    "customers:write",
    "catalog:read",
  ],
  PRODUCCION: ["orders:read"],
  REPARTO: ["orders:read"],
  AUDITOR: [
    "conversations:read",
    "orders:read",
    "customers:read",
    "catalog:read",
    "audit:read",
    "reports:read",
  ],
};

async function main() {
  console.log("🌱 Iniciando seed de Santa Catalina CRM...");

  // 1. Organización inicial
  const organization = await prisma.organization.upsert({
    where: { id: "org_santa_catalina_default" },
    update: {
      name: "Santa Catalina",
      timezone: "America/Argentina/Buenos_Aires",
    },
    create: {
      id: "org_santa_catalina_default",
      name: "Santa Catalina",
      timezone: "America/Argentina/Buenos_Aires",
      settings: {
        currency: "ARS",
        language: "es-AR",
      },
    },
  });
  console.log(`✅ Organización asegurada: ${organization.name} (${organization.id})`);

  // 2. Sede por defecto
  const branch = await prisma.branch.upsert({
    where: { id: "branch_casa_central" },
    update: {
      name: "Casa Central",
      address: "Av. Principal 123, Buenos Aires",
      active: true,
    },
    create: {
      id: "branch_casa_central",
      organizationId: organization.id,
      name: "Casa Central",
      address: "Av. Principal 123, Buenos Aires",
      active: true,
    },
  });
  console.log(`✅ Sede por defecto asegurada: ${branch.name} (${branch.id})`);

  // 3. Permisos
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description },
      create: { key: perm.key, description: perm.description },
    });
  }
  console.log(`✅ Permisos asegurados (${PERMISSIONS.length})`);

  // 4. Roles y Mapeos Role-Permission
  for (const r of DEFAULT_ROLES) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { name: r.name, description: r.description },
    });

    const allowedKeys = ROLE_PERMISSIONS[r.name] || [];
    for (const key of allowedKeys) {
      const perm = await prisma.permission.findUnique({ where: { key } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: perm.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: perm.id,
          },
        });
      }
    }
  }
  console.log(`✅ Roles iniciales asegurados (${DEFAULT_ROLES.length})`);

  // 5. Usuario Administrador Inicial
  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: "ADMINISTRADOR" },
  });

  const initialPasswordHash = await hashPassword("Admin123!");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@santacatalina.local" },
    update: {
      name: "Administrador Santa Catalina",
      passwordHash: initialPasswordHash,
      active: true,
    },
    create: {
      organizationId: organization.id,
      name: "Administrador Santa Catalina",
      email: "admin@santacatalina.local",
      passwordHash: initialPasswordHash,
      active: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });
  console.log(`✅ Usuario administrador asegurado: ${adminUser.email}`);

  // 6. Categorías y Productos de Catálogo iniciales
  const categoriesData = [
    {
      id: "cat_empanadas",
      name: "Empanadas",
      sortOrder: 1,
      products: [
        { name: "Empanada de Carne Suave", price: 1200, unit: "UNIDAD" },
        { name: "Empanada de Jamón y Queso", price: 1200, unit: "UNIDAD" },
      ],
    },
    {
      id: "cat_pizzas",
      name: "Pizzas",
      sortOrder: 2,
      products: [
        { name: "Pizza Muzzarella Grande", price: 9500, unit: "UNIDAD" },
        { name: "Pizza Fugazzeta Grande", price: 10500, unit: "UNIDAD" },
      ],
    },
    {
      id: "cat_bebidas",
      name: "Bebidas",
      sortOrder: 3,
      products: [
        { name: "Coca-Cola Original 1.5L", price: 2800, unit: "UNIDAD" },
      ],
    },
    {
      id: "cat_postres",
      name: "Postres",
      sortOrder: 4,
      products: [
        { name: "Flan Casero con Dulce de Leche", price: 3200, unit: "UNIDAD" },
      ],
    },
  ];

  for (const cData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { id: cData.id },
      update: { name: cData.name, sortOrder: cData.sortOrder },
      create: {
        id: cData.id,
        organizationId: organization.id,
        name: cData.name,
        sortOrder: cData.sortOrder,
      },
    });

    for (const pData of cData.products) {
      await prisma.product.upsert({
        where: { id: `prod_${pData.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}` },
        update: { price: pData.price },
        create: {
          id: `prod_${pData.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
          organizationId: organization.id,
          categoryId: category.id,
          name: pData.name,
          price: pData.price,
          unit: pData.unit,
        },
      });
    }
  }
  console.log(`✅ Catálogo inicial asegurado (${categoriesData.length} categorías)`);

  console.log("🌱 Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error ejecutando el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
