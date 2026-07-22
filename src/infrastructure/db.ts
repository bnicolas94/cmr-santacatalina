import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pgPkg from "pg";

type PgPoolConstructor = new (config?: pgPkg.PoolConfig) => pgPkg.Pool;
const Pool = (pgPkg.Pool ||
  (pgPkg as unknown as { default: { Pool: PgPoolConstructor } }).default
    ?.Pool) as PgPoolConstructor;

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/santa_catalina?schema=public";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pgPkg.Pool | undefined;
};

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
  });

const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.pool = pool;
}
