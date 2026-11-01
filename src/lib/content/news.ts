import "server-only";
import { news as seed, visibleNews, type NewsItem } from "@/lib/data/news";
import { readCollection, writeCollection } from "./store";

const KEY = "news";

/** Every news item, as last saved in the admin. */
export function getAllNews() {
  return readCollection<NewsItem[]>(KEY, () => seed);
}

export function saveAllNews(items: NewsItem[]) {
  return writeCollection(KEY, items);
}

/** Newest first; hides members-only items for guests. */
export async function listNews(opts: { members?: boolean } = {}) {
  return visibleNews(await getAllNews(), opts);
}

export async function getNews(slug: string) {
  return (await getAllNews()).find((n) => n.slug === slug);
}

// "ny" is the admin's "write a news item" page (/admin/nyheter/ny).
const reserved = new Set(["ny"]);

/** `base`, or `base-2`, `base-3` … — the first one no other item uses. */
export function uniqueNewsSlug(base: string, taken: Iterable<string>) {
  const used = new Set([...reserved, ...taken]);
  if (!used.has(base)) return base;
  let i = 2;
  while (used.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

/** Store a new item at the top of the list. Its slug is made unique; returns the slug it got. */
export async function addNews(item: NewsItem) {
  const all = await getAllNews();
  const slug = uniqueNewsSlug(item.slug, all.map((n) => n.slug));
  await saveAllNews([{ ...item, slug }, ...all]);
  return slug;
}

/** Replace the item with this slug, keeping its place. False when it is gone. */
export async function updateNews(slug: string, item: NewsItem) {
  const all = await getAllNews();
  const i = all.findIndex((n) => n.slug === slug);
  if (i < 0) return false;
  all[i] = { ...item, slug };
  await saveAllNews(all);
  return true;
}

/** Remove an item; returns it, or undefined when it was already gone. */
export async function deleteNews(slug: string) {
  const all = await getAllNews();
  const gone = all.find((n) => n.slug === slug);
  if (gone) await saveAllNews(all.filter((n) => n !== gone));
  return gone;
}
