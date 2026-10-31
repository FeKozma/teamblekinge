// News ("Nyheter"). Headlines and facts follow the current site; members-only
// items, comments and registrations are DEMO DATA for the logged-in drawups.

export const newsCategories = [
  "Tävling & resor",
  "Stafett",
  "Funktionärer",
  "Träning",
  "Långpass",
  "Styrelsen",
  "Klubbkläder",
  "Torsdagsgruppen",
] as const;

export type NewsCategory = (typeof newsCategories)[number];

export type NewsComment = {
  id: string;
  author: string; // person id in users.ts
  when: string;
  text: string;
  likes?: number;
  replies?: NewsComment[];
};

export type Registration = {
  kind: "stafett" | "funktionar" | "extern";
  dateLabel: string;
  deadline: string; // ISO date
  deadlineLabel: string;
  /** For capped registrations. */
  capacity?: number;
  /** Other members already signed up (the demo visitor's own sign-up is added on top). */
  registered?: number;
  extra?: { label: string; value: string }[];
  cta: string;
  url?: string;
  hint?: string;
  /** ISO date of the event itself, for date badges. */
  date?: string;
  /** Name in "Kommande sista dagar", e.g. "Kyrkstafetten, anmälan". */
  deadlineTitle?: string;
  /** Name in "Mina anmälningar", e.g. "Jämjöhalvan – funktionär". */
  signupTitle?: string;
  /** Bookable passes (kind "funktionar"); `taken` counts other members. */
  slots?: { id: string; label: string; capacity: number; taken: number }[];
};

export type NewsItem = {
  slug: string;
  title: string;
  category: NewsCategory;
  date: string; // ISO date
  dateLabel: string;
  excerpt: string;
  body: string[];
  author: string; // person id
  image?: string;
  imageAlt?: string;
  imagePosition?: string;
  membersOnly?: boolean;
  /** ISO date the item stays pinned under "Viktigt nu". */
  pinnedUntil?: string;
  likes?: number;
  comments: NewsComment[];
  commentCount?: number; // when more exist than are listed
  registration?: Registration;
  document?: { title: string; path: string; href: string };
  /** Time of day it was posted, e.g. "19:40". */
  time?: string;
  /** DEMO: new since the member's last visit (real site: per-member read markers). */
  unread?: boolean;
  /** DEMO: the logged-in member follows the thread. */
  followedByMe?: boolean;
};

export const news: NewsItem[] = [
  {
    slug: "veteran-sm-pa-hemmaplan",
    title: "Spring Veteran-SM på hemmaplan 7 november",
    category: "Tävling & resor",
    date: "2026-10-20",
    dateLabel: "20 okt",
    excerpt:
      "VSM i halvmaraton går i samband med Jämjöhalvan. Anmäl dig till Jämjöhalvan och kryssa i ”Delta i VSM” – och tävla i klubbdräkten.",
    body: [
      "Veteran-SM i halvmaraton avgörs i år på hemmaplan, i samband med vår egen Jämjöhalvan lördag 7 november. Veteranklasserna börjar från 35 år (födda 1991 och tidigare) i femårsintervaller.",
      "Du anmäler dig till Jämjöhalvan på mittlopp.se och kryssar i ”Delta i VSM”. Sista anmälningsdag är 31 oktober och det går inte att efteranmäla sig till VSM.",
      "Det är obligatoriskt att tävla i klubbens tävlingsdräkt – saknar du en, hör av dig så löser vi det.",
    ],
    author: "stina",
    image: "/img/jamjohalvan-affisch.jpg",
    imageAlt: "Affisch för Jämjöhalvan och Veteran-SM 2026",
    pinnedUntil: "2026-10-31",
    likes: 21,
    commentCount: 8,
    comments: [
      { id: "c1", author: "lars", when: "21 okt", text: "Anmäld! Första VSM för min del.", likes: 5 },
      {
        id: "c2",
        author: "cecilia",
        when: "22 okt",
        text: "Någon som vill samåka från stan?",
        replies: [{ id: "c2a", author: "tomas", when: "22 okt", text: "@Cecilia Jag kör från stan och har två platser." }],
      },
      { id: "c3", author: "johanna", when: "23 okt", text: "Kul att det är på hemmaplan! Ses vid start.", likes: 2 },
      {
        id: "c4",
        author: "bjorn",
        when: "25 okt",
        text: "Jag saknar tävlingsdräkt – vem hör jag av mig till?",
        replies: [{ id: "c4a", author: "stina", when: "25 okt", text: "@Björn Hör av dig till mig, så löser vi det." }],
      },
      { id: "c5", author: "fredrik", when: "28 okt", text: "Står och hejar vid varvningen i år!", likes: 4 },
      { id: "c6", author: "sara", when: "i går", text: "Tack för påminnelsen – nu är jag anmäld." },
    ],
    registration: {
      kind: "extern",
      dateLabel: "Lördag 7 november",
      deadline: "2026-10-31",
      deadlineLabel: "31 oktober",
      extra: [{ label: "Start", value: "11:00, Jämjö" }],
      cta: "Till anmälan",
      url: "https://mittlopp.se/Anmalan/Arrangemangsgrupp/RBTNJZXCBKKIEQVZPF",
      hint: "Anmälan görs på mittlopp.se – kryssa i ”Delta i VSM”. Ingen efteranmälan till VSM.",
      date: "2026-11-07",
      deadlineTitle: "Veteran-SM, anmälan",
    },
  },
  {
    slug: "kyrkstafetten",
    title: "Vi söker löpare till Kyrkstafetten",
    category: "Stafett",
    date: "2026-10-26",
    dateLabel: "26 okt",
    excerpt: "Anmäl dig med önskad sträcka – lagen sätts efter sista anmälningsdag.",
    body: [
      "Nu sätter vi ihop Team Blekinges lag till Kyrkstafetten! Anmäl dig med önskad sträcka och ungefärlig fart. Efter sista anmälningsdag gör vi lagen, och alla får besked om lag, sträcka, starttid och samlingsplats.",
      "Kör du bil? Fyll i hur många platser du har, så ordnar vi samåkningen.",
    ],
    author: "anna",
    time: "19:40",
    membersOnly: true,
    pinnedUntil: "2026-11-08",
    unread: true,
    followedByMe: true,
    likes: 12,
    comments: [
      {
        id: "k1",
        author: "bjorn",
        when: "26 okt",
        text: "Anmäld! Tar gärna en längre sträcka om det behövs.",
        likes: 3,
      },
      {
        id: "k2",
        author: "cecilia",
        when: "i dag 07:05",
        text: "Jag kan köra från Karlskrona och har tre lediga platser.",
        replies: [
          {
            id: "k3",
            author: "anna",
            when: "08:30",
            text: "@Cecilia Toppen! Fyll i det i anmälan så matchar vi samåkningen.",
          },
        ],
      },
    ],
    registration: {
      kind: "stafett",
      dateLabel: "Lördag 21 november",
      deadline: "2026-11-08",
      deadlineLabel: "8 november",
      capacity: 24,
      registered: 9,
      extra: [{ label: "Sträckor", value: "6 per lag" }],
      cta: "Anmäl dig till stafetten",
      hint: "Anmälan frågar efter sträcka, fart och platser i bil.",
      date: "2026-11-21",
      deadlineTitle: "Kyrkstafetten, anmälan",
      signupTitle: "Kyrkstafetten",
    },
  },
  {
    slug: "funktionarer-jamjohalvan",
    title: "Funktionärer till Jämjöhalvan och Jämjöhallenstafetten 7 november",
    category: "Funktionärer",
    date: "2026-10-09",
    dateLabel: "9 okt",
    excerpt:
      "Vill du vara funktionär? Välj ett pass direkt – vägvakt, start och mål, servering. Listan i klubblokalen finns kvar för den som hellre skriver upp sig där.",
    body: [
      "Jämjöhalvan går inte utan funktionärer! Välj ett pass direkt här – vägvakt, start och mål, servering eller nummerlappsutdelning.",
      "Listan i klubblokalen finns kvar för den som hellre skriver upp sig där. Alla funktionärer bjuds på lunch efter loppet.",
    ],
    author: "stina",
    membersOnly: true,
    comments: [],
    registration: {
      kind: "funktionar",
      dateLabel: "Lördag 7 november",
      deadline: "2026-11-04",
      deadlineLabel: "4 november",
      capacity: 40,
      registered: 26,
      cta: "Välj funktionärspass",
      date: "2026-11-07",
      deadlineTitle: "Funktionär Jämjöhalvan",
      signupTitle: "Jämjöhalvan – funktionär",
      slots: [
        { id: "vagvakt", label: "Vägvakt", capacity: 16, taken: 10 },
        { id: "start-mal", label: "Start och mål", capacity: 8, taken: 6 },
        { id: "servering", label: "Servering", capacity: 8, taken: 5 },
        { id: "nummerlappar", label: "Nummerlappsutdelning", capacity: 8, taken: 5 },
      ],
    },
  },
  {
    slug: "protokoll-styrelsemote-2026-10-12",
    title: "Nytt protokoll: styrelsemöte 12 oktober 2026",
    category: "Styrelsen",
    date: "2026-10-24",
    dateLabel: "24 okt",
    excerpt: "Protokollet från styrelsemötet 12 oktober finns nu under Dokument.",
    body: ["Protokollet från styrelsemötet 2026-10-12 finns nu att läsa under Dokument › Protokoll › Styrelsemöte 2026."],
    author: "stina",
    membersOnly: true,
    comments: [],
    document: {
      title: "Öppna protokollet",
      path: "Dokument › Protokoll › Styrelsemöte 2026",
      href: "/dokument/protokoll/styrelsemote-2026/2026-10-12",
    },
  },
  {
    slug: "klubbklader-trimtex",
    title: "Beställ klubbkläder hos Trimtex – nu är webbshopen öppen",
    category: "Klubbkläder",
    date: "2026-10-12",
    dateLabel: "12 okt",
    excerpt:
      "Nu kan du beställa klubbkläder från vår webbshop hos Trimtex. Gå gärna ihop och beställ, så blir fraktkostnaden mindre.",
    body: [
      "Nu kan du beställa klubbkläder från vår webbshop hos Trimtex. Registrera dig i webbshoppen och använd klubbens teamkod – den finns här i nyheten när du är inloggad.",
      "Gå gärna ihop och beställ, så blir fraktkostnaden mindre.",
    ],
    author: "stina",
    image: "/img/klubbklader-trimtex.jpg",
    imageAlt: "Två löpare i Team Blekinges klubbdräkt från Trimtex",
    imagePosition: "30% 50%",
    likes: 9,
    comments: [{ id: "t1", author: "johanna", when: "13 okt", text: "Äntligen! Beställer nya tights direkt." }],
  },
  {
    slug: "langpass-holmsjo-3-oktober",
    title: "Långpass Holmsjö 3 oktober",
    category: "Långpass",
    date: "2026-09-25",
    dateLabel: "25 sep",
    excerpt:
      "Start vid Bredasjöns IP kl. 08.30. Fyra skyltade distanser – 9, 13, 20 och 30 km – och grillen glöder när vi kommer tillbaka.",
    body: [
      "Höstens sista långpass går i Holmsjö. Start vid Bredasjöns IP kl. 08.30.",
      "Fyra skyltade distanser – 9, 13, 20 och 30 km – och grillen glöder när vi kommer tillbaka.",
    ],
    author: "tomas",
    image: "/img/holmsjo-host.jpg",
    imageAlt: "Höstfärger vid Bredasjön i Holmsjö",
    comments: [],
  },
  {
    slug: "langpass-mallsjon-12-september",
    title: "Långpass Mållsjön 12 september",
    category: "Långpass",
    date: "2026-09-03",
    dateLabel: "3 sep",
    excerpt: "Samling kl. 08.30 vid parkeringen vid Mållsjön.",
    body: ["Samling kl. 08.30 vid parkeringen vid Mållsjön. Distanser från 10 km och uppåt."],
    author: "tomas",
    comments: [],
  },
  {
    slug: "hostkickoff-gasttranare",
    title: "Höstkickoff med gästtränare den 1 september",
    category: "Träning",
    date: "2026-08-17",
    dateLabel: "17 aug",
    excerpt:
      "Tisdagsträningen blir något extra: en gästtränare håller i ett intervallpass där alla kan vara med. Alla är välkomna, gamla som nya medlemmar!",
    body: [
      "Tisdagsträningen den 1 september blir något extra: en gästtränare håller i ett intervallpass där alla kan vara med.",
      "Alla är välkomna, gamla som nya medlemmar!",
    ],
    author: "stina",
    comments: [],
  },
  {
    slug: "protokoll-styrelsemote-2026-09-07",
    title: "Nytt protokoll: styrelsemöte 7 september 2026",
    category: "Styrelsen",
    date: "2026-09-13",
    dateLabel: "13 sep",
    excerpt: "Protokollet från styrelsemötet 7 september finns nu under Dokument.",
    body: ["Protokollet från styrelsemötet 2026-09-07 finns nu att läsa under Dokument › Protokoll › Styrelsemöte 2026."],
    author: "stina",
    membersOnly: true,
    comments: [],
    document: {
      title: "Öppna protokollet",
      path: "Dokument › Protokoll › Styrelsemöte 2026",
      href: "/dokument/protokoll/styrelsemote-2026/2026-09-07",
    },
  },
  {
    slug: "protokoll-styrelsemote-augusti-2026",
    title: "Nytt protokoll från styrelsemöte",
    category: "Styrelsen",
    date: "2026-08-24",
    dateLabel: "24 aug",
    excerpt: "Ett nytt protokoll från styrelsen finns nu under Dokument.",
    body: ["Ett nytt protokoll från styrelsen finns nu att läsa under Dokument › Protokoll › Styrelsemöte 2026."],
    author: "stina",
    membersOnly: true,
    comments: [],
    document: {
      title: "Öppna protokollet",
      path: "Dokument › Protokoll › Styrelsemöte 2026",
      href: "/dokument/protokoll/styrelsemote-2026",
    },
  },
  {
    slug: "traningst-shirt",
    title: "Nu kan du beställa tränings-t-shirt, väska m.m.",
    category: "Klubbkläder",
    date: "2026-08-17",
    dateLabel: "17 aug",
    excerpt: "Tränings-t-shirt, väska och mer med klubbens logga går nu att beställa.",
    body: ["Tränings-t-shirt, väska och mer med klubbens logga går nu att beställa."],
    author: "stina",
    comments: [],
  },
];

export function getNews(slug: string) {
  return news.find((n) => n.slug === slug);
}

/** Newest first; hides members-only items for guests. */
export function listNews(opts: { members?: boolean } = {}) {
  return news
    .filter((n) => opts.members || !n.membersOnly)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function commentCount(n: NewsItem) {
  return n.commentCount ?? n.comments.reduce((s, c) => s + 1 + (c.replies?.length ?? 0), 0);
}
