import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "huellas_admin";
const SESSION_MESSAGE = "huellas-admin-session";

function adminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

// Sesión sin expiración ni base de datos: un HMAC determinístico del
// password de admin. Cambiar ADMIN_PASSWORD invalida todas las sesiones
// activas — esa es la única forma de "cerrar sesión en todos lados".
function signSession(password: string): string {
  return createHmac("sha256", password).update(SESSION_MESSAGE).digest("hex");
}

export function checkAdminPassword(candidate: string): boolean {
  const password = adminPassword();
  if (!password) return false;
  const expected = Buffer.from(password);
  const given = Buffer.from(candidate);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function adminSessionCookie() {
  const password = adminPassword();
  if (!password) return null;
  return {
    name: COOKIE_NAME,
    value: signSession(password),
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export async function hasAdminSession(): Promise<boolean> {
  const password = adminPassword();
  if (!password) return false;
  const store = await cookies();
  const cookieValue = store.get(COOKIE_NAME)?.value;
  if (!cookieValue) return false;
  const expected = Buffer.from(signSession(password));
  const given = Buffer.from(cookieValue);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
