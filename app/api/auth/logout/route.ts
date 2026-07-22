import {
  logoutUser,
  extractTokenFromRequest,
  buildClearSessionCookieHeader,
} from "../../../../src/domains/auth/index.ts";
import { getHeaderValue } from "../../../../src/domains/auth/session.ts";

export async function POST(request: Request) {
  const token = extractTokenFromRequest(request);
  const ip = getHeaderValue(request, "x-forwarded-for");
  const userAgent = getHeaderValue(request, "user-agent");

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
