import {
  extractTokenFromRequest,
  verifySession,
} from "../../../src/domains/auth/session.ts";
import { listUsers, createOperator } from "../../../src/domains/users/index.ts";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = extractTokenFromRequest(request);
  const user = token ? await verifySession(token) : null;

  if (!user) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const users = await listUsers(user.organizationId);
  return Response.json({ status: "ok", users });
}

export async function POST(request: Request) {
  const token = extractTokenFromRequest(request);
  const user = token ? await verifySession(token) : null;

  if (!user) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, password, roleName } = body || {};

    if (!name || !email || !password || !roleName) {
      return Response.json(
        { error: "Nombre, email, contraseña y rol son obligatorios." },
        { status: 400 },
      );
    }

    const newUser = await createOperator(
      {
        organizationId: user.organizationId,
        name,
        email,
        password,
        roleName,
      },
      user.id,
    );

    return Response.json({ status: "ok", user: newUser }, { status: 201 });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Error al registrar usuario.";
    return Response.json({ error: msg }, { status: 400 });
  }
}
