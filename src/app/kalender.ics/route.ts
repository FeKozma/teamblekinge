import { getEvents } from "@/lib/content/events";
import { getPageTexts } from "@/lib/content/pages";
import { eventKindLabel, isPublicEvent, type ClubEvent } from "@/lib/data/events";

// Subscribable iCalendar feed (RFC 5545) of the club's public events — what a
// guest sees in /kalender. Members-only events and löprundor from Klubbflödet
// stay out: a subscription URL can't be tied to a login. The data has start
// times only, so events carry no DTEND (allowed: they then end where they start).
// Cancelled sessions stay in with STATUS:CANCELLED, so subscribers' calendars
// show them called off instead of silently dropping them.

const TZID = "Europe/Stockholm";

// Stockholm's rules (CET/CEST, EU switch on the last Sundays of March and
// October), required alongside any DTSTART;TZID=… reference.
const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${TZID}`,
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

/** TEXT value escaping: backslash, semicolon, comma and newlines. */
function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Fold content lines at 75 octets (UTF-8), never splitting a character. */
function fold(line: string) {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    // Continuation lines start with a space, which counts toward their 75.
    if (bytes + n > 75) {
      out.push(cur);
      cur = " ";
      bytes = 1;
    }
    cur += ch;
    bytes += n;
  }
  out.push(cur);
  return out.join("\r\n");
}

function vevent(e: ClubEvent, origin: string, stamp: string) {
  const start = `${e.date.replaceAll("-", "")}T${e.time.replace(":", "")}00`;
  const description = [
    e.cancelled ? ["Inställt", e.cancelReason].filter(Boolean).join(": ") : null,
    e.note && e.note !== eventKindLabel[e.kind] ? e.note : null,
    eventKindLabel[e.kind],
  ]
    .filter(Boolean)
    .join(" · ");
  return [
    "BEGIN:VEVENT",
    `UID:${e.id}@teamblekinge.nu`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${TZID}:${start}`,
    // Not every calendar app shows the status, so the title says it too.
    `SUMMARY:${esc(e.cancelled ? `Inställt: ${e.title}` : e.title)}`,
    ...(e.cancelled ? ["STATUS:CANCELLED"] : []),
    `LOCATION:${esc(e.place)}`,
    `DESCRIPTION:${esc(description)}`,
    `CATEGORIES:${esc(eventKindLabel[e.kind])}`,
    ...(e.href ? [`URL:${new URL(e.href, origin).href}`] : []),
    "END:VEVENT",
  ];
}

/** The origin the visitor used (behind a proxy, request.url is the internal one). */
function publicOrigin(request: Request) {
  const h = request.headers;
  const host = h.get("x-forwarded-host")?.split(",")[0].trim() || h.get("host");
  if (!host) return new URL(request.url).origin;
  const proto = h.get("x-forwarded-proto")?.split(",")[0].trim() || new URL(request.url).protocol.slice(0, -1);
  return `${proto}://${host}`;
}

export async function GET(request: Request) {
  const [events, t] = await Promise.all([getEvents({ cancelled: true }), getPageTexts("kalender")]);
  const origin = publicOrigin(request);
  // DTSTAMP is UTC: 20261031T081500Z
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Team Blekinge Löparförening//Kalender//SV",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Team Blekinge LF",
    `X-WR-CALDESC:${esc(t("ics.description"))}`,
    `X-WR-TIMEZONE:${TZID}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    "X-PUBLISHED-TTL:PT12H",
    ...VTIMEZONE,
    ...events.filter(isPublicEvent).flatMap((e) => vevent(e, origin, stamp)),
    "END:VCALENDAR",
  ];
  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'inline; filename="team-blekinge.ics"',
      "cache-control": "public, max-age=3600",
    },
  });
}
