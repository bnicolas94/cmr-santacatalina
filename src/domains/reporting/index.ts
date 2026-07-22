import { PrismaClient, type AuditLog } from "@prisma/client";

const defaultPrisma = new PrismaClient();

export interface DashboardMetrics {
  totalCustomers: number;
  activeConversations: number;
  ordersTodayCount: number;
  revenueToday: number;
  ordersByStatus: Record<string, number>;
}

export async function getDashboardMetrics(
  organizationId: string,
  client: PrismaClient = defaultPrisma,
): Promise<DashboardMetrics> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalCustomers, activeConversations, ordersToday, ordersByStatusRaw] =
    await Promise.all([
      client.customer.count({
        where: { organizationId },
      }),

      client.conversation.count({
        where: {
          organizationId,
          status: {
            in: ["NUEVA", "ASIGNADA", "EN_ATENCION", "ESPERANDO_CLIENTE"],
          },
        },
      }),

      client.order.findMany({
        where: {
          organizationId,
          createdAt: { gte: startOfDay },
          status: { not: "CANCELADO" },
        },
        select: { total: true, status: true },
      }),

      client.order.groupBy({
        by: ["status"],
        where: { organizationId },
        _count: { status: true },
      }),
    ]);

  const revenueToday = ordersToday.reduce(
    (acc, order) => acc + Number(order.total),
    0,
  );

  const ordersByStatus: Record<string, number> = {};
  for (const group of ordersByStatusRaw) {
    ordersByStatus[group.status] = group._count.status;
  }

  return {
    totalCustomers,
    activeConversations,
    ordersTodayCount: ordersToday.length,
    revenueToday,
    ordersByStatus,
  };
}

export async function getAuditLogsReport(
  organizationId: string,
  limit = 50,
  client: PrismaClient = defaultPrisma,
): Promise<AuditLog[]> {
  return client.auditLog.findMany({
    where: { organizationId },
    include: {
      actorUser: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
