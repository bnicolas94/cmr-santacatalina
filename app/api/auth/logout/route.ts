import {
  logoutUser,
  extractTokenFromRequest,
  buildClearSessionCookieHeader,
} from "../../../../src/domains/auth/index.ts";

export async function POST(request: Request) {
  const token = extractTokenFromRequest(request);
  const ip = request.headers.get("x-forwarded-for") || null;
  const userAgent = request.headers.get("user-agent") || null;

  if (token) {
    await logoutUser(token, { ip, userAgent });
  }

  const cookieHeader = buildClearSessionCookieHeader();

  return Response.json(
    { status: "ok", message: "Sesión cerrada correctamente." },
    {
      status: 200,
      headers: {
        "Set-Cookie": cookieHeader,
      },
    },
  );
}
