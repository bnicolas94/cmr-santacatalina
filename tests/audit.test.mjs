import assert from "node:assert/strict";
import test from "node:test";
import { db as prisma } from "../src/infrastructure/db.ts";
import { recordAuditLog, queryAuditLogs } from "../src/domains/audit/index.ts";

test("recordAuditLog registra y sanitiza campos sensibles", async () => {
  const org = await prisma.organization.findFirst();
  assert.ok(org, "Organización debe existir");

  const admin = await prisma.user.findFirst({
    where: { organizationId: org.id },
  });

  const entry = await recordAuditLog(
    {
      organizationId: org.id,
      actorUserId: admin?.id,
      action: "user:create",
      entityType: "User",
      entityId: "usr_test_123",
      before: null,
      after: {
        name: "Test User",
        email: "test@santacatalina.local",
        passwordHash: "secret_hash_123",
        token: "bearer_abc",
      },
      ip: "127.0.0.1",
      userAgent: "Vitest/Node",
    },
    prisma,
  );

  assert.ok(entry.id);
  assert.equal(entry.action, "user:create");
  assert.equal(entry.entityType, "User");
  assert.equal(entry.entityId, "usr_test_123");

  // Verificar sanitización de secretos
  const afterObj = entry.after;
  assert.equal(afterObj.name, "Test User");
  assert.equal(afterObj.passwordHash, "[REDACTED]");
  assert.equal(afterObj.token, "[REDACTED]");

  // Verificar consulta
  const result = await queryAuditLogs(
    {
      organizationId: org.id,
      entityType: "User",
      entityId: "usr_test_123",
    },
    prisma,
  );

  assert.ok(result.total >= 1);
  assert.equal(result.items[0].id, entry.id);
  assert.ok(result.items[0].actorUser);
});
