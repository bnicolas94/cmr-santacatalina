import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/domains/auth/password";

const prisma = new PrismaClient();

const ROLES = [
  {
    name: "ADMINISTRADOR",
    description: "Acceso total a la configuración, usuarios, métricas y auditoría.",
  },
  {
    name: "SUPERVISOR",
    description: "Supervisión de conversaciones, intervención, reasignación y reportes.",
  },
  {
    name: "TELEFONISTA",
    description: "Atención de conversaciones, gestión de clientes y carga de pedidos.",
  },
  {
    name: "PRODUCCION",
    description: "Visualización de pedidos confirmados por sede para preparación.",
  },
  {
    name: "REPARTO",
    description: "Visualización de entregas asignadas y actualización de estado.",
  },
  {
    name: "AUDITOR",
    description: "Acceso de solo lectura a reportes, métricas e historial de auditoría.",
  },
];

const PERMISSIONS = [
  { key: "org:read", description: "Ver configuración de la organización" },
  { key: "org:write", description: "Modificar configuración de la organización" },
  { key: "branches:read", description: "Ver sedes" },
  { key: "branches:write", description: "Crear y editar sedes" },
  { key: "users:read", description: "Ver usuarios" },
  { key: "users:write", description: "Crear y editar usuarios" },
  { key: "roles:read", description: "Ver roles y permisos" },
  { key: "roles:write", description: "Modificar roles y permisos" },
  { key: "conversations:read", description: "Ver conversaciones" },
  { key: "conversations:write", description: "Responder mensajes en conversaciones" },
  { key: "conversations:assign", description: "Tomar o reasignar conversaciones" },
  { key: "conversations:close", description: "Cerrar o reabrir conversaciones" },
  { key: "orders:read", description: "Ver pedidos" },
  { key: "orders:create", description: "Crear pedidos" },
  { key: "orders:update", description: "Editar pedidos" },
  { key: "orders:cancel", description: "Cancelar pedidos" },
  { key: "customers:read", description: "Ver clientes y fichas" },
  { key: "customers:write", description: "Crear y editar datos de clientes" },
  { key: "catalog:read", description: "Ver productos y precios" },
  { key: "catalog:write", description: "Modificar productos, variantes y precios" },
  { key: "audit:read", description: "Ver registros de auditoría" },
  { key: "reports:read", description: "Ver reportes y métricas de gestión" },
];

const ROLE_PERMISSIONS_MAPPING: Record<string, string[]> = {
  ADMINISTRADOR: PERMISSIONS.map((p) => p.key),
  SUPERVISOR: [
    "users:read",
    "conversations:read",
    "conversations:write",
    "conversations:assign",
    "conversations:close",
    "orders:read",
    "orders:create",
    "orders:update",
    "orders:cancel",
    "customers:read",
    "customers:write",
    "catalog:read",
    "audit:read",
    "reports:read",
  ],
  TELEFONISTA: [
    "conversations:read",
    "conversations:write",
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

  // 3. Crear o actualizar Permisos
  const permissionRecords: Record<string, string> = {};
  for (const perm of PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description },
      create: {
        key: perm.key,
        description: perm.description,
      },
    });
    permissionRecords[perm.key] = record.id;
  }
  console.log(`✅ ${PERMISSIONS.length} permisos asegurados.`);

  // 4. Crear o actualizar Roles y sus Permisos
  for (const roleData of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: {
        name: roleData.name,
        description: roleData.description,
      },
    });

    const allowedKeys = ROLE_PERMISSIONS_MAPPING[roleData.name] ?? [];
    for (const key of allowedKeys) {
      const permissionId = permissionRecords[key];
      if (permissionId) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId,
          },
        });
      }
    }
    console.log(`  - Rol asegurado: ${role.name}`);
  }

  // 5. Usuario Administrador inicial
  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMINISTRADOR" },
  });

  if (!adminRole) throw new Error("Rol ADMINISTRADOR no encontrado");

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

  console.log(`✅ Usuario administrador asegurado: ${adminUser.email} (${adminUser.id})`);
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
