"use server";

import { boardOnly, published } from "@/components/admin/server";
import { resetContent } from "@/lib/content/store";

/** Demo: throw away every edit and upload this visitor made in the admin. */
export async function resetAllContent() {
  await boardOnly();
  await resetContent();
  published();
}
