import { getCurrentUser } from "../../../../src/domains/auth/index.ts";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);

  if (!user) {
    return Response.json(
      { error: "No hay sesión activa o la sesión ha expirado." },
      { status: 401 },
    );
  }

  return Response.json({ status: "ok", user });
}
