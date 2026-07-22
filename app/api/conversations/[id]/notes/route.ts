import {
  extractTokenFromRequest,
  verifySession,
} from "../../../../../src/domains/auth/session.ts";
import {
  listInternalNotes,
  addInternalNote,
} from "../../../../../src/domains/conversations/index.ts";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = extractTokenFromRequest(request);
  const user = token ? await verifySession(token) : null;

  if (!user) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const notes = await listInternalNotes(id);
  return Response.json({ status: "ok", notes });
}

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
    const { body: noteBody } = body || {};

    if (!noteBody || !noteBody.trim()) {
      return Response.json(
        { error: "El contenido de la nota interna es requerido." },
        { status: 400 },
      );
    }

    const note = await addInternalNote({
      conversationId: id,
      authorUserId: user.id,
      body: noteBody.trim(),
    });

    return Response.json({ status: "ok", note }, { status: 201 });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Error al guardar nota.";
    return Response.json({ error: msg }, { status: 400 });
  }
}
