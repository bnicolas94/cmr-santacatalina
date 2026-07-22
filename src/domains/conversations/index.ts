import {
  PrismaClient,
  type Conversation,
  type Message,
  type InternalNote,
} from "@prisma/client";
import { findOrCreateCustomer } from "../customers/index.ts";
import { recordAuditLog } from "../audit/index.ts";

const defaultPrisma = new PrismaClient();

const SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 horas

interface InboundMessageValue {
  messaging_product?: string;
  metadata?: { phone_number_id?: string };
  contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
  messages?: Array<{
    id?: string;
    from?: string;
    timestamp?: string;
    type?: string;
    text?: { body?: string };
  }>;
  statuses?: Array<{
    id?: string;
    status?: string;
    timestamp?: string;
  }>;
}

interface InboundWebhookPayload {
  entry?: Array<{
    id?: string;
    changes?: Array<{
      value?: InboundMessageValue;
    }>;
  }>;
}

export interface SendMessageParams {
  conversationId: string;
  text: string;
  sentByUserId: string;
}

export interface AssignConversationParams {
  conversationId: string;
  assignedUserId: string;
  actorUserId: string;
}

export interface AddNoteParams {
  conversationId: string;
  authorUserId: string;
  body: string;
}

export async function findOrCreateConversation(
  organizationId: string,
  customerId: string,
  client: PrismaClient = defaultPrisma,
): Promise<Conversation> {
  const existing = await client.conversation.findFirst({
    where: {
      organizationId,
      customerId,
      status: { notIn: ["CERRADA", "ARCHIVADA"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) return existing;

  return client.conversation.create({
    data: {
      organizationId,
      customerId,
      status: "NUEVA",
      priority: "NORMAL",
    },
  });
}

export async function processInboundWebhookMessage(
  payload: Record<string, unknown>,
  client: PrismaClient = defaultPrisma,
): Promise<Message | null> {
  try {
    const data = payload as InboundWebhookPayload;
    const entry = data.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const msg = value?.messages?.[0];

    if (!msg || !msg.from) return null;

    // Buscar organización (usamos la por defecto en prototipo local)
    const org = await client.organization.findFirst();
    if (!org) return null;

    const contactName = value?.contacts?.[0]?.profile?.name ?? null;

    // 1. Cliente
    const customer = await findOrCreateCustomer(
      {
        organizationId: org.id,
        whatsappNumber: msg.from,
        whatsappName: contactName,
      },
      client,
    );

    // 2. Conversación
    const conversation = await findOrCreateConversation(
      org.id,
      customer.id,
      client,
    );

    const msgTimestamp = msg.timestamp
      ? new Date(parseInt(msg.timestamp, 10) * 1000)
      : new Date();
    const expiresAt = new Date(msgTimestamp.getTime() + SERVICE_WINDOW_MS);

    // 3. Crear Mensaje
    const createdMessage = await client.message.create({
      data: {
        conversationId: conversation.id,
        externalMessageId: msg.id ?? null,
        direction: "INBOUND",
        type: msg.type ?? "text",
        text: msg.text?.body ?? null,
        externalTimestamp: msgTimestamp,
        status: "RECIBIDO",
      },
    });

    // 4. Actualizar Conversación
    await client.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: msgTimestamp,
        lastCustomerMessageAt: msgTimestamp,
        serviceWindowExpiresAt: expiresAt,
        unreadCount: { increment: 1 },
        status:
          conversation.status === "CERRADA" ? "NUEVA" : conversation.status,
      },
    });

    await recordAuditLog(
      {
        organizationId: org.id,
        action: "conversation:inbound_message",
        entityType: "Message",
        entityId: createdMessage.id,
        after: {
          conversationId: conversation.id,
          customerId: customer.id,
          wamid: msg.id,
        },
      },
      client,
    );

    return createdMessage;
  } catch (error) {
    console.error("Error al procesar mensaje entrante:", error);
    return null;
  }
}

export async function processWebhookStatusUpdate(
  payload: Record<string, unknown>,
  client: PrismaClient = defaultPrisma,
): Promise<Message | null> {
  try {
    const data = payload as InboundWebhookPayload;
    const entry = data.entry?.[0];
    const statusObj = entry?.changes?.[0]?.value?.statuses?.[0];

    if (!statusObj || !statusObj.id || !statusObj.status) return null;

    const message = await client.message.findFirst({
      where: { externalMessageId: statusObj.id },
      include: { conversation: true },
    });

    if (!message) return null;

    const statusMap: Record<string, string> = {
      sent: "ENVIADO",
      delivered: "ENTREGADO",
      read: "LEIDO",
      failed: "FALLIDO",
    };

    const newStatus = statusMap[statusObj.status.toLowerCase()] ?? "ENVIADO";

    const updated = await client.message.update({
      where: { id: message.id },
      data: { status: newStatus },
    });

    await recordAuditLog(
      {
        organizationId: message.conversation.organizationId,
        action: "message:status_update",
        entityType: "Message",
        entityId: message.id,
        before: { status: message.status },
        after: { status: newStatus, externalStatus: statusObj.status },
      },
      client,
    );

    return updated;
  } catch (error) {
    console.error("Error al procesar estado de mensaje:", error);
    return null;
  }
}

export async function sendOutboundMessage(
  params: SendMessageParams,
  client: PrismaClient = defaultPrisma,
): Promise<Message> {
  const conversation = await client.conversation.findUnique({
    where: { id: params.conversationId },
  });

  if (!conversation) throw new Error("Conversación no encontrada");

  const now = new Date();

  const message = await client.message.create({
    data: {
      conversationId: conversation.id,
      direction: "OUTBOUND",
      type: "text",
      text: params.text,
      sentByUserId: params.sentByUserId,
      externalTimestamp: now,
      status: "ENVIADO",
    },
  });

  await client.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: now,
      unreadCount: 0,
      status:
        conversation.status === "NUEVA" ? "EN_ATENCION" : conversation.status,
    },
  });

  await recordAuditLog(
    {
      organizationId: conversation.organizationId,
      actorUserId: params.sentByUserId,
      action: "message:send",
      entityType: "Message",
      entityId: message.id,
      after: {
        conversationId: conversation.id,
        textLength: params.text.length,
      },
    },
    client,
  );

  return message;
}

export async function assignConversation(
  params: AssignConversationParams,
  client: PrismaClient = defaultPrisma,
): Promise<Conversation> {
  const conversation = await client.conversation.update({
    where: { id: params.conversationId },
    data: {
      assignedUserId: params.assignedUserId,
      status: "ASIGNADA",
    },
  });

  await recordAuditLog(
    {
      organizationId: conversation.organizationId,
      actorUserId: params.actorUserId,
      action: "conversation:assign",
      entityType: "Conversation",
      entityId: conversation.id,
      after: { assignedUserId: params.assignedUserId },
    },
    client,
  );

  return conversation;
}

export async function closeConversation(
  conversationId: string,
  actorUserId: string,
  client: PrismaClient = defaultPrisma,
): Promise<Conversation> {
  const conversation = await client.conversation.update({
    where: { id: conversationId },
    data: {
      status: "CERRADA",
      closedAt: new Date(),
    },
  });

  await recordAuditLog(
    {
      organizationId: conversation.organizationId,
      actorUserId,
      action: "conversation:close",
      entityType: "Conversation",
      entityId: conversation.id,
    },
    client,
  );

  return conversation;
}

export async function addInternalNote(
  params: AddNoteParams,
  client: PrismaClient = defaultPrisma,
): Promise<InternalNote> {
  const conversation = await client.conversation.findUnique({
    where: { id: params.conversationId },
  });

  if (!conversation) throw new Error("Conversación no encontrada");

  const note = await client.internalNote.create({
    data: {
      conversationId: params.conversationId,
      authorUserId: params.authorUserId,
      body: params.body,
    },
  });

  await recordAuditLog(
    {
      organizationId: conversation.organizationId,
      actorUserId: params.authorUserId,
      action: "conversation:add_note",
      entityType: "InternalNote",
      entityId: note.id,
    },
    client,
  );

  return note;
}

export async function listInternalNotes(
  conversationId: string,
  client: PrismaClient = defaultPrisma,
) {
  return client.internalNote.findMany({
    where: { conversationId },
    include: {
      authorUser: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}
