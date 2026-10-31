// Klubbflödet — members' own posts. DEMO DATA modelled on the drawups.

export type FeedKind = "lopprunda" | "bild" | "fraga" | "kop-salj" | "meddelande";

export const feedKindLabel: Record<FeedKind, string> = {
  lopprunda: "Löprunda",
  bild: "Bild",
  fraga: "Fråga eller tips",
  "kop-salj": "Köp & sälj",
  meddelande: "Meddelande",
};

export type FeedComment = {
  id: string;
  author: string;
  when: string;
  text: string;
  likes?: number;
};

export type FeedPost = {
  id: string;
  author: string; // person id
  group?: string; // e.g. "Torsdagsgruppen"
  when: string;
  kind: FeedKind;
  title?: string;
  text: string;
  run?: {
    date: string; // ISO
    headline: string; // "Lördag 09:00 · Klubblokalen → Mörtsjön"
    detail: string;
    joiners: string[]; // person ids
    done?: boolean;
    /** Start time and meeting place on their own, for the calendar. */
    time?: string; // "09:00"
    place?: string;
  };
  image?: { src: string; alt: string };
  cta?: { label: string; href: string };
  highlight?: boolean;
  likes: number;
  likedByMe?: boolean;
  comments: FeedComment[];
  /** Older comments, folded away behind "Visa N tidigare kommentarer". */
  earlierComments?: FeedComment[];
  commentCount?: number;
  unread?: boolean;
};

export const feed: FeedPost[] = [
  {
    id: "p-mortsjon",
    author: "tomas",
    when: "4 tim sedan",
    kind: "lopprunda",
    text: "Tänkte mig ett långpass på lördag, fart efter kamrat. Om vi blir några fixar jag lite energi vid Mörtsjön!",
    run: {
      date: "2026-10-31",
      headline: "Lördag 09:00 · Klubblokalen → Mörtsjön",
      detail: "Tillbaka samma väg eller via Rödeby · fart efter kamrat",
      joiners: ["sara", "lars", "johanna"],
      time: "09:00",
      place: "Klubblokalen",
    },
    likes: 6,
    comments: [],
    unread: true,
  },
  {
    id: "p-fika",
    author: "sara",
    when: "6 dagar sedan",
    kind: "bild",
    title: "Tack för en härlig dag allihop – fika i solen efter passet!",
    text: "",
    image: { src: "/img/fika-i-solen.jpg", alt: "Klubbmedlemmar fikar på en filt i solen efter ett långpass" },
    likes: 30,
    likedByMe: true,
    commentCount: 8,
    earlierComments: [
      { id: "f0a", author: "tomas", when: "6 d", text: "Härlig bild!" },
      { id: "f0b", author: "anna", when: "6 d", text: "Tack för sällskapet, precis vad jag behövde." },
      { id: "f0c", author: "bjorn", when: "6 d", text: "Vilket väder vi fick!", likes: 2 },
      { id: "f0d", author: "cecilia", when: "6 d", text: "Bästa fikat på länge." },
      { id: "f0e", author: "lars", when: "6 d", text: "Mer sånt här!" },
      { id: "f0f", author: "fredrik", when: "5 d", text: "Synd att jag missade – nästa gång är jag med." },
      { id: "f0g", author: "stina", when: "5 d", text: "Tack alla som kom!" },
    ],
    comments: [{ id: "f1", author: "johanna", when: "5 d", text: "Vilken dag! Med nästa gång." }],
  },
  {
    id: "p-torsdag",
    author: "lars",
    group: "Torsdagsgruppen",
    when: "6 dagar sedan",
    kind: "lopprunda",
    text: "Torsdagslöpning igen! En lite lugnare löptur på 8–10 km, cirka 6 min/km beroende på vilka som kommer. Välkomna!",
    run: {
      date: "2026-10-22",
      headline: "Torsdag 17:30 · Västra Marks IP",
      detail: "Vid omklädningsrummen · 8–10 km · ca 6 min/km",
      joiners: ["fredrik", "cecilia", "bjorn", "anna", "tomas"],
      done: true,
      time: "17:30",
      place: "Västra Marks IP",
    },
    likes: 4,
    comments: [{ id: "t1", author: "fredrik", when: "5 d", text: "Ska försöka hinna dit i tid!" }],
  },
  {
    id: "p-enkat",
    author: "stina",
    when: "i går",
    kind: "meddelande",
    text: "Glöm inte att svara på enkäten ”Fest och skoj med Team Blekinge”!",
    highlight: true,
    cta: { label: "Till enkäten", href: "#" },
    likes: 4,
    commentCount: 1,
    earlierComments: [{ id: "e1", author: "cecilia", when: "i går", text: "Svarat!" }],
    comments: [],
    unread: true,
  },
  {
    id: "p-skor",
    author: "fredrik",
    when: "1 vecka sedan",
    kind: "kop-salj",
    text: "Säljer ett par knappt använda terrängskor, strl 43. 300 kr – hör av dig här eller på tisdag!",
    likes: 2,
    comments: [],
  },
];
