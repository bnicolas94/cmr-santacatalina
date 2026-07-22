import {
  verifyWebhookChallenge,
  validateWebhookSignature,
  persistWebhookEvent,
} from "../../../../src/domains/whatsapp/index.ts";
import {
  processInboundWebhookMessage,
  processWebhookStatusUpdate,
} from "../../../../src/domains/conversations/index.ts";

import { getHeaderValue } from "../../../../src/domains/auth/session.ts";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const hubMode = url.searchParams.get("hub.mode");
  const hubVerifyToken = url.searchParams.get("hub.verify_token");
  const hubChallenge = url.searchParams.get("hub.challenge");

  const { valid, challenge } = verifyWebhookChallenge(
    hubMode,
    hubVerifyToken,
    hubChallenge,
  );

  if (valid && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return Response.json(
    { error: "Token de verificación de webhook inválido." },
    { status: 403 },
  );
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signatureHeader = getHeaderValue(request, "x-hub-signature-256");

    const isValidSignature = validateWebhookSignature(rawBody, signatureHeader);
    if (!isValidSignature) {
      return Response.json(
        { error: "Firma HMAC de webhook inválida." },
        { status: 401 },
      );
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return Response.json(
        { error: "Payload JSON de webhook inválido." },
        { status: 400 },
      );
    }

    const { event, isDuplicate } = await persistWebhookEvent(payload);

    if (!isDuplicate) {
      // Procesar mensaje entrante o actualización de estado en segundo plano
      Promise.all([
        processInboundWebhookMessage(payload),
        processWebhookStatusUpdate(payload),
      ]).catch((err) =>
        console.error("Error procesando mensaje de webhook:", err),
      );
    }

    return Response.json({
      status: "ok",
      eventId: event.id,
      isDuplicate,
    });
  } catch (error) {
    console.error("Error al recibir webhook de WhatsApp:", error);
    return Response.json(
      { error: "Error procesando recepción de webhook." },
      { status: 500 },
    );
  }
}
