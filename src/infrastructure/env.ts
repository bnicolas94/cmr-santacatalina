const requiredNames = ["APP_URL", "DATABASE_URL", "REDIS_URL"] as const;

export type AppEnv = Record<(typeof requiredNames)[number], string>;

export function readEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const missing = requiredNames.filter((name) => !source[name]?.trim());
  if (missing.length)
    throw new Error(`Faltan variables obligatorias: ${missing.join(", ")}`);
  return Object.fromEntries(
    requiredNames.map((name) => [name, source[name]!]),
  ) as AppEnv;
}
