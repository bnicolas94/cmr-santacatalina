import assert from "node:assert/strict";
import test from "node:test";
import { db as prisma } from "../src/infrastructure/db.ts";
import {
  listQuickReplies,
  createQuickReply,
  deleteQuickReply,
} from "../src/domains/quick-replies/index.ts";

test("gestiona el ciclo de vida de respuestas rápidas con auditoría", async () => {
  const org = await prisma.organization.findFirst();
  assert.ok(org, "Debe existir una organización sembrada.");

  // 1. Crear plantilla
  const created = await createQuickReply(
    {
      organizationId: org.id,
      shortcut: "/alias",
      title: "Alias CBU Mercado Pago",
      content: "CBU: 00000031000... Alias: SANTA.CATALINA.PIZZA",
      category: "Pagos",
    },
    undefined,
    prisma,
  );

  assert.equal(created.shortcut, "/alias");
  assert.equal(created.title, "Alias CBU Mercado Pago");

  // 2. Listar plantillas
  const list = await listQuickReplies(org.id, prisma);
  const found = list.find((q) => q.id === created.id);
  assert.ok(found, "La plantilla creada debe estar en la lista.");

  // 3. Eliminar plantilla
  const result = await deleteQuickReply(created.id, org.id, undefined, prisma);
  assert.equal(result.success, true);
});
