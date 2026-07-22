import assert from "node:assert/strict";
import test from "node:test";
import { db as prisma } from "../src/infrastructure/db.ts";
import {
  getDashboardMetrics,
  getAuditLogsReport,
} from "../src/domains/reporting/index.ts";
import { loginUser } from "../src/domains/auth/index.ts";
import { GET as getMetricsRoute } from "../app/api/reporting/metrics/route.ts";
import { GET as getAuditRoute } from "../app/api/reporting/audit/route.ts";

test("getDashboardMetrics y getAuditLogsReport calculan indicadores de negocio", async () => {
  const org = await prisma.organization.findFirst();
  assert.ok(org);

  const metrics = await getDashboardMetrics(org.id, prisma);
  assert.ok(typeof metrics.totalCustomers === "number");
  assert.ok(typeof metrics.activeConversations === "number");
  assert.ok(typeof metrics.ordersTodayCount === "number");
  assert.ok(typeof metrics.revenueToday === "number");

  const auditLogs = await getAuditLogsReport(org.id, 10, prisma);
  assert.ok(Array.isArray(auditLogs));
});

test("rutas API /api/reporting/metrics y /api/reporting/audit", async () => {
  const authRes = await loginUser({
    email: "admin@santacatalina.local",
    password: "Admin123!",
  });

  // 1. GET /api/reporting/metrics
  const metricsReq = new Request("http://localhost/api/reporting/metrics", {
    headers: { Cookie: `sc_session=${authRes.token}` },
  });
  const metricsRes = await getMetricsRoute(metricsReq);
  assert.equal(metricsRes.status, 200);
  const metricsBody = await metricsRes.json();
  assert.equal(metricsBody.status, "ok");
  assert.ok(metricsBody.metrics);

  // 2. GET /api/reporting/audit
  const auditReq = new Request("http://localhost/api/reporting/audit", {
    headers: { Cookie: `sc_session=${authRes.token}` },
  });
  const auditRes = await getAuditRoute(auditReq);
  assert.equal(auditRes.status, 200);
  const auditBody = await auditRes.json();
  assert.equal(auditBody.status, "ok");
  assert.ok(Array.isArray(auditBody.auditLogs));
});
