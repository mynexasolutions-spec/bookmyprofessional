"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminToken, ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE } from "@/lib/admin-session";

export async function adminLogin(_prevState, formData) {
  const id = String(formData.get("id") || "").trim();
  const password = String(formData.get("password") || "");

  const expectedId = process.env.ADMIN_ID || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";

  if (!expectedId || !expectedPassword) {
    return { error: "Admin credentials are not configured on the server." };
  }
  if (id !== expectedId || password !== expectedPassword) {
    return { error: "Invalid admin credentials." };
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, createAdminToken(id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });

  redirect("/admin");
}

export async function adminLogout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
