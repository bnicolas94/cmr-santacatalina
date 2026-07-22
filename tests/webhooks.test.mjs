import assert from "node:assert/strict";
import test from "node:test";
import { createHmac } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import {
  verifyWebhookChallenge,
  validateWebhookSignature,
  persistWebhookEvent,
} from "../src/domains/whatsapp/index.ts";
import {
  GET as webhookGetRoute,
  POST as webhookPostRoute,
} from "../app/api/webhooks/whatsapp/route.ts";

test("verifyWebhookChallenge aprueba únicamente el token correcto", () => {
  const defaultToken = "santa_catalina_webhook_token";
  const result = verifyWebhookChallenge(
    "subscribe",
    defaultToken,
    "challenge_12345",
  );
  assert.equal(result.valid, true);
  assert.equal(result.challenge, "challenge_12345");

  const invalid = verifyWebhookChallenge(
    "subscribe",
    "invalid_token",
    "challenge_12345",
  );
  assert.equal(invalid.valid, false);
});

test("validateWebhookSignature verifica firmas HMAC SHA-256", () => {
  process.env.WHATSAPP_APP_SECRET = "test_app_secret_123";
  const rawBody = JSON.stringify({ event: "test" });

  const hmac = createHmac("sha256", "test_app_secret_123");
  hmac.update(rawBody, "utf8");
  const validSig = `sha256=${hmac.digest("hex")}`;

  assert.equal(validateWebhookSignature(rawBody, validSig), true);
  assert.equal(
    validateWebhookSignature(rawBody, "sha256=invalid_hex_sig"),
    false,
  );

  delete process.env.WHATSAPP_APP_SECRET;
});

test("persistWebhookEvent guarda eventos en bruto y aplica idempotencia por wamid", async () => {
  const prisma = new PrismaClient();
  try {
    const wamid = `wamid.HBgLMTIzNDU2Nzg5MDFWAgASGBQzQTFFN0E3QjREOUY5RkU3RjE1AA_${Date.now()}`;
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "waba_123",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                messages: [
                  {
                    id: wamid,
                    from: "5491112345678",
                    timestamp: "1721660000",
                    text: { body: "Hola Santa Catalina!" },
                    type: "text",
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    // 1. Inserción inicial
    const res1 = await persistWebhookEvent(payload, prisma);
    assert.equal(res1.isDuplicate, false);
    assert.ok(res1.event.id);
    assert.equal(res1.event.externalEventKey, wamid);
    assert.equal(res1.event.status, "PENDING");

    // 2. Reintento con el mismo wamid (Idempotencia)
    const res2 = await persistWebhookEvent(payload, prisma);
    assert.equal(res2.isDuplicate, true);
    assert.equal(res2.event.id, res1.event.id);
  } finally {
    await prisma.$disconnect();
  }
});

test("GET /api/webhooks/whatsapp responde con el desafío de verificación de Meta", async () => {
  const req = new Request(
    "http://localhost/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=santa_catalina_webhook_token&hub.challenge=test_challenge_code",
  );
  const res = await webhookGetRoute(req);
  assert.equal(res.status, 200);
  assert.equal(await res.text(), "test_challenge_code");
});

test("POST /api/webhooks/whatsapp persiste el evento entrante y responde 200 OK", async () => {
  const wamid = `wamid.POST_TEST_${Date.now()}`;
  const payload = {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "waba_456",
        changes: [
          {
            field: "messages",
            value: {
              messages: [{ id: wamid, text: { body: "Test POST" } }],
            },
          },
        ],
      },
    ],
  };

  const req = new Request("http://localhost/api/webhooks/whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const res = await webhookPostRoute(req);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "ok");
  assert.ok(body.eventId);
  assert.equal(body.isDuplicate, false);
});
