"use server";

import { boardOnly, invalid, published, saved } from "@/components/admin/server";
import { savePageTexts } from "@/lib/content/pages";
import { getPageTextsDef } from "@/lib/data/pages";

/** Save one page's texts. Fields left as the original are not stored, so later default changes still apply. */
export async function savePageTextsAction(pageId: string, data: FormData) {
  await boardOnly();
  const def = getPageTextsDef(pageId);
  if (!def) return invalid({}, "Sidan finns inte.");
  const edited: Record<string, string> = {};
  const errors: Record<string, string> = {};
  for (const section of def.sections) {
    for (const f of section.fields) {
      const raw = data.get(f.key);
      if (typeof raw !== "string") continue;
      // Keep the editor's line breaks, but not stray spaces at the ends.
      const value = raw.replace(/\r\n/g, "\n").trim();
      if (!value && !f.optional) {
        errors[f.key] = "Fältet kan inte vara tomt. Vill du ha originaltexten, tryck ”Återställ originaltexten”.";
      } else if (value !== f.value) edited[f.key] = value;
    }
  }
  if (Object.keys(errors).length) return invalid(errors);
  await savePageTexts(pageId, edited);
  published();
  return saved(`Texterna på ${def.label} är sparade.`);
}
