// Calendar SEED. Weekly club sessions are series that generate their dates;
// one-off events are listed. Löprundor posted in Klubbflödet also show up
// here (source: "flode").
// Pages read the board's edited version via lib/content/events.

import { addDays } from "@/lib/format";

export type EventKind = "traning" | "lopp" | "lopprunda" | "mote" | "resa";

export type ClubEvent = {
  id: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  time: string;
  title: string;
  place: string;
  kind: EventKind;
  membersOnly?: boolean;
  href?: string;
  note?: string;
  source?: "flode";
  /** The Klubbflödet post a löprunda came from (FeedPost id), for live joiner counts. */
  post?: string;
  /** Called off. Still listed in the calendar, as "Inställt". */
  cancelled?: boolean;
  /** Why, e.g. "Banan är avstängd". */
  cancelReason?: string;
  /** The weekly series (EventSeries id) this session belongs to. */
  series?: string;
};

export const eventKindLabel: Record<EventKind, string> = {
  traning: "Träning",
  lopp: "Eget lopp",
  lopprunda: "Löprunda",
  mote: "Möte",
  resa: "Åka och tävla",
};

export const oneOffEvents: ClubEvent[] = [
  {
    id: "langpass-mortsjon",
    date: "2026-10-31",
    time: "09:00",
    title: "Långpass till Mörtsjön",
    place: "Klubblokalen",
    kind: "lopprunda",
    membersOnly: true,
    note: "3 hänger med",
    href: "/flodet#p-mortsjon",
    source: "flode",
    post: "p-mortsjon",
  },
  {
    id: "aka-och-tavla",
    date: "2026-11-03",
    time: "17:00",
    title: "Åka och tävla – planeringsträff",
    place: "Klubblokalen",
    kind: "resa",
    note: "Vi planerar vårens tävlingsresor och samåkning.",
  },
  {
    id: "torsdagslopning-0511",
    date: "2026-11-05",
    time: "17:30",
    title: "Torsdagslöpning",
    place: "Västra Marks IP",
    kind: "lopprunda",
    membersOnly: true,
    note: "8–10 km, ca 6 min/km",
    href: "/flodet",
    source: "flode",
  },
  {
    id: "jamjohalvan-2026",
    date: "2026-11-07",
    time: "11:00",
    title: "Jämjöhalvan och Veteran-SM",
    place: "Jämjö",
    kind: "lopp",
    note: "Eget lopp",
    href: "/tavla/jamjohalvan",
  },
  {
    id: "styrelsemote-1109",
    date: "2026-11-09",
    time: "19:00",
    title: "Styrelsemöte",
    place: "Klubblokalen",
    kind: "mote",
    membersOnly: true,
  },
  {
    id: "kyrkstafetten",
    date: "2026-11-21",
    time: "10:00",
    title: "Kyrkstafetten",
    place: "Karlskrona",
    kind: "resa",
    membersOnly: true,
    href: "/nyheter/kyrkstafetten",
  },
  {
    id: "kustmaran-2027",
    date: "2027-07-03",
    time: "10:00",
    title: "Kustmaran & Kristianopel Runt",
    place: "Kristianopel",
    kind: "lopp",
    note: "Eget lopp",
    href: "/tavla/kustmaran",
  },
];

/** Monday first, as in Swedish calendars: 1 = måndag … 7 = söndag. */
export const weekdayNames = ["måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag", "söndag"];

/**
 * A session that happens every week, e.g. Tuesday intervals. Its occurrences
 * get the id `${id}-${date}` (pages find Thursday sessions by that prefix, so
 * a series keeps its id when renamed).
 */
export type EventSeries = {
  id: string;
  /** 1 = måndag … 7 = söndag. */
  weekday: number;
  time: string;
  title: string;
  place: string;
  kind: EventKind;
  membersOnly?: boolean;
  href?: string;
  note?: string;
  /** First possible date (ISO). */
  from: string;
  /** Last possible date (ISO); none = until further notice. */
  until?: string;
  /** Single sessions that are called off. */
  cancelled?: { date: string; reason?: string }[];
};

export const eventSeries: EventSeries[] = [
  {
    id: "halsa",
    weekday: 2,
    time: "17:45",
    title: "Hälsagruppen",
    place: "Klubblokalen, Tennvägen 11 A",
    kind: "traning",
    href: "/trana-med-oss#halsagruppen",
    from: "2026-10-27",
    until: "2026-12-29",
  },
  {
    id: "intervall",
    weekday: 2,
    time: "18:00",
    title: "Intervallträning",
    place: "Klubblokalen, Tennvägen 11 A",
    kind: "traning",
    note: "Långa och korta gruppen",
    href: "/trana-med-oss",
    from: "2026-10-27",
    until: "2026-12-29",
  },
  {
    id: "torsdagsgruppen",
    weekday: 4,
    time: "10:00",
    title: "Torsdagsgruppen",
    place: "Tennvägen 11 A",
    kind: "traning",
    note: "Promenad i Bastasjöskogen och fika",
    href: "/trana-med-oss#torsdagsgruppen",
    from: "2026-10-29",
    until: "2026-12-31",
  },
];

/** How far ahead a series without an end date is listed. */
export const OPEN_SERIES_WEEKS = 26;

/** 1 = Monday … 7 = Sunday. */
export function isoWeekday(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() || 7;
}

/**
 * The dates a series happens on, from its start (but at most a year back)
 * to its end, or OPEN_SERIES_WEEKS ahead of `today` when it has none.
 */
export function seriesDates(s: EventSeries, today: string) {
  const floor = addDays(today, -364);
  const last = s.until ?? addDays(today, OPEN_SERIES_WEEKS * 7);
  let date = s.from > floor ? s.from : floor;
  date = addDays(date, (s.weekday - isoWeekday(date) + 7) % 7);
  const out: string[] = [];
  for (; date <= last; date = addDays(date, 7)) out.push(date);
  return out;
}

/** A series as calendar events, cancelled sessions marked. */
export function seriesEvents(s: EventSeries, today: string): ClubEvent[] {
  const off = new Map((s.cancelled ?? []).map((c) => [c.date, c]));
  return seriesDates(s, today).map((date) => {
    const c = off.get(date);
    return {
      id: `${s.id}-${date}`,
      date,
      time: s.time,
      title: s.title,
      place: s.place,
      kind: s.kind,
      ...(s.membersOnly && { membersOnly: true }),
      ...(s.href && { href: s.href }),
      ...(s.note && { note: s.note }),
      series: s.id,
      ...(c && { cancelled: true, ...(c.reason && { cancelReason: c.reason }) }),
    };
  });
}

/** "tisdagar" */
export function weekdayPlural(weekday: number) {
  return `${weekdayNames[weekday - 1]}ar`;
}

/** Chronological order: date, then time. */
export function byStart(a: ClubEvent, b: ClubEvent) {
  return (a.date + a.time).localeCompare(b.date + b.time);
}

/**
 * Upcoming events from `today` (inclusive), optionally hiding members-only
 * ones. Cancelled ones are left out unless `cancelled` is set.
 */
export function upcomingIn(
  events: ClubEvent[],
  today: string,
  opts: { limit?: number; members?: boolean; cancelled?: boolean } = {},
) {
  return events
    .filter((e) => e.date >= today && (opts.members || !e.membersOnly) && (opts.cancelled || !e.cancelled))
    .slice(0, opts.limit ?? Infinity);
}

/** Members-only events and löprundor from Klubbflödet are hidden from guests and the iCal feed. */
export function isPublicEvent(e: ClubEvent) {
  return !e.membersOnly && e.source !== "flode";
}
