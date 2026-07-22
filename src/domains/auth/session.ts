import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE_NAME = "sc_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas

function getSecretKey(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.DATABASE_URL ||
    "santa_catalina_default_secret_key_2026"
  );
}

export interface AuthUser {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface SessionPayload {
  user: AuthUser;
  iat: number;
  exp: number;
}

function sign(payloadStr: string): string {
  const hmac = createHmac("sha256", getSecretKey());
  hmac.update(payloadStr);
  return hmac.digest("base64url");
}

export async function createSession(
  user: AuthUser,
): Promise<{ token: string; expiresAt: Date }> {
  const now = Date.now();
  const expiresAt = new Date(now + SESSION_DURATION_MS);

  const payload: SessionPayload = {
    user,
    iat: now,
    exp: expiresAt.getTime(),
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signature = sign(payloadBase64);
  const token = `${payloadBase64}.${signature}`;

  return { token, expiresAt };
}

export async function verifySession(token: string): Promise<AuthUser | null> {
  if (!token || !token.includes(".")) return null;
  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) return null;

  const expectedSignature = sign(payloadBase64);

  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expBuffer.length) return null;
  if (!timingSafeEqual(sigBuffer, expBuffer)) return null;

  try {
    const payloadJson = Buffer.from(payloadBase64, "base64url").toString(
      "utf8",
    );
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (Date.now() > payload.exp) return null;
    return payload.user;
  } catch {
    return null;
  }
}

export function getHeaderValue(req: Request, name: string): string | null {
  const headers = req?.headers;
  if (!headers) return null;
  if (typeof headers.get === "function") {
    return headers.get(name) || headers.get(name.toLowerCase());
  }
  const record = headers as unknown as Record<string, string | string[]>;
  const val = record[name] || record[name.toLowerCase()];
  return Array.isArray(val) ? val[0] : val || null;
}

export function extractTokenFromRequest(req: Request): string | null {
  // 1. Authorization header Bearer token
  const authHeader = getHeaderValue(req, "authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  // 2. Cookie sc_session
  const cookieHeader = getHeaderValue(req, "cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${SESSION_COOKIE_NAME}=`)) {
        return cookie.slice(SESSION_COOKIE_NAME.length + 1).trim();
      }
    }
  }

  return null;
}

export function buildSessionCookieHeader(
  token: string,
  expiresAt: Date,
): string {
  const isProd = process.env.NODE_ENV === "production";
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${
    isProd ? "; Secure" : ""
  }`;
}

export function buildClearSessionCookieHeader(): string {
  const isProd = process.env.NODE_ENV === "production";
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT${
    isProd ? "; Secure" : ""
  }`;
}
