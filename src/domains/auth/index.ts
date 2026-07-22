import { PrismaClient } from "@prisma/client";
import { recordAuditLog } from "../audit/index.ts";
import { verifyPassword } from "./password.ts";
import {
  createSession,
  verifySession,
  extractTokenFromRequest,
  type AuthUser,
} from "./session.ts";

export { hashPassword, verifyPassword } from "./password.ts";
export {
  createSession,
  verifySession,
  extractTokenFromRequest,
  buildSessionCookieHeader,
  buildClearSessionCookieHeader,
  type AuthUser,
} from "./session.ts";

const defaultPrisma = new PrismaClient();

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContext {
  ip?: string | null;
  userAgent?: string | null;
}

export async function loginUser(
  credentials: LoginCredentials,
  context: AuthContext = {},
  client: PrismaClient = defaultPrisma,
): Promise<{ user: AuthUser; token: string; expiresAt: Date }> {
  const emailNorm = credentials.email.trim().toLowerCase();

  const user = await client.user.findUnique({
    where: { email: emailNorm },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.active) {
    if (user) {
      await recordAuditLog(
        {
          organizationId: user.organizationId,
          actorUserId: user.id,
          action: "auth:login_failed",
          entityType: "User",
          entityId: user.id,
          before: null,
          after: { reason: "User account inactive" },
          ip: context.ip,
          userAgent: context.userAgent,
        },
        client,
      );
    }
    throw new AuthError("Credenciales inválidas o usuario inactivo.", 401);
  }

  const isValid = await verifyPassword(credentials.password, user.passwordHash);
  if (!isValid) {
    await recordAuditLog(
      {
        organizationId: user.organizationId,
        actorUserId: user.id,
        action: "auth:login_failed",
        entityType: "User",
        entityId: user.id,
        before: null,
        after: { reason: "Invalid password" },
        ip: context.ip,
        userAgent: context.userAgent,
      },
      client,
    );
    throw new AuthError("Credenciales inválidas o usuario inactivo.", 401);
  }

  await client.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const roles = user.userRoles.map((ur) => ur.role.name);
  const permissionsSet = new Set<string>();
  for (const ur of user.userRoles) {
    for (const rp of ur.role.rolePermissions) {
      permissionsSet.add(rp.permission.key);
    }
  }

  const authUser: AuthUser = {
    id: user.id,
    organizationId: user.organizationId,
    name: user.name,
    email: user.email,
    roles,
    permissions: Array.from(permissionsSet),
  };

  const { token, expiresAt } = await createSession(authUser);

  await recordAuditLog(
    {
      organizationId: user.organizationId,
      actorUserId: user.id,
      action: "auth:login",
      entityType: "User",
      entityId: user.id,
      before: null,
      after: { email: user.email, roles },
      ip: context.ip,
      userAgent: context.userAgent,
    },
    client,
  );

  return { user: authUser, token, expiresAt };
}

export async function logoutUser(
  token: string,
  context: AuthContext = {},
  client: PrismaClient = defaultPrisma,
): Promise<void> {
  const user = await verifySession(token);
  if (user) {
    await recordAuditLog(
      {
        organizationId: user.organizationId,
        actorUserId: user.id,
        action: "auth:logout",
        entityType: "User",
        entityId: user.id,
        before: null,
        after: { email: user.email },
        ip: context.ip,
        userAgent: context.userAgent,
      },
      client,
    );
  }
}

export async function getCurrentUser(req: Request): Promise<AuthUser | null> {
  const token = extractTokenFromRequest(req);
  if (!token) return null;
  return verifySession(token);
}

export function hasPermission(user: AuthUser, permissionKey: string): boolean {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permissionKey);
}
