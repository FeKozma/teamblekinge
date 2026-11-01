// The club's own races. Facts from the current teamblekinge.nu. This is the
// SEED: the board edits races in /admin/lopp; pages read them via lib/content.

import { longDate } from "@/lib/format";

export type Race = {
  /** Part of the race's URL (/tavla/<slug>). Never changes once published. */
  slug: string;
  name: string;
  /** ISO date-time of the first start, Europe/Stockholm. */
  start: string;
  /** "Lördag 7 november 2026" — follows `start` (see raceDateLabel). */
  dateLabel: string;
  place: string;
  kicker: string;
  /** Accent for the kicker line. */
  tone: "orange" | "purple";
  summary: string;
  image: string;
  imageAlt: string;
  /**
   * How the image is framed: a photo cropped to fit, a square poster shown
   * whole on the race's page, or a logo shown contained on white.
   */
  imageFit?: "cover" | "poster" | "contain";
  distances: { name: string; start: string; note?: string; fee?: string }[];
  /** `tip` is shown under the note only until race day. */
  registration: { label: string; url?: string; note: string; tip?: string };
  facts: string[];
  cta: string;
  /** Which registration period the fees in `distances` apply to. */
  feeNote?: string;
  /** Fees that rise closer to race day: one column per period. */
  feeLadder?: { periods: string[]; rows: { name: string; fees: number[] }[] };
  /** Course records, as published on the old site. */
  records?: { distance: string; name: string; club: string; time: string; year: number }[];
  /** Other races this one hangs together with, and how — shown first under "Fler lopp". */
  related?: { slug: string; text: string }[];
  /**
   * The race's box under Tävla › Resultat, one row per year. The `current`
   * row is this year's race: until race day it says when it is run.
   */
  results?: { label: string; text: string; current?: boolean }[];
};

export const races: Race[] = [
  {
    slug: "jamjohalvan",
    name: "Jämjöhalvan",
    start: "2026-11-07T11:00:00+01:00",
    dateLabel: "Lördag 7 november 2026",
    place: "Jämjö Kunskapscentrum",
    kicker: "Lördag 7 november 2026 · Jämjö",
    tone: "orange",
    summary:
      "Breddlopp på en lättlöpt varvbana: 21,1 km, 10 km, 5 km och barnlopp, plus Jämjöhallenstafetten. Seedningslopp till bland annat Göteborgsvarvet.",
    image: "/img/jamjohalvan-affisch.jpg",
    imageAlt: "Affisch för Jämjöhalvan 7 november: 21,1 km, 10 km, 5 km och barnlopp",
    imageFit: "poster",
    distances: [
      { name: "21,1 km (4 varv)", start: "11:00", fee: "500 kr" },
      { name: "Jämjöhallenstafetten, 4 × ca 5,3 km", start: "11:00", fee: "800 kr/lag" },
      { name: "10 km (2 varv)", start: "11:10", fee: "400 kr" },
      { name: "5 km (1 varv)", start: "11:15", fee: "350 kr" },
      { name: "Barnlopp 500 m", start: "13:15", fee: "50 kr" },
    ],
    registration: {
      label: "Anmäl dig på mittlopp.se",
      url: "https://mittlopp.se/Anmalan/Arrangemangsgrupp/RBTNJZXCBKKIEQVZPF",
      note: "Föranmälan stänger 31 oktober kl. 23:59. Efteranmälan på tävlingsdagen 08.30–10.15 i mån av plats.",
      tip: "Vill du springa Veteran-SM? Kryssa i ”Delta i VSM” när du anmäler dig.",
    },
    facts: [
      "Chiptidtagning av Racetimer",
      "Sponsras av ICA Supermarket Jämjöhallen",
      "Veteran-SM i halvmaraton avgörs i samma lopp",
    ],
    cta: "Till loppet",
    feeNote: "Avgift vid föranmälan 2/10–31/10.",
    related: [
      {
        slug: "veteran-sm",
        text: "Veteran-SM i halvmaraton avgörs i Jämjöhalvan – kryssa i ”Delta i VSM” när du anmäler dig.",
      },
    ],
    results: [
      { label: "2026", current: true, text: "Chiptidtagning av Racetimer. [Länk till Racetimers resultatlista]" },
      { label: "Tidigare år", text: "[Resultatarkivet från gamla sidan flyttas hit]" },
    ],
  },
  {
    slug: "kustmaran",
    name: "Kustmaran & Kristianopel Runt",
    start: "2027-07-03T10:00:00+02:00",
    dateLabel: "Lördag 3 juli 2027",
    place: "Kristianopel",
    kicker: "Lördag 3 juli 2027 · Kristianopel",
    tone: "orange",
    summary:
      "Löparfest för hela familjen, från 0,9 till 42,2 km, i ostkustens pärla. Anmälan öppnar i januari 2027.",
    image: "/img/kustmaran-start.jpg",
    imageAlt: "Löpare i starten på Kustmaran i Kristianopel",
    distances: [
      { name: "Kustmaran 42,2 km", start: "10:00", fee: "från 400 kr" },
      { name: "Halvmaraton 21,1 km", start: "10:30", fee: "från 300 kr" },
      { name: "Kristianopel Runt 10 km", start: "11:00", fee: "från 250 kr" },
      { name: "5 km", start: "11:00", fee: "från 200 kr" },
      { name: "Sommarlunken 4 km", start: "11:10", note: "utan tidtagning" },
      { name: "Barnlopp 2,5 km", start: "13:00" },
      { name: "Barnlopp 0,9 km", start: "13:30" },
    ],
    registration: {
      label: "Anmälan öppnar i januari 2027",
      note: "Avgiften stiger 1 maj och 1 juni – anmäl dig tidigt. Frågor: register@teamblekinge.nu",
    },
    facts: [
      "Parkering en knapp kilometer utanför Kristianopel – kör inte in i byn, samåk gärna",
      "Banrekord 42,2 km: Juris Treimanis, Högby IF 2:35:37 (1996) och Petra Skiöld, Ryssbergets IK 2:55:42 (2013)",
      "Veteran-SM i maraton planeras här 2027",
    ],
    cta: "Till loppet",
    feeLadder: {
      periods: ["1/1–30/4", "1/5–31/5", "1/6–21/6"],
      rows: [
        { name: "42,2 km", fees: [400, 500, 600] },
        { name: "21,1 km", fees: [300, 400, 500] },
        { name: "10 km", fees: [250, 350, 400] },
        { name: "5 km", fees: [200, 250, 300] },
      ],
    },
    records: [
      { distance: "42,2 km", name: "Juris Treimanis", club: "Högby IF", time: "2:35:37", year: 1996 },
      { distance: "42,2 km", name: "Petra Skiöld", club: "Ryssbergets IK", time: "2:55:42", year: 2013 },
    ],
    related: [{ slug: "veteran-sm", text: "Veteran-SM i maraton planeras här 2027." }],
    results: [
      { label: "2027", current: true, text: "" },
      { label: "Tidigare år", text: "[Resultatarkivet från gamla sidan flyttas hit]" },
    ],
  },
  {
    slug: "veteran-sm",
    name: "Veteran-SM",
    start: "2026-11-07T11:00:00+01:00",
    dateLabel: "Lördag 7 november 2026",
    place: "Jämjö",
    kicker: "2026 halvmaraton · 2027 maraton",
    tone: "purple",
    summary:
      "Halvmaraton i samband med Jämjöhalvan 7 november 2026, maraton på Kustmaran 2027. Sista anmälan till VSM i år: 31 oktober.",
    image: "/img/veteran-sm-2026.jpg",
    imageAlt: "Veteran-SM 2026 Halvmaraton Jämjö",
    imageFit: "contain",
    distances: [{ name: "Halvmaraton 21,1 km", start: "11:00" }],
    registration: {
      label: "Anmäl dig via Jämjöhalvan",
      url: "https://mittlopp.se/Anmalan/Arrangemangsgrupp/RBTNJZXCBKKIEQVZPF",
      note: "Kryssa i ”Delta i VSM”. Sista anmälningsdag är 31 oktober – ingen efteranmälan till VSM.",
    },
    facts: [
      "Veteranklasser från 35 år (födda 1991 och tidigare) i femårsintervaller",
      "Obligatoriskt att tävla i klubbens tävlingsdräkt",
      "Medaljer till de tre främsta i varje klass",
    ],
    cta: "Läs mer",
    related: [
      {
        slug: "jamjohalvan",
        text: "VSM springs i Jämjöhalvans halvmaraton – samma arena, start kl. 11:00. Anmälan görs via Jämjöhalvan.",
      },
      { slug: "kustmaran", text: "Veteran-SM i maraton planeras på Kustmaran 2027." },
    ],
    results: [
      { label: "2026 · halvmaraton", current: true, text: "Medaljer till de tre främsta i varje klass." },
      { label: "2027 · maraton", text: "Planeras på Kustmaran 2027." },
    ],
  },
];

const TZ = "Europe/Stockholm";

/** "2026-11-07", "11:00" → "2026-11-07T11:00:00+01:00" (Stockholm's offset on that day). */
export function stockholmDateTime(date: string, time: string) {
  const zone = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "longOffset" })
    .formatToParts(new Date(`${date}T${time}:00Z`))
    .find((p) => p.type === "timeZoneName")?.value;
  const offset = zone?.match(/[+-]\d{2}:\d{2}/)?.[0] ?? "+01:00";
  return `${date}T${time}:00${offset}`;
}

/** "2026-11-07" → "Lördag 7 november 2026" */
export function raceDateLabel(date: string) {
  const label = `${longDate(date)} ${date.slice(0, 4)}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** The next race not yet run (first start today or later); ties keep the list's order. */
export function nextRace(races: Race[], today: string) {
  return races.filter((r) => r.start.slice(0, 10) >= today).sort((a, b) => a.start.localeCompare(b.start))[0];
}
