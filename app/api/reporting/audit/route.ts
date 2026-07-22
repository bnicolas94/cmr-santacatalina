import {
  getCurrentUser,
  hasPermission,
} from "../../../../src/domains/auth/index.ts";
import { getAuditLogsReport } from "../../../../src/domains/reporting/index.ts";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  if (!hasPermission(user, "audit:read")) {
    return Response.json(
      { error: "No posee permisos para ver registros de auditoría." },
      { status: 403 },
    );
  }

  const auditLogs = await getAuditLogsReport(user.organizationId);

  return Response.json({ status: "ok", auditLogs });
}
