import "server-only";
import { isTime, isUrl, slugify, text, checked } from "@/components/admin/server";
import type { LinkGroup } from "@/components/admin/calendar/LinkPicker";
import { getAllNews } from "@/lib/content/news";
import { getRaces } from "@/lib/content/races";
import { eventKindLabel, type ClubEvent, type EventKind, type EventSeries } from "@/lib/data/events";

// Shared by the event and series editors: reading the posted fields, the
// link list, and ids for new events.

const kinds = Object.keys(eventKindLabel) as EventKind[];

/** Title, kind, time, place, note, link and "members only" — common to events and series. */
export function readEventFields(data: FormData) {
  const errors: Record<string, string> = {};
  const title = text(data, "title");
  const kind = text(data, "kind") as EventKind;
  const time = text(data, "time").replace(".", ":");
  const place = text(data, "place");
  const note = text(data, "note");
  const link = readLink(data);
  if (!title) errors.title = "Skriv vad det är, till exempel ”Styrelsemöte”.";
  if (!kinds.includes(kind)) errors.kind = "Välj vilken typ det är.";
  if (!isTime(time)) errors.time = time ? "Skriv tiden som 18:00." : "Skriv när det börjar, till exempel 18:00.";
  if (!place) errors.place = "Skriv var det är, till exempel ”Klubblokalen”.";
  if ("error" in link) errors.link = link.error;
  const fields = {
    title,
    kind,
    time,
    place,
    ...(note && { note }),
    ...("href" in link && link.href && { href: link.href }),
    ...(checked(data, "membersOnly") && { membersOnly: true }),
  };
  return { fields, errors };
}

/**
 * The link from <LinkPicker>: a page on the site picked from the list, or a
 * pasted web address ("www.mittlopp.se/…" gets its https:// added).
 */
function readLink(data: FormData): { href?: string } | { error: string } {
  const choice = text(data, "link");
  if (!choice) return {};
  if (choice !== "url") return choice.startsWith("/") ? { href: choice } : { error: "Välj en sida i listan." };
  let url = text(data, "linkUrl");
  if (!url) return { error: "Klistra in webbadressen, eller välj ”Ingen länk”." };
  if (url.startsWith("/") && !/\s/.test(url)) return { href: url };
  if (!/^https?:\/\//i.test(url) && /^[^\s/@]+\.[a-z]{2,}(\/\S*)?$/i.test(url)) url = `https://${url}`;
  if (!isUrl(url)) return { error: "Det ser inte ut som en webbadress. Den ska börja med https://" };
  return { href: url };
}

/** "Inställt – banan är avstängd" → "Banan är avstängd" (the calendar already says Inställt). */
export function cleanReason(reason: string) {
  const r = reason.replace(/^inställ(t|d)\s*[-–—:,.!]*\s*/i, "").trim();
  return r.charAt(0).toUpperCase() + r.slice(1);
}

/** A unique, readable id for a new one-off event, e.g. "styrelsemote-2026-12-07". */
export function newEventId(title: string, date: string, events: ClubEvent[], series: EventSeries[]) {
  const slug = slugify(title);
  // Weekly sessions are `${seriesId}-${date}`, and pages look sessions up by
  // that prefix: a one-off event must never look like one.
  let base = `${slug}-${date}`;
  if (series.some((s) => base.startsWith(`${s.id}-`))) base = `${date}-${slug}`;
  let id = base;
  for (let n = 2; events.some((e) => e.id === id); n++) id = `${base}-${n}`;
  return id;
}

/** A unique id for a new series. Kept for good — its sessions are found by it. */
export function newSeriesId(title: string, events: ClubEvent[], series: EventSeries[]) {
  let base = slugify(title);
  // Neither series' sessions may start with the other's prefix.
  if (series.some((s) => base.startsWith(`${s.id}-`) || s.id.startsWith(`${base}-`))) base = base.replaceAll("-", "");
  const taken = (id: string) =>
    series.some((s) => s.id === id) || events.some((e) => new RegExp(`^${id}-\\d{4}-\\d{2}-\\d{2}$`).test(e.id));
  let id = base;
  for (let n = 2; taken(id); n++) id = `${base}${n}`;
  return id;
}

/** What the board can link an event to: the site's pages, our races and the news. */
export async function linkGroups(): Promise<LinkGroup[]> {
  const [news, races] = await Promise.all([getAllNews(), getRaces()]);
  return [
    {
      label: "Sidor på webbplatsen",
      options: [
        { value: "/trana-med-oss", label: "Träna med oss" },
        { value: "/trana-med-oss#halsagruppen", label: "Träna med oss – Hälsagruppen" },
        { value: "/trana-med-oss#torsdagsgruppen", label: "Träna med oss – Torsdagsgruppen" },
        { value: "/trana-med-oss#langpass", label: "Träna med oss – Långpass" },
        { value: "/tavla", label: "Tävla" },
        { value: "/tavla#aka-och-tavla", label: "Tävla – Åka och tävla" },
        { value: "/flodet", label: "Klubbflödet" },
        { value: "/foreningen", label: "Föreningen" },
        { value: "/bli-medlem", label: "Bli medlem" },
        { value: "/dokument", label: "Dokument" },
        { value: "/fragor", label: "Frågor & kontakt" },
      ],
    },
    {
      label: "Våra lopp",
      options: races.map((r) => ({ value: `/tavla/${r.slug}`, label: r.name })),
    },
    {
      label: "Nyheter",
      options: [...news]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((n) => ({ value: `/nyheter/${n.slug}`, label: n.membersOnly ? `${n.title} (medlemmar)` : n.title })),
    },
  ];
}
