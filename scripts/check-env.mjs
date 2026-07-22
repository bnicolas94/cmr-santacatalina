import { existsSync, readFileSync } from "node:fs";
import process from "node:process";

for (const filename of [".env", ".env.local"]) {
  if (!existsSync(filename)) continue;
  for (const line of readFileSync(filename, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (match && process.env[match[1]] === undefined)
      process.env[match[1]] = match[2];
  }
}

const required = ["APP_URL", "DATABASE_URL", "REDIS_URL"];
const missing = required.filter((name) => !process.env[name]?.trim());

if (missing.length) {
  console.error(
    `Faltan variables obligatorias: ${missing.join(", ")}. Copiá .env.example como .env.`,
  );
  process.exit(1);
}

for (const [name, protocols] of [
  ["APP_URL", ["http:", "https:"]],
  ["DATABASE_URL", ["postgresql:", "postgres:"]],
  ["REDIS_URL", ["redis:", "rediss:"]],
]) {
  let url;
  try {
    url = new URL(process.env[name]);
  } catch {
    throw new Error(`${name} debe ser una URL válida.`);
  }
  if (!protocols.includes(url.protocol))
    throw new Error(`${name} debe usar ${protocols.join(" o ")}.`);
}

console.log("Variables de entorno válidas.");
