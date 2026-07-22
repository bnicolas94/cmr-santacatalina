import {
  extractTokenFromRequest,
  verifySession,
} from "../../../../src/domains/auth/session.ts";
import { deleteQuickReply } from "../../../../src/domains/quick-replies/index.ts";

export const runtime = "nodejs";

export async function DELETE(
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
    await deleteQuickReply(id, user.organizationId, user.id);
    return Response.json({
      status: "ok",
      message: "Respuesta rápida eliminada.",
    });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Error al eliminar plantilla.";
    return Response.json({ error: msg }, { status: 400 });
  }
}
