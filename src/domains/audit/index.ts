import { PrismaClient, Prisma, type AuditLog } from "@prisma/client";

const defaultPrisma = new PrismaClient();

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "password_hash",
  "token",
  "secret",
  "accesstoken",
  "refreshtoken",
  "authorization",
]);

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = sanitizeValue(val);
    }
  }
  return sanitized;
}

export interface RecordAuditParams {
  organizationId: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

export interface QueryAuditParams {
  organizationId: string;
  actorUserId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  limit?: number;
  offset?: number;
}

export async function recordAuditLog(
  params: RecordAuditParams,
  client: PrismaClient = defaultPrisma,
): Promise<AuditLog> {
  const sanitizedBefore = params.before
    ? (sanitizeValue(params.before) as Prisma.InputJsonValue)
    : Prisma.JsonNull;
  const sanitizedAfter = params.after
    ? (sanitizeValue(params.after) as Prisma.InputJsonValue)
    : Prisma.JsonNull;

  return client.auditLog.create({
    data: {
      organizationId: params.organizationId,
      actorUserId: params.actorUserId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      before: sanitizedBefore,
      after: sanitizedAfter,
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
    },
  });
}

export async function queryAuditLogs(
  params: QueryAuditParams,
  client: PrismaClient = defaultPrisma,
): Promise<{ items: AuditLog[]; total: number }> {
  const where: Prisma.AuditLogWhereInput = {
    organizationId: params.organizationId,
    ...(params.actorUserId ? { actorUserId: params.actorUserId } : {}),
    ...(params.entityType ? { entityType: params.entityType } : {}),
    ...(params.entityId ? { entityId: params.entityId } : {}),
    ...(params.action ? { action: params.action } : {}),
  };

  const limit = Math.min(params.limit ?? 50, 100);
  const offset = params.offset ?? 0;

  const [items, total] = await Promise.all([
    client.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        actorUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    client.auditLog.count({ where }),
  ]);

  return { items, total };
}
