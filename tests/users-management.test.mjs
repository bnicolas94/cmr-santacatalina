import assert from "node:assert/strict";
import test from "node:test";
import { db as prisma } from "../src/infrastructure/db.ts";
import { listUsers, createOperator } from "../src/domains/users/index.ts";

test("registra y lista operadores con sus roles asignados", async () => {
  const org = await prisma.organization.findFirst();
  assert.ok(org, "Debe existir una organización sembrada.");

  const email = `telef_${Date.now()}@santacatalina.local`;

  // 1. Crear nuevo operador
  const user = await createOperator(
    {
      organizationId: org.id,
      name: "Telefonista Test",
      email,
      password: "Password123!",
      roleName: "TELEFONISTA",
    },
    undefined,
    prisma,
  );

  assert.equal(user.email, email);
  assert.equal(user.name, "Telefonista Test");

  // 2. Listar usuarios
  const users = await listUsers(org.id, prisma);
  const found = users.find((u) => u.id === user.id);
  assert.ok(found, "El operador debe ser retornado en listUsers.");
  assert.equal(found.userRoles[0].role.name, "TELEFONISTA");
});
