// The club's own races. Facts from the current teamblekinge.nu.

export type Race = {
  slug: string;
  name: string;
  /** ISO date-time of the first start, Europe/Stockholm. */
  start: string;
  dateLabel: string;
  place: string;
  kicker: string;
  /** Accent for the kicker line. */
  tone: "orange" | "purple";
  summary: string;
  image: string;
  imageAlt: string;
  /** Logos/posters are shown contained on white instead of cropped. */
  imageFit?: "cover" | "contain";
  distances: { name: string; start: string; note?: string; fee?: string }[];
  registration: { label: string; url?: string; note: string };
  facts: string[];
  cta: string;
  /** Which registration period the fees in `distances` apply to. */
  feeNote?: string;
  /** Fees that rise closer to race day: one column per period. */
  feeLadder?: { periods: string[]; rows: { name: string; fees: number[] }[] };
  /** Course records, as published on the old site. */
  records?: { distance: string; name: string; club: string; time: string; year: number }[];
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
    },
    facts: [
      "Chiptidtagning av Racetimer",
      "Sponsras av ICA Supermarket Jämjöhallen",
      "Veteran-SM i halvmaraton avgörs i samma lopp",
    ],
    cta: "Till loppet",
    feeNote: "Avgift vid föranmälan 2/10–31/10.",
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
  },
];

export function getRace(slug: string) {
  return races.find((r) => r.slug === slug);
}
