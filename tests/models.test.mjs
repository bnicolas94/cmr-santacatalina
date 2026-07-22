import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PrismaClient } from "@prisma/client";

test("los modelos de Prisma están expuestos en PrismaClient", () => {
  const client = new PrismaClient();
  assert.ok(client.organization);
  assert.ok(client.branch);
  assert.ok(client.user);
  assert.ok(client.role);
  assert.ok(client.permission);
  assert.ok(client.userRole);
  assert.ok(client.rolePermission);
});

test("el esquema schema.prisma define la estructura requerida para SC-011", async () => {
  const schemaContent = await readFile(
    new URL("../prisma/schema.prisma", import.meta.url),
    "utf8",
  );

  // Modelos principales
  assert.match(schemaContent, /model Organization/);
  assert.match(schemaContent, /model Branch/);
  assert.match(schemaContent, /model User/);
  assert.match(schemaContent, /model Role/);
  assert.match(schemaContent, /model Permission/);
  assert.match(schemaContent, /model UserRole/);
  assert.match(schemaContent, /model RolePermission/);

  // Reglas de contraseña segura y campos únicos
  assert.match(
    schemaContent,
    /passwordHash\s+String\s+@map\("password_hash"\)/,
  );
  assert.doesNotMatch(schemaContent, /\bpassword\s+String\b/);
  assert.match(schemaContent, /email\s+String\s+@unique/);
  assert.match(schemaContent, /name\s+String\s+@unique/);
  assert.match(schemaContent, /key\s+String\s+@unique/);

  // Llaves primarias compuestas para asociaciones sin duplicados
  assert.match(schemaContent, /@@id\(\[userId,\s*roleId\]\)/);
  assert.match(schemaContent, /@@id\(\[roleId,\s*permissionId\]\)/);

  // Índices para consultas previsibles
  assert.match(schemaContent, /@@index\(\[organizationId\]\)/);
  assert.match(schemaContent, /@@index\(\[organizationId,\s*active\]\)/);
  assert.match(schemaContent, /@@index\(\[email\]\)/);
});
