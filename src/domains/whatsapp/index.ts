import { createHmac, timingSafeEqual } from "node:crypto";
import { PrismaClient, type WebhookEvent } from "@prisma/client";

const defaultPrisma = new PrismaClient();

interface WhatsAppChangeValue {
  messages?: Array<{ id?: string }>;
  statuses?: Array<{ id?: string }>;
}

interface WhatsAppChange {
  field?: string;
  value?: WhatsAppChangeValue;
}

interface WhatsAppEntry {
  id?: string;
  changes?: WhatsAppChange[];
}

interface WhatsAppWebhookPayload {
  entry?: WhatsAppEntry[];
}

export function verifyWebhookChallenge(
  hubMode: string | null,
  hubVerifyToken: string | null,
  hubChallenge: string | null,
): { valid: boolean; challenge: string | null } {
  const expectedToken =
    process.env.WHATSAPP_VERIFY_TOKEN || "santa_catalina_webhook_token";

  if (
    hubMode === "subscribe" &&
    hubVerifyToken === expectedToken &&
    hubChallenge
  ) {
    return { valid: true, challenge: hubChallenge };
  }

  return { valid: false, challenge: null };
}

export function validateWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  // Si no hay app secret configurado en entorno local, omitir validación estricta
  if (!appSecret) {
    return true;
  }

  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const expectedSignature = signatureHeader.slice(7).trim();
  const hmac = createHmac("sha256", appSecret);
  hmac.update(rawBody, "utf8");
  const computedSignature = hmac.digest("hex");

  try {
    const expectedBuf = Buffer.from(expectedSignature, "hex");
    const computedBuf = Buffer.from(computedSignature, "hex");

    if (expectedBuf.length !== computedBuf.length) return false;
    return timingSafeEqual(expectedBuf, computedBuf);
  } catch {
    return false;
  }
}

export function extractExternalEventKey(
  payload: Record<string, unknown>,
): string | null {
  try {
    const data = payload as WhatsAppWebhookPayload;
    const entry = data.entry?.[0];
    const change = entry?.changes?.[0]?.value;

    if (change?.messages?.[0]?.id) {
      return change.messages[0].id;
    }
    if (change?.statuses?.[0]?.id) {
      return change.statuses[0].id;
    }
    if (entry?.id) {
      return entry.id;
    }
  } catch {
    return null;
  }
  return null;
}

export function extractEventType(payload: Record<string, unknown>): string {
  try {
    const data = payload as WhatsAppWebhookPayload;
    const change = data.entry?.[0]?.changes?.[0];
    if (change?.field) return change.field;
  } catch {
    return "whatsapp_webhook";
  }
  return "whatsapp_webhook";
}

export async function persistWebhookEvent(
  payload: Record<string, unknown>,
  client: PrismaClient = defaultPrisma,
): Promise<{ event: WebhookEvent; isDuplicate: boolean }> {
  const externalEventKey = extractExternalEventKey(payload);
  const eventType = extractEventType(payload);

  if (externalEventKey) {
    const existing = await client.webhookEvent.findFirst({
      where: {
        provider: "whatsapp",
        externalEventKey,
      },
    });

    if (existing) {
      return { event: existing, isDuplicate: true };
    }
  }

  const created = await client.webhookEvent.create({
    data: {
      provider: "whatsapp",
      externalEventKey,
      eventType,
      payload: payload as object,
      status: "PENDING",
      attempts: 0,
    },
  });

  return { event: created, isDuplicate: false };
}

export async function processWebhookEvent(
  eventId: string,
  client: PrismaClient = defaultPrisma,
): Promise<WebhookEvent> {
  return client.webhookEvent.update({
    where: { id: eventId },
    data: {
      status: "PROCESSED",
      processedAt: new Date(),
    },
  });
}
