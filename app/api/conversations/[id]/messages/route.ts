import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "../../../../../src/domains/auth/index.ts";
import { sendOutboundMessage } from "../../../../../src/domains/conversations/index.ts";

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

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: {
      sentByUser: {
        select: { id: true, name: true, email: true },
      },
      media: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ status: "ok", messages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { text } = body || {};

  if (!text || typeof text !== "string" || !text.trim()) {
    return Response.json(
      { error: "El texto del mensaje es obligatorio." },
      { status: 400 },
    );
  }

  try {
    const message = await sendOutboundMessage({
      conversationId: id,
      text: text.trim(),
      sentByUserId: user.id,
    });

    return Response.json({ status: "ok", message }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Error enviando mensaje.",
      },
      { status: 400 },
    );
  }
}
