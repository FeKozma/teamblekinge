// Facts about the association. Sourced from the current teamblekinge.nu —
// see docs/content-from-old-site.md. Keep this file the single place these
// numbers live so the next fee change is a one-line edit.

export const club = {
  name: "Team Blekinge Löparförening",
  shortName: "Team Blekinge",
  founded: "18 januari 1992",
  foundedYear: 1992,
  members: "drygt 200",
  fee: 650,
  feeYear: 2026,
  swish: "123 240 37 49",
  bankgiro: "866-1159",
  orgNr: "835000-8911",
  foreningsNr: "27887",
  address: {
    street: "Tennvägen 11 A",
    zip: "371 50",
    city: "Karlskrona",
    area: "Torskors",
  },
  contact: {
    name: "Simon Fröh",
    role: "Ordförande",
    raceEmail: "register@teamblekinge.nu",
  },
  instagram: "https://www.instagram.com/teamblekinge/",
  facebookGroup: "https://www.facebook.com/groups/8922263261122819",
  trimtexShop: "https://shop.trimtexcustom.se/account/register",
} as const;

export type TrainingGroup = {
  id: "langa" | "korta" | "halsa";
  name: string;
  short: string;
  /** Accent used for the card's top border and the pill. */
  tone: "ink" | "orange" | "purple";
  time: string;
  requirement: string;
  description: string;
};

export const trainingGroups: TrainingGroup[] = [
  {
    id: "langa",
    name: "Långa gruppen",
    short: "Långa",
    tone: "ink",
    time: "Tisdagar 18:00",
    requirement: "Du bör klara cirka 10 km löpning.",
    description: "Längre intervallpass för dig som är van.",
  },
  {
    id: "korta",
    name: "Korta gruppen",
    short: "Korta",
    tone: "orange",
    time: "Tisdagar 18:00",
    requirement: "Du bör klara cirka 5 km löpning.",
    description: "Kortare intervallpass för dig som inte sprungit så länge.",
  },
  {
    id: "halsa",
    name: "Hälsagruppen",
    short: "Hälsagruppen",
    tone: "purple",
    time: "Tisdagar 17:45",
    requirement: "Inga krav på att du tränat löpning tidigare.",
    description:
      "Varva gärna löpning med promenad – plus styrka och balans. Målet är att må bra.",
  },
];

/**
 * Tonight's session per group, keyed by ISO date of the Tuesday.
 * DEMO DATA: in the real site the trainers fill in the terminsplan in admin.
 */
export const termPlan: Record<string, Record<TrainingGroup["id"], string>> = {
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

/** Monthly long runs 2026 (from the old site). */
export const longRuns2026 = [
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

export const board2026 = [
  { name: "Simon Fröh", role: "Ordförande" },
  { name: "Marianne Collin", role: "Vice ordförande" },
  { name: "Jeanette Norman", role: "Kassör" },
  { name: "Eva Andersson", role: "Sekreterare" },
  { name: "Ida Linn Silfors", role: "Ledamot" },
  { name: "Ola Ramén", role: "Ledamot" },
  { name: "Elsa Håkansson", role: "Ledamot" },
];

export const otherRoles = [
  {
    title: "Tävlingskommitté",
    names: ["Lena Magnusson", "Simon Fröh", "Jonas Rosqvist", "Ola Ramén", "Lukas Lindman"],
  },
  { title: "Antidopingansvarig", names: ["Simon Fröh"] },
  { title: "Valberedning 2026", names: ["Johan Fridström", "Ingrid Argenius"] },
  { title: "Webbansvarig", names: ["Martin Olsson"] },
  { title: "Torsdagsgruppen", names: ["Lotta Johansson"] },
];

export type Faq = { q: string; a: string; topic: "medlem" | "traning" | "lopp" };

export const faqs: Faq[] = [
  {
    topic: "medlem",
    q: "Kan jag prova på innan jag blir medlem?",
    a: "Ja, du får vara med på upp till tre träningspass innan du bestämmer dig – intervaller eller långpass, du väljer själv.",
  },
  {
    topic: "medlem",
    q: "Vad kostar medlemskapet?",
    a: "650 kr per person för 2026, oavsett när på året du går med. När ansökan är godkänd betalar du med Swish 123 240 37 49 eller bankgiro 866-1159.",
  },
  {
    topic: "medlem",
    q: "Måste jag förnya medlemskapet varje år?",
    a: "Nej. Du är medlem automatiskt tills du säger upp medlemskapet – du betalar bara årets avgift.",
  },
  {
    topic: "medlem",
    q: "Är jag försäkrad när jag tränar med er?",
    a: "Ja, i medlemsavgiften ingår en olycksfallsförsäkring som gäller på föreningens träningar.",
  },
  {
    topic: "traning",
    q: "Vilken grupp ska jag välja?",
    a: "Klarar du ungefär 10 km passar långa gruppen, ungefär 5 km korta gruppen. Har du inte sprungit förut är Hälsagruppen rätt start – där finns inga krav alls.",
  },
  {
    topic: "traning",
    q: "Var parkerar jag vid klubblokalen?",
    a: "Gröna ytor går bra att parkera på. Undvik de rödmarkerade ytorna – se kartan under Träna med oss.",
  },
  {
    topic: "lopp",
    q: "Får alla som går i mål en medalj?",
    a: "[Svar från tävlingsledningen, per lopp]",
  },
  {
    topic: "lopp",
    q: "Vilka maxtider gäller?",
    a: "[Maxtid per lopp och distans]",
  },
  {
    topic: "lopp",
    q: "Kan jag efteranmäla mig till Jämjöhalvan?",
    a: "Ja, på tävlingsdagen kl. 08.30–10.15 i mån av plats. Till Veteran-SM går det inte att efteranmäla sig.",
  },
];

export const partners = [
  { name: "ICA Maxi Karlskrona", logo: "/img/partners/maxi-ica-karlskrona.jpg" },
  { name: "LF Blekinge", logo: "/img/partners/lf-blekinge.png" },
  { name: "ICA Supermarket Jämjöhallen", logo: "/img/partners/ica-supermarket-jamjohallen.png" },
  { name: "Umara", logo: "/img/partners/umara.png" },
  { name: "Testlabbet", logo: "/img/partners/testlabbet.jpg" },
  { name: "Rosenquist Ljud & Bild", logo: "/img/partners/rosenquist-ljud-bild.png" },
  { name: "Franssons Maskiner", logo: "/img/partners/franssons-maskiner.jpg" },
];
