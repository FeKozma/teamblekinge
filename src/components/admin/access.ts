import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

/**
 * Admin access, checked in the admin layout and again in pages that show
 * data (layouts don't re-run on every navigation). No session → log in and
 * come back; a member who isn't on the board → null (the layout shows
 * "Bara för styrelsen").
 */
export async function requireBoard() {
  const user = await getSession();
  if (!user) redirect("/logga-in?next=/admin/dokument");
  return user.role === "board" ? user : null;
}
