import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "../../../src/domains/auth/index.ts";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  const conversations = await prisma.conversation.findMany({
    where: {
      organizationId: user.organizationId,
      ...(status ? { status } : {}),
    },
    include: {
      customer: true,
      assignedUser: {
        select: { id: true, name: true, email: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return Response.json({ status: "ok", conversations });
}
