import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";

const ADMIN_COOKIE_PREFIX = "kanto_admin";

function getSecret() {
  return process.env.ADMIN_COOKIE_SECRET ?? process.env.NEXTAUTH_SECRET ?? "kanto-dev-secret";
}

export function hashAdminPin(pin: string) {
  return createHash("sha256").update(`kanto-pin:${pin}`).digest("hex");
}

export function verifyAdminPin(pin: string, hash: string | null) {
  if (!hash) {
    return false;
  }

  const candidate = Buffer.from(hashAdminPin(pin));
  const expected = Buffer.from(hash);

  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function signSessionCode(sessionCode: string) {
  return createHash("sha256").update(`${sessionCode.toUpperCase()}:${getSecret()}`).digest("hex");
}

export function adminCookieName(sessionCode: string) {
  return `${ADMIN_COOKIE_PREFIX}_${sessionCode.toUpperCase()}`;
}

export async function setAdminCookie(sessionCode: string) {
  const code = sessionCode.toUpperCase();
  const cookieStore = await cookies();

  cookieStore.set(adminCookieName(code), `${code}.${signSessionCode(code)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function clearAdminCookie(sessionCode: string) {
  const cookieStore = await cookies();
  cookieStore.delete(adminCookieName(sessionCode));
}

export async function isAdminAuthenticated(sessionCode: string) {
  const code = sessionCode.toUpperCase();
  const cookieStore = await cookies();
  const value = cookieStore.get(adminCookieName(code))?.value;

  if (!value) {
    return false;
  }

  const [cookieCode, signature] = value.split(".");
  const expectedSignature = signSessionCode(code);

  return cookieCode === code && signature === expectedSignature;
}

export async function requireAdmin(sessionCode: string) {
  const authenticated = await isAdminAuthenticated(sessionCode);

  if (!authenticated) {
    throw new Error("Unauthorized admin");
  }
}