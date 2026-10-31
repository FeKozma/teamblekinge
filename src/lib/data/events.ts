// Calendar. Recurring club sessions are generated; one-off events are listed.
// Löprundor posted in Klubbflödet also show up here (source: "flode").

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
};

export const eventKindLabel: Record<EventKind, string> = {
  traning: "Träning",
  lopp: "Eget lopp",
  lopprunda: "Löprunda",
  mote: "Möte",
  resa: "Åka och tävla",
};

const oneOff: ClubEvent[] = [
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

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Tuesday intervals and Thursday walks from `from` for `weeks` weeks. */
function recurring(from: string, weeks: number): ClubEvent[] {
  const out: ClubEvent[] = [];
  const start = new Date(`${from}T12:00:00Z`);
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const date = isoDate(d);
    const dow = d.getUTCDay();
    if (dow === 2) {
      out.push({
        id: `halsa-${date}`,
        date,
        time: "17:45",
        title: "Hälsagruppen",
        place: "Klubblokalen, Tennvägen 11 A",
        kind: "traning",
        href: "/trana-med-oss#halsagruppen",
      });
      out.push({
        id: `intervall-${date}`,
        date,
        time: "18:00",
        title: "Intervallträning",
        place: "Klubblokalen, Tennvägen 11 A",
        kind: "traning",
        note: "Långa och korta gruppen",
        href: "/trana-med-oss",
      });
    }
    if (dow === 4) {
      out.push({
        id: `torsdagsgruppen-${date}`,
        date,
        time: "10:00",
        title: "Torsdagsgruppen",
        place: "Tennvägen 11 A",
        kind: "traning",
        note: "Promenad i Bastasjöskogen och fika",
        href: "/trana-med-oss#torsdagsgruppen",
      });
    }
  }
  return out;
}

export const events: ClubEvent[] = [...recurring("2026-10-26", 10), ...oneOff].sort((a, b) =>
  (a.date + a.time).localeCompare(b.date + b.time),
);

/** Upcoming events from `today` (inclusive), optionally hiding members-only ones. */
export function upcomingEvents(today: string, opts: { limit?: number; members?: boolean } = {}) {
  return events
    .filter((e) => e.date >= today && (opts.members || !e.membersOnly))
    .slice(0, opts.limit ?? Infinity);
}

/** Members-only events and löprundor from Klubbflödet are hidden from guests and the iCal feed. */
export function isPublicEvent(e: ClubEvent) {
  return !e.membersOnly && e.source !== "flode";
}
