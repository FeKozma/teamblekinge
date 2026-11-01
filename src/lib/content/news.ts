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
