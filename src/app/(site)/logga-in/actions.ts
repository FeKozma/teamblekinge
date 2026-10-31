"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/session";
import { demoUsers } from "@/lib/data/users";

// DEMO auth. Real login = Auth.js magic link (e-mail) + passkeys; see README.

function safeNext(next: FormDataEntryValue | null) {
  const n = typeof next === "string" ? next : "";
  // Only same-site paths, never protocol-relative URLs.
  return n.startsWith("/") && !n.startsWith("//") ? n : "/";
}

async function setSession(userId: string) {
  (await cookies()).set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

/** Log in as one of the demo users (used by the magic-link and passkey buttons). */
export async function loginAs(formData: FormData) {
  const id = String(formData.get("user") ?? "ingrid");
  await setSession(demoUsers[id] ? id : "ingrid");
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}
