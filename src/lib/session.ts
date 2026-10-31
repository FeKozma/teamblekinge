import "server-only";
import { cookies } from "next/headers";
import { demoUsers, type DemoUser } from "@/lib/data/users";

// DEMO login: a plain cookie naming one of the demo users. The real site will
// use Auth.js with e-mail magic links + passkeys (as in the login drawup), and
// check access against the database on every request.
export const SESSION_COOKIE = "tb_demo_user";

export async function getSession(): Promise<DemoUser | null> {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  return (id && demoUsers[id]) || null;
}
