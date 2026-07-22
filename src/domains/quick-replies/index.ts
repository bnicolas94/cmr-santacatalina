import { PrismaClient } from "@prisma/client";
import { recordAuditLog } from "../audit/index.ts";
import { db as defaultPrisma } from "../../infrastructure/db.ts";

export interface QuickReplyData {
  organizationId: string;
  shortcut: string;
  title: string;
  content: string;
  category?: string;
}

export async function listQuickReplies(
  organizationId: string,
  client: PrismaClient = defaultPrisma,
) {
  return client.quickReply.findMany({
    where: { organizationId },
    orderBy: { shortcut: "asc" },
  });
}

export async function createQuickReply(
  data: QuickReplyData,
  actorUserId?: string,
  client: PrismaClient = defaultPrisma,
) {
  const shortcutNorm = data.shortcut.startsWith("/")
    ? data.shortcut.trim()
    : `/${data.shortcut.trim()}`;

  const reply = await client.quickReply.create({
    data: {
      organizationId: data.organizationId,
      shortcut: shortcutNorm,
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category?.trim() || "General",
    },
  });

  await recordAuditLog(
    {
      organizationId: data.organizationId,
      actorUserId,
      action: "quick_reply:create",
      entityType: "QuickReply",
      entityId: reply.id,
      before: null,
      after: reply,
    },
    client,
  );

  return reply;
}

export async function deleteQuickReply(
  id: string,
  organizationId: string,
  actorUserId?: string,
  client: PrismaClient = defaultPrisma,
) {
  const existing = await client.quickReply.findUnique({
    where: { id },
  });

  if (!existing || existing.organizationId !== organizationId) {
    throw new Error("Respuesta rápida no encontrada.");
  }

  await client.quickReply.delete({
    where: { id },
  });

  await recordAuditLog(
    {
      organizationId,
      actorUserId,
      action: "quick_reply:delete",
      entityType: "QuickReply",
      entityId: id,
      before: existing,
      after: null,
    },
    client,
  );

  return { success: true };
}
