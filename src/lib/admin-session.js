import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "bmp-admin-session";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

const SECRET = process.env.ADMIN_SESSION_SECRET || "";

function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createAdminToken(id) {
  const payload = Buffer.from(
    JSON.stringify({ id, role: "admin", exp: Date.now() + ADMIN_COOKIE_MAX_AGE * 1000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token) {
  if (!token || !SECRET) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data?.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

// For server components / route handlers: is the current request an authenticated admin?
export async function isAdminRequest() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!verifyAdminToken(token);
}
