import { PrismaClient } from "@prisma/client";
import { recordAuditLog } from "../audit/index.ts";
import { hashPassword } from "../auth/password.ts";
import { db as defaultPrisma } from "../../infrastructure/db.ts";

export interface CreateUserData {
  organizationId: string;
  name: string;
  email: string;
  password: string;
  roleName: "TELEFONISTA" | "SUPERVISOR" | "ADMINISTRADOR";
}

export async function listUsers(
  organizationId: string,
  client: PrismaClient = defaultPrisma,
) {
  return client.user.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
      userRoles: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createOperator(
  data: CreateUserData,
  actorUserId?: string,
  client: PrismaClient = defaultPrisma,
) {
  const emailNorm = data.email.trim().toLowerCase();

  const existing = await client.user.findUnique({
    where: { email: emailNorm },
  });

  if (existing) {
    throw new Error("El correo electrónico ya se encuentra registrado.");
  }

  const passwordHash = await hashPassword(data.password);

  // Buscar rol
  const role = await client.role.findFirst({
    where: {
      name: data.roleName,
    },
  });

  if (!role) {
    throw new Error(`El rol ${data.roleName} no existe en la organización.`);
  }

  const user = await client.user.create({
    data: {
      organizationId: data.organizationId,
      name: data.name.trim(),
      email: emailNorm,
      passwordHash,
      active: true,
      userRoles: {
        create: {
          roleId: role.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      createdAt: true,
    },
  });

  await recordAuditLog(
    {
      organizationId: data.organizationId,
      actorUserId,
      action: "user:create",
      entityType: "User",
      entityId: user.id,
      before: null,
      after: { user, role: data.roleName },
    },
    client,
  );

  return user;
}
