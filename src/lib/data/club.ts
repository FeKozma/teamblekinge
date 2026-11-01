// Facts about the association. Sourced from the current teamblekinge.nu —
// see docs/content-from-old-site.md. This is the SEED: the board edits these
// in the admin, and pages read the edited version via lib/content.

export type Club = {
  name: string;
  shortName: string;
  founded: string;
  foundedYear: number;
  members: string;
  fee: number;
  feeYear: number;
  swish: string;
  bankgiro: string;
  orgNr: string;
  foreningsNr: string;
  address: { street: string; zip: string; city: string; area: string };
  contact: { name: string; role: string; raceEmail: string };
  instagram: string;
  facebookGroup: string;
  trimtexShop: string;
};

export const club: Club = {
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
};

export type BoardMember = { name: string; role: string };
export type RoleGroup = { title: string; names: string[] };

export const board2026: BoardMember[] = [
  { name: "Simon Fröh", role: "Ordförande" },
  { name: "Marianne Collin", role: "Vice ordförande" },
  { name: "Jeanette Norman", role: "Kassör" },
  { name: "Eva Andersson", role: "Sekreterare" },
  { name: "Ida Linn Silfors", role: "Ledamot" },
  { name: "Ola Ramén", role: "Ledamot" },
  { name: "Elsa Håkansson", role: "Ledamot" },
];

export const otherRoles: RoleGroup[] = [
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

export type Partner = { name: string; logo: string; url?: string };

export const partners: Partner[] = [
  { name: "ICA Maxi Karlskrona", logo: "/img/partners/maxi-ica-karlskrona.jpg" },
  { name: "LF Blekinge", logo: "/img/partners/lf-blekinge.png" },
  { name: "ICA Supermarket Jämjöhallen", logo: "/img/partners/ica-supermarket-jamjohallen.png" },
  { name: "Umara", logo: "/img/partners/umara.png" },
  { name: "Testlabbet", logo: "/img/partners/testlabbet.jpg" },
  { name: "Rosenquist Ljud & Bild", logo: "/img/partners/rosenquist-ljud-bild.png" },
  { name: "Franssons Maskiner", logo: "/img/partners/franssons-maskiner.jpg" },
];

/** A point on the history timeline on /foreningen. */
export type Milestone = {
  /** As written on the card: "Hösten 1989", "18 januari 1992". */
  when: string;
  /** Short label on the track: "1989". */
  mark: string;
  title: string;
  text: string;
  /** Not happened yet — drawn dashed with a "Planeras" tag. */
  planned?: boolean;
};

// From the club's own history page and race records (docs/content-from-old-site.md).
export const history: Milestone[] = [
  {
    when: "Hösten 1989",
    mark: "1989",
    title: "Idén föds i Berlin",
    text: "På en resa till Berlin Marathon föds idén till föreningen.",
  },
  {
    when: "18 januari 1992",
    mark: "1992",
    title: "Föreningen bildas",
    text: "Officiellt bildas föreningen vid ett möte i Sjöarp, Bräkne-Hoby. Förste ordförande blir Bengt-Åke Svensson.",
  },
  {
    when: "1996",
    mark: "1996",
    title: "Banrekord på Kustmaran",
    text: "Juris Treimanis, Högby IF, springer maraton på 2:35:37 – fortfarande banrekord.",
  },
  {
    when: "2013",
    mark: "2013",
    title: "Petra Skiöld sätter 2:55:42",
    text: "Petra Skiöld, Ryssbergets IK, sätter banrekord på Kustmarans maraton.",
  },
  {
    when: "2026",
    mark: "2026",
    title: "Drygt 200 medlemmar – och Veteran-SM",
    text: "Föreningen har drygt 200 medlemmar. Veteran-SM i halvmaraton avgörs i samband med Jämjöhalvan den 7 november.",
  },
  {
    when: "3 juli 2027",
    mark: "2027",
    title: "VSM i maraton",
    text: "Veteran-SM i maraton planeras på Kustmaran.",
    planned: true,
  },
];
