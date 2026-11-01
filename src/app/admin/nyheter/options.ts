import type { Registration } from "@/lib/data/news";

// Choices shared by the news editor (client) and its actions (server).

export type RegKind = Registration["kind"];

export const regKinds: { value: RegKind | ""; label: string; about: string }[] = [
  { value: "", label: "Ingen anmälan", about: "Nyheten informerar bara." },
  {
    value: "extern",
    label: "Anmälan på annan webbplats",
    about: "T.ex. ett lopp på mittlopp.se. Nyheten visar datum, sista dag och en knapp dit.",
  },
  {
    value: "stafett",
    label: "Anmälan här – stafett",
    about: "Medlemmarna anmäler sig här med önskad sträcka, fart och platser i bil.",
  },
  {
    value: "funktionar",
    label: "Funktionärspass",
    about: "Medlemmarna väljer ett pass här, t.ex. vägvakt eller servering.",
  },
];

/** The sign-up button's text until the editor writes another. */
export const defaultCta: Record<RegKind, string> = {
  extern: "Till anmälan",
  stafett: "Anmäl dig till stafetten",
  funktionar: "Välj funktionärspass",
};

export const audiences = [
  { value: "alla", label: "Alla", about: "Syns för alla som besöker webbplatsen." },
  {
    value: "medlemmar",
    label: "Bara medlemmar",
    about: "Syns när man har loggat in. Den som får en länk utan att vara inloggad ser bara rubrik och ingress.",
  },
] as const;
