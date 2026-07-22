import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "../../../../src/domains/auth/index.ts";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      customer: {
        include: { addresses: true },
      },
      assignedUser: {
        select: { id: true, name: true, email: true },
      },
      internalNotes: {
        include: {
          authorUser: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!conversation || conversation.organizationId !== user.organizationId) {
    return Response.json(
      { error: "Conversación no encontrada." },
      { status: 404 },
    );
  }

  return Response.json({ status: "ok", conversation });
}
