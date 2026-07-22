import {
  loginUser,
  AuthError,
  buildSessionCookieHeader,
} from "../../../../src/domains/auth/index.ts";

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

    const ip = request.headers.get("x-forwarded-for") || null;
    const userAgent = request.headers.get("user-agent") || null;

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
    const err = error as { name?: string; statusCode?: number; message?: string };
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

    console.error("Error en POST /api/auth/login:", error);
    return Response.json(
      { error: "Error interno del servidor al procesar el inicio de sesión." },
      { status: 500 },
    );
  }
}
