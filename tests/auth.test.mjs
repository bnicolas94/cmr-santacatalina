import assert from "node:assert/strict";
import test from "node:test";
import { db as prisma } from "../src/infrastructure/db.ts";
import {
  hashPassword,
  verifyPassword,
  createSession,
  verifySession,
  loginUser,
  logoutUser,
  hasPermission,
  AuthError,
} from "../src/domains/auth/index.ts";
import { POST as loginRoute } from "../app/api/auth/login/route.ts";
import { POST as logoutRoute } from "../app/api/auth/logout/route.ts";
import { GET as sessionRoute } from "../app/api/auth/session/route.ts";

test("hashing y verificación de contraseñas", async () => {
  const plain = "PasswordSegura123!";
  const hash = await hashPassword(plain);

  assert.ok(hash.includes(":"));
  assert.equal(await verifyPassword(plain, hash), true);
  assert.equal(await verifyPassword("PasswordIncorrecta", hash), false);
});

test("creación y verificación de tokens de sesión", async () => {
  const mockUser = {
    id: "usr_123",
    organizationId: "org_123",
    name: "Juan Pérez",
    email: "juan@santacatalina.local",
    roles: ["TELEFONISTA"],
    permissions: ["conversations:read", "orders:create"],
  };

  const { token, expiresAt } = await createSession(mockUser);
  assert.ok(token);
  assert.ok(expiresAt > new Date());

  const verified = await verifySession(token);
  assert.ok(verified);
  assert.equal(verified.id, "usr_123");
  assert.equal(verified.email, "juan@santacatalina.local");
  assert.deepEqual(verified.permissions, [
    "conversations:read",
    "orders:create",
  ]);

  assert.equal(await verifySession("token_invalido"), null);
});

test("loginUser exitoso para el usuario admin con credenciales correctas", async () => {
  const result = await loginUser(
    { email: "admin@santacatalina.local", password: "Admin123!" },
    { ip: "127.0.0.1", userAgent: "TestRunner" },
    prisma,
  );

  assert.ok(result.user);
  assert.equal(result.user.email, "admin@santacatalina.local");
  assert.ok(result.user.roles.includes("ADMINISTRADOR"));
  assert.ok(result.token);

  // Verificar actualización de lastLoginAt
  const dbUser = await prisma.user.findUnique({
    where: { email: "admin@santacatalina.local" },
  });
  assert.ok(dbUser?.lastLoginAt);

  // Verificar auditoría auth:login
  const audit = await prisma.auditLog.findFirst({
    where: { action: "auth:login", actorUserId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(audit);
});

test("loginUser falla y audita contraseña incorrecta o usuario inactivo", async () => {
  await assert.rejects(
    async () => {
      await loginUser(
        { email: "admin@santacatalina.local", password: "ContraseñaErronea" },
        { ip: "127.0.0.1" },
        prisma,
      );
    },
    (err) => err instanceof AuthError && err.statusCode === 401,
  );

  const audit = await prisma.auditLog.findFirst({
    where: { action: "auth:login_failed" },
    orderBy: { createdAt: "desc" },
  });
  assert.ok(audit);
});

test("evaluación de permisos con hasPermission", () => {
  const adminUser = {
    id: "1",
    organizationId: "1",
    name: "Admin",
    email: "a@b.com",
    roles: ["ADMINISTRADOR"],
    permissions: ["org:write", "users:write"],
  };

  assert.equal(hasPermission(adminUser, "org:write"), true);
  assert.equal(hasPermission(adminUser, "catalog:write"), false);
});

test("rutas API /api/auth/login, /api/auth/session y /api/auth/logout", async () => {
  // 1. POST /api/auth/login
  const loginReq = new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@santacatalina.local",
      password: "Admin123!",
    }),
  });

  const loginRes = await loginRoute(loginReq);
  assert.equal(loginRes.status, 200);
  const loginBody = await loginRes.json();
  assert.equal(loginBody.status, "ok");
  assert.ok(loginBody.token);
  assert.equal(loginBody.user.email, "admin@santacatalina.local");

  const setCookie = loginRes.headers.get("Set-Cookie");
  assert.ok(setCookie?.includes("sc_session="));

  // 2. GET /api/auth/session con Cookie
  const sessionReq = new Request("http://localhost/api/auth/session", {
    headers: { Cookie: `sc_session=${loginBody.token}` },
  });

  const sessionRes = await sessionRoute(sessionReq);
  assert.equal(sessionRes.status, 200);
  const sessionBody = await sessionRes.json();
  assert.equal(sessionBody.status, "ok");
  assert.equal(sessionBody.user.email, "admin@santacatalina.local");

  // 3. Prueba directa de logoutUser y POST /api/auth/logout
  await logoutUser(loginBody.token, { ip: "127.0.0.1" });

  const logoutReq = new Request("http://localhost/api/auth/logout", {
    method: "POST",
    headers: { Cookie: `sc_session=${loginBody.token}` },
  });

  const logoutRes = await logoutRoute(logoutReq);
  assert.equal(logoutRes.status, 200);
  const logoutSetCookie = logoutRes.headers.get("Set-Cookie");
  assert.ok(logoutSetCookie?.includes("Expires=Thu, 01 Jan 1970"));
});
