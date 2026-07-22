import {
  extractTokenFromRequest,
  verifySession,
} from "../../../../../src/domains/auth/session.ts";
import { assignConversation } from "../../../../../src/domains/conversations/index.ts";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = extractTokenFromRequest(request);
  const user = token ? await verifySession(token) : null;

  if (!user) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { assignedUserId } = body || {};

    if (!assignedUserId) {
      return Response.json(
        { error: "El operador de destino (assignedUserId) es requerido." },
        { status: 400 },
      );
    }

    const conversation = await assignConversation({
      conversationId: id,
      assignedUserId,
      actorUserId: user.id,
    });

    return Response.json({ status: "ok", conversation });
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
        : "Error al reasignar conversación.";
    return Response.json({ error: msg }, { status: 400 });
  }
}
