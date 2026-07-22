import assert from "node:assert/strict";
import test from "node:test";
import { db as prisma } from "../src/infrastructure/db.ts";
import { findOrCreateCustomer } from "../src/domains/customers/index.ts";
import {
  findOrCreateConversation,
  addInternalNote,
  listInternalNotes,
  assignConversation,
} from "../src/domains/conversations/index.ts";

test("crea y lista notas internas privadas y gestiona la reasignación de conversaciones", async () => {
  const org = await prisma.organization.findFirst();
  assert.ok(org, "Debe existir organización sembrada.");

  const admin = await prisma.user.findFirst({
    where: { organizationId: org.id },
  });
  assert.ok(admin, "Debe existir usuario admin.");

  const customer = await findOrCreateCustomer(
    {
      organizationId: org.id,
      whatsappNumber: `549118888${Date.now().toString().slice(-4)}`,
      whatsappName: "Cliente Notas Test",
    },
    prisma,
  );

  const conv = await findOrCreateConversation(org.id, customer.id, prisma);
  assert.ok(conv.id);

  // 1. Crear Nota Interna Privada
  const note = await addInternalNote(
    {
      conversationId: conv.id,
      authorUserId: admin.id,
      body: "Nota privada: El cliente prefiere retirar después de las 21hs.",
    },
    prisma,
  );

  assert.ok(note.id);
  assert.equal(
    note.body,
    "Nota privada: El cliente prefiere retirar después de las 21hs.",
  );

  // 2. Listar Notas Internas Privadas
  const notes = await listInternalNotes(conv.id, prisma);
  assert.ok(notes.length >= 1);
  const foundNote = notes.find((n) => n.id === note.id);
  assert.ok(foundNote);
  assert.equal(foundNote.authorUser.name, admin.name);

  // 3. Reasignar conversación
  const updatedConv = await assignConversation(
    {
      conversationId: conv.id,
      assignedUserId: admin.id,
      actorUserId: admin.id,
    },
    prisma,
  );

  assert.equal(updatedConv.assignedUserId, admin.id);
  assert.equal(updatedConv.status, "ASIGNADA");

  // 4. Verificar registro de auditoría de reasignación
  const audit = await prisma.auditLog.findFirst({
    where: {
      action: "conversation:assign",
      entityId: conv.id,
    },
  });
  assert.ok(audit, "Debe existir log de auditoría para conversation:assign.");
});
