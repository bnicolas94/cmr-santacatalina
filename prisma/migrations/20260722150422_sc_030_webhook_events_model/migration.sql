-- CreateTable
CREATE TABLE "public"."webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'whatsapp',
    "external_event_key" TEXT,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "processed_at" TIMESTAMP(3),
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webhook_events_provider_external_event_key_idx" ON "public"."webhook_events"("provider", "external_event_key");

-- CreateIndex
CREATE INDEX "webhook_events_status_idx" ON "public"."webhook_events"("status");

-- CreateIndex
CREATE INDEX "webhook_events_created_at_idx" ON "public"."webhook_events"("created_at");
