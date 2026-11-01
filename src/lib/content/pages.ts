import "server-only";
import { getPageTextsDef } from "@/lib/data/pages";
import { readCollection, writeCollection } from "./store";

// Edited page texts: { [pageId]: { [fieldKey]: text } }. Only what the board
// has changed is stored; everything else falls back to the text in
// lib/data/pages.

const KEY = "page-texts";

type Stored = Record<string, Record<string, string>>;

export const getStoredPageTexts = () => readCollection<Stored>(KEY, () => ({}));

/** Replace one page's edited texts (only keys that differ from the default). */
export async function savePageTexts(pageId: string, edited: Record<string, string>) {
  const all = await getStoredPageTexts();
  if (Object.keys(edited).length) all[pageId] = edited;
  else delete all[pageId];
  await writeCollection(KEY, all);
}

/**
 * A page's texts: `t("hero.title")`. An unknown key throws, so a typo shows up
 * at once instead of as an empty heading.
 */
export async function getPageTexts(pageId: string) {
  const def = getPageTextsDef(pageId);
  if (!def) throw new Error(`No page texts defined for "${pageId}"`);
  const edited = (await getStoredPageTexts())[pageId] ?? {};
  const values = new Map<string, string>();
  for (const s of def.sections) for (const f of s.fields) values.set(f.key, edited[f.key] ?? f.value);
  return (key: string) => {
    const v = values.get(key);
    if (v === undefined) throw new Error(`Unknown text "${key}" on page "${pageId}" — add it to lib/data/pages`);
    return v;
  };
}
