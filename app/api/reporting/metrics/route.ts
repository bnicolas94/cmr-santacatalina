import {
  getCurrentUser,
  hasPermission,
} from "../../../../src/domains/auth/index.ts";
import { getDashboardMetrics } from "../../../../src/domains/reporting/index.ts";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return Response.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  if (!hasPermission(user, "reports:read")) {
    return Response.json(
      { error: "No posee permisos para ver reportes y métricas." },
      { status: 403 },
    );
  }

  const metrics = await getDashboardMetrics(user.organizationId);

  return Response.json({ status: "ok", metrics });
}
