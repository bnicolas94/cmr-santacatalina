import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import {
  findOrCreateCustomer,
  addCustomerAddress,
  listCustomers,
} from "../src/domains/customers/index.ts";
import {
  findOrCreateConversation,
  processInboundWebhookMessage,
  processWebhookStatusUpdate,
  sendOutboundMessage,
  assignConversation,
  closeConversation,
  addInternalNote,
} from "../src/domains/conversations/index.ts";
import { loginUser } from "../src/domains/auth/index.ts";
import { GET as getConversationsRoute } from "../app/api/conversations/route.ts";
import { GET as getCustomersRoute } from "../app/api/customers/route.ts";

test("findOrCreateCustomer y addCustomerAddress gestionan clientes y direcciones", async () => {
  const prisma = new PrismaClient();
  try {
    const org = await prisma.organization.findFirst();
    assert.ok(org);

    const num = `549119999${Date.now().toString().slice(-4)}`;
    const customer = await findOrCreateCustomer(
      {
        organizationId: org.id,
        whatsappNumber: num,
        whatsappName: "María Cliente",
      },
      prisma,
    );

    assert.ok(customer.id);
    assert.equal(customer.whatsappName, "María Cliente");

    const address = await addCustomerAddress(
      customer.id,
      {
        street: "Av. Corrientes",
        number: "1234",
        city: "CABA",
        province: "Buenos Aires",
        isDefault: true,
      },
      prisma,
    );

    assert.ok(address.id);
    assert.equal(address.street, "Av. Corrientes");
    assert.equal(address.isDefault, true);

    const customersList = await listCustomers(org.id, "María", prisma);
    assert.ok(customersList.length >= 1);
  } finally {
    await prisma.$disconnect();
  }
});

test("processInboundWebhookMessage procesa mensajes entrantes y ventana de 24hs", async () => {
  const prisma = new PrismaClient();
  try {
    const wamid = `wamid.INBOUND_${Date.now()}`;
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "waba_123",
          changes: [
            {
              field: "messages",
              value: {
                contacts: [
                  {
                    profile: { name: "Carlos Consulta" },
                    wa_id: "5491188887777",
                  },
                ],
                messages: [
                  {
                    id: wamid,
                    from: "5491188887777",
                    timestamp: `${Math.floor(Date.now() / 1000)}`,
                    type: "text",
                    text: { body: "¿Tienen stock de muzzarella?" },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const msg = await processInboundWebhookMessage(payload, prisma);
    assert.ok(msg);
    assert.equal(msg.text, "¿Tienen stock de muzzarella?");
    assert.equal(msg.direction, "INBOUND");

    const conversation = await prisma.conversation.findUnique({
      where: { id: msg.conversationId },
      include: { customer: true },
    });

    assert.ok(conversation);
    assert.equal(conversation.customer.whatsappNumber, "5491188887777");
    assert.equal(conversation.unreadCount, 1);
    assert.ok(conversation.serviceWindowExpiresAt);
    assert.ok(conversation.serviceWindowExpiresAt > new Date());
  } finally {
    await prisma.$disconnect();
  }
});

test("processWebhookStatusUpdate actualiza estado de mensajes salientes a ENVIADO, ENTREGADO o LEIDO", async () => {
  const prisma = new PrismaClient();
  try {
    const org = await prisma.organization.findFirst();
    const admin = await prisma.user.findFirst({
      where: { organizationId: org.id },
    });

    const customer = await findOrCreateCustomer(
      { organizationId: org.id, whatsappNumber: "5491177776666" },
      prisma,
    );
    const conv = await findOrCreateConversation(org.id, customer.id, prisma);

    const wamid = `wamid.OUTBOUND_${Date.now()}`;
    const outbound = await prisma.message.create({
      data: {
        conversationId: conv.id,
        externalMessageId: wamid,
        direction: "OUTBOUND",
        type: "text",
        text: "Hola Carlos, sí tenemos stock.",
        sentByUserId: admin.id,
        status: "PENDING_ENVIO",
      },
    });

    const payloadStatus = {
      entry: [
        {
          changes: [
            {
              value: {
                statuses: [
                  {
                    id: wamid,
                    status: "delivered",
                    timestamp: `${Math.floor(Date.now() / 1000)}`,
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const updated = await processWebhookStatusUpdate(payloadStatus, prisma);
    assert.ok(updated);
    assert.equal(updated.id, outbound.id);
    assert.equal(updated.status, "ENTREGADO");
  } finally {
    await prisma.$disconnect();
  }
});

test("sendOutboundMessage, assignConversation, closeConversation y addInternalNote", async () => {
  const prisma = new PrismaClient();
  try {
    const org = await prisma.organization.findFirst();
    const admin = await prisma.user.findFirst({
      where: { organizationId: org.id },
    });

    const customer = await findOrCreateCustomer(
      { organizationId: org.id, whatsappNumber: "5491166665555" },
      prisma,
    );
    const conv = await findOrCreateConversation(org.id, customer.id, prisma);

    // 1. Enviar mensaje saliente
    const sentMsg = await sendOutboundMessage(
      {
        conversationId: conv.id,
        text: "Respuesta de telefonista",
        sentByUserId: admin.id,
      },
      prisma,
    );
    assert.equal(sentMsg.direction, "OUTBOUND");
    assert.equal(sentMsg.sentByUserId, admin.id);

    // 2. Asignar conversación
    const assigned = await assignConversation(
      {
        conversationId: conv.id,
        assignedUserId: admin.id,
        actorUserId: admin.id,
      },
      prisma,
    );
    assert.equal(assigned.assignedUserId, admin.id);
    assert.equal(assigned.status, "ASIGNADA");

    // 3. Nota interna
    const note = await addInternalNote(
      {
        conversationId: conv.id,
        authorUserId: admin.id,
        body: "Cliente solicita entrega antes de las 18hs.",
      },
      prisma,
    );
    assert.equal(note.body, "Cliente solicita entrega antes de las 18hs.");

    // 4. Cerrar conversación
    const closed = await closeConversation(conv.id, admin.id, prisma);
    assert.equal(closed.status, "CERRADA");
    assert.ok(closed.closedAt);
  } finally {
    await prisma.$disconnect();
  }
});

test("rutas API /api/conversations y /api/customers", async () => {
  const authRes = await loginUser({
    email: "admin@santacatalina.local",
    password: "Admin123!",
  });

  // 1. GET /api/conversations
  const convReq = new Request("http://localhost/api/conversations", {
    headers: { Cookie: `sc_session=${authRes.token}` },
  });
  const convRes = await getConversationsRoute(convReq);
  assert.equal(convRes.status, 200);
  const convBody = await convRes.json();
  assert.equal(convBody.status, "ok");
  assert.ok(Array.isArray(convBody.conversations));

  // 2. GET /api/customers
  const custReq = new Request("http://localhost/api/customers", {
    headers: { Cookie: `sc_session=${authRes.token}` },
  });
  const custRes = await getCustomersRoute(custReq);
  assert.equal(custRes.status, 200);
  const custBody = await custRes.json();
  assert.equal(custBody.status, "ok");
  assert.ok(Array.isArray(custBody.customers));
});
