// Training: the Tuesday groups, the term plan and the monthly long runs.
// Sourced from the current teamblekinge.nu — see docs/content-from-old-site.md.
// This is the SEED: the board edits it in /admin/traning, and pages read the
// edited version via lib/content/training.

/** The groups are fixed: the pages are laid out around exactly these three. */
export const trainingGroupIds = ["langa", "korta", "halsa"] as const;

export type TrainingGroup = {
  id: (typeof trainingGroupIds)[number];
  name: string;
  short: string;
  /** Accent used for the card's top border and the pill. */
  tone: "ink" | "orange" | "purple";
  /** When the group meets on Tuesdays, "HH:MM". */
  time: string;
  /** Shown on the start page, after the description. */
  requirement: string;
  /** Shown on the start page. */
  description: string;
  /** Short label on the group's card under Träna med oss, e.g. "ca 10 km". */
  distance: string;
  /** Who the group suits, on Träna med oss. */
  suits: string;
  /** Checklist on Träna med oss. */
  needs: string[];
};

export const trainingGroups: TrainingGroup[] = [
  {
    id: "langa",
    name: "Långa gruppen",
    short: "Långa",
    tone: "ink",
    time: "18:00",
    requirement: "Du bör klara cirka 10 km löpning.",
    description: "Längre intervallpass för dig som är van.",
    distance: "ca 10 km",
    suits: "Lite längre intervallpass för de lite mer erfarna löparna.",
    needs: ["Du klarar cirka 10 km löpning", "Inga skadesymtom", "Du har sprungit någorlunda regelbundet ett par månader"],
  },
  {
    id: "korta",
    name: "Korta gruppen",
    short: "Korta",
    tone: "orange",
    time: "18:00",
    requirement: "Du bör klara cirka 5 km löpning.",
    description: "Kortare intervallpass för dig som inte sprungit så länge.",
    distance: "ca 5 km",
    suits: "Lite kortare intervallpass för dig som är mindre van.",
    needs: ["Du klarar cirka 5 km löpning", "Inga skadesymtom", "Du har sprungit någorlunda regelbundet ett par månader"],
  },
  {
    id: "halsa",
    name: "Hälsagruppen",
    short: "Hälsagruppen",
    tone: "purple",
    time: "17:45",
    requirement: "Inga krav på att du tränat löpning tidigare.",
    description:
      "Varva gärna löpning med promenad – plus styrka och balans. Målet är att må bra.",
    distance: "Gå & spring",
    suits: "Löpning varvat med promenad, plus styrka och balans.",
    needs: ["Inga krav på att du tränat löpning tidigare"],
  },
];

/**
 * The time most groups meet — "18:00". Groups meeting at another time get a
 * "Samling 17:45" line of their own.
 */
export function mainTime(groups: TrainingGroup[]) {
  const counts = new Map<string, number>();
  for (const g of groups) counts.set(g.time, (counts.get(g.time) ?? 0) + 1);
  let best = "";
  for (const [time, n] of counts) if (n > (counts.get(best) ?? 0)) best = time;
  return best;
}

/**
 * Tonight's session per group, keyed by ISO date of the Tuesday.
 * DEMO DATA: in the real site the trainers fill in the terminsplan in admin.
 */
export type TermPlan = Record<string, Record<TrainingGroup["id"], string>>;

export const termPlan: TermPlan = {
  "2026-10-27": {
    langa: "5 × 1 000 m, vila 90 s",
    korta: "8 × 400 m, vila 60 s",
    halsa: "Gå–spring 2+1 min, styrka & balans",
  },
  "2026-11-03": {
    langa: "Pyramid 1–2–3–2–1 min, joggvila",
    korta: "Backe 8 × 45 s vid Bastasjön",
    halsa: "Lätt distans i skogen + rörlighet",
  },
  "2026-11-10": {
    langa: "3 × 2 km i halvmaratonfart",
    korta: "6 × 600 m, vila 75 s",
    halsa: "Gå–spring 3+1 min, styrka & balans",
  },
  "2026-11-17": {
    langa: "Fartlek 40 min",
    korta: "Fartlek 25 min",
    halsa: "Lätt distans + balansövningar",
  },
};

export type LongRun = { date: string; place: string; note?: string };

/** Monthly long runs 2026 (from the old site). */
export const longRuns: LongRun[] = [
  { date: "2026-01-10", place: "Klubblokalen" },
  { date: "2026-02-28", place: "Klubblokalen" },
  { date: "2026-03-28", place: "Klubblokalen" },
  { date: "2026-05-02", place: "Studentviken" },
  { date: "2026-06-13", place: "Alljungen" },
  { date: "2026-07-23", place: "Mörtsjön", note: "kvällspass" },
  { date: "2026-08-08", place: "Färskesjön" },
  { date: "2026-09-12", place: "Mållsjön" },
  { date: "2026-10-03", place: "Holmsjö" },
];
