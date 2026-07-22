import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "@prisma/client";

test("la base de datos contiene los datos seeded de Santa Catalina", async () => {
  const prisma = new PrismaClient();

  try {
    const org = await prisma.organization.findFirst({
      where: { name: "Santa Catalina" },
      include: { branches: true },
    });
    assert.ok(org, "Organización 'Santa Catalina' debe existir");
    assert.equal(org.timezone, "America/Argentina/Buenos_Aires");
    assert.ok(org.branches.length > 0, "Debe incluir al menos una sede");

    const branch = await prisma.branch.findFirst({
      where: { name: "Casa Central" },
    });
    assert.ok(branch, "Sede 'Casa Central' debe existir");
    assert.equal(branch.organizationId, org.id);

    const rolesCount = await prisma.role.count();
    assert.equal(rolesCount, 6, "Deben existir 6 roles por defecto");

    const adminRole = await prisma.role.findUnique({
      where: { name: "ADMINISTRADOR" },
      include: { rolePermissions: true },
    });
    assert.ok(adminRole, "Rol ADMINISTRADOR debe existir");
    assert.equal(
      adminRole.rolePermissions.length,
      22,
      "ADMINISTRADOR debe poseer 22 permisos",
    );

    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@santacatalina.local" },
      include: { userRoles: { include: { role: true } } },
    });
    assert.ok(adminUser, "Usuario admin@santacatalina.local debe existir");
    assert.equal(adminUser.userRoles[0].role.name, "ADMINISTRADOR");
  } finally {
    await prisma.$disconnect();
  }
});
