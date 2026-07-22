import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;

/**
 * Genera un hash seguro utilizando scrypt y una sal aleatoria de 16 bytes.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Compara una contraseña en texto plano con el hash almacenado en tiempo constante.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, keyHex] = storedHash.split(":");
  if (!salt || !keyHex) return false;

  try {
    const keyBuffer = Buffer.from(keyHex, "hex");
    const derivedKey = (await scryptAsync(
      password,
      salt,
      keyBuffer.length,
    )) as Buffer;

    if (keyBuffer.length !== derivedKey.length) return false;
    return timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}
