import {
  loginUser,
  AuthError,
  buildSessionCookieHeader,
} from "../../../../src/domains/auth/index.ts";

export const runtime = "nodejs";

function getHeader(request: Request, name: string): string | null {
  const headers = request?.headers;
  if (!headers) return null;
  if (typeof headers.get === "function") {
    return headers.get(name) || headers.get(name.toLowerCase());
  }
  const record = headers as unknown as Record<string, string | string[]>;
  const val = record[name] || record[name.toLowerCase()];
  return Array.isArray(val) ? val[0] : val || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return Response.json(
        { error: "Email y contraseña son obligatorios." },
        { status: 400 },
      );
    }

    const ip = getHeader(request, "x-forwarded-for");
    const userAgent = getHeader(request, "user-agent");

    const { user, token, expiresAt } = await loginUser(
      { email, password },
      { ip, userAgent },
    );

    const cookieHeader = buildSessionCookieHeader(token, expiresAt);

    return Response.json(
      { status: "ok", user, token },
      {
        status: 200,
        headers: {
          "Set-Cookie": cookieHeader,
        },
      },
    );
  } catch (error: unknown) {
    console.error("DEBUG LOGIN ERROR TRACE:", error);
    const err = error as {
      name?: string;
      statusCode?: number;
      message?: string;
    };
    if (
      error instanceof AuthError ||
      err?.name === "AuthError" ||
      typeof err?.statusCode === "number"
    ) {
      return Response.json(
        { error: err.message || "Credenciales inválidas o usuario inactivo." },
        { status: err.statusCode || 401 },
      );
    }

    return Response.json(
      {
        error:
          "Error interno del servidor al procesar el inicio de sesión: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    );
  }
}
