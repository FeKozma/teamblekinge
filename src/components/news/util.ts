import { newsCategories, type NewsCategory, type NewsItem } from "@/lib/data/news";
import { daysBetween, monthsLong } from "@/lib/format";

// Small helpers shared by the news pages and the member home.

/** URL-friendly category key: "Tävling & resor" → "tavling-resor". */
export function categorySlug(c: NewsCategory) {
  return c
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/&/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function categoryFromSlug(slug: string | undefined) {
  return newsCategories.find((c) => categorySlug(c) === slug);
}

/** "31 oktober" */
export function dayMonthLong(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${monthsLong[m - 1]}`;
}

/** "i dag" / "i går" for recent items, otherwise the item's own label ("26 okt"). */
export function newsDate(n: NewsItem, today: string) {
  const diff = daysBetween(n.date, today);
  if (diff === 0) return "i dag";
  if (diff === 1) return "i går";
  return n.dateLabel;
}

export function isPinned(n: NewsItem, today: string) {
  return !!n.pinnedUntil && n.pinnedUntil >= today;
}

/** Pinned items, the one whose pin runs out first on top. */
export function pinnedNews(items: NewsItem[], today: string) {
  return items
    .filter((n) => isPinned(n, today))
    .sort((a, b) => a.pinnedUntil!.localeCompare(b.pinnedUntil!));
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/** Registrations still open, soonest deadline first. */
export function openDeadlines(items: NewsItem[], today: string) {
  return items
    .filter((n) => n.registration && n.registration.deadline >= today)
    .sort((a, b) => a.registration!.deadline.localeCompare(b.registration!.deadline));
}
