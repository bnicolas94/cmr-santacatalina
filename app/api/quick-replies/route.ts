import {
  extractTokenFromRequest,
  verifySession,
} from "../../../src/domains/auth/session.ts";
import {
  listQuickReplies,
  createQuickReply,
} from "../../../src/domains/quick-replies/index.ts";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = extractTokenFromRequest(request);
  const user = token ? await verifySession(token) : null;

  if (!user) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const replies = await listQuickReplies(user.organizationId);
  return Response.json({ status: "ok", quickReplies: replies });
}

export async function POST(request: Request) {
  const token = extractTokenFromRequest(request);
  const user = token ? await verifySession(token) : null;

  if (!user) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { shortcut, title, content, category } = body || {};

    if (!shortcut || !title || !content) {
      return Response.json(
        { error: "Atajo (/shortcut), título y contenido son requeridos." },
        { status: 400 },
      );
    }

    const reply = await createQuickReply(
      {
        organizationId: user.organizationId,
        shortcut,
        title,
        content,
        category,
      },
      user.id,
    );

    return Response.json({ status: "ok", quickReply: reply }, { status: 201 });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Error al crear plantilla.";
    return Response.json({ error: msg }, { status: 400 });
  }
}
