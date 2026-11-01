// The admin's sections, grouped by what the board wants to do. Sections with
// `planned` are not built yet: /admin/[section] shows what they will do.

export const adminGroups = ["Innehåll", "Föreningen", "Träning & tävling", "Medlemmar"] as const;

export type AdminSection = {
  slug: string;
  label: string;
  group: (typeof adminGroups)[number];
  /** One line on the start page: what you do here. */
  about: string;
  /** Not built yet — a placeholder page describes it. */
  planned?: boolean;
  /** Where the result shows up on the public site. */
  publicHref?: string;
  publicLabel?: string;
};

export const adminSections: AdminSection[] = [
  {
    slug: "nyheter",
    label: "Nyheter",
    group: "Innehåll",
    about: "Skriv nya nyheter, ändra eller ta bort gamla. Välj om de är för alla eller bara för medlemmar.",
    publicHref: "/nyheter",
    publicLabel: "Nyheter",
  },
  {
    slug: "kalender",
    label: "Kalender",
    group: "Innehåll",
    about: "Lägg in träningar, möten, lopp och resor. De syns i kalendern och i medlemmarnas kalenderprenumeration.",
    publicHref: "/kalender",
    publicLabel: "Kalendern",
  },
  {
    slug: "dokument",
    label: "Dokument",
    group: "Innehåll",
    about: "Ladda upp protokoll, policys och andra PDF:er och välj vem som får se dem.",
    publicHref: "/dokument",
    publicLabel: "Dokument",
  },
  {
    slug: "aktuellt",
    label: "Aktuellt-bandet",
    group: "Innehåll",
    about: "Den orange raden överst på startsidan: visa eller dölj den, text, länk och sista dag.",
    publicHref: "/",
    publicLabel: "Startsidan",
  },
  {
    slug: "sidor",
    label: "Sidtexter",
    group: "Innehåll",
    about: "Ändra rubriker och texter på de fasta sidorna – Startsidan, Träna med oss, Föreningen och de andra.",
    publicHref: "/",
    publicLabel: "Startsidan",
  },
  {
    slug: "foreningsuppgifter",
    label: "Föreningsuppgifter",
    group: "Föreningen",
    about: "Medlemsavgift, Swish och bankgiro, adress, kontaktperson och länkar till sociala medier.",
    publicHref: "/bli-medlem",
    publicLabel: "Bli medlem",
  },
  {
    slug: "styrelsen",
    label: "Styrelse och ansvariga",
    group: "Föreningen",
    about: "Vilka som sitter i styrelsen och vem som ansvarar för vad.",
    publicHref: "/foreningen#styrelsen",
    publicLabel: "Föreningen",
  },
  {
    slug: "historia",
    label: "Historia",
    group: "Föreningen",
    about: "Händelserna på tidslinjen under Föreningen. Lägg till en ny när något stort händer.",
    publicHref: "/foreningen#historia",
    publicLabel: "Föreningen",
  },
  {
    slug: "vanliga-fragor",
    label: "Vanliga frågor",
    group: "Föreningen",
    about: "Lägg till, ändra och sortera frågor och svar. De fyra första visas också på startsidan.",
    publicHref: "/fragor",
    publicLabel: "Frågor & kontakt",
  },
  {
    slug: "sponsorer",
    label: "Sponsorer",
    group: "Föreningen",
    about: "Samarbetspartners med logga och länk. De rullar förbi längst ner på startsidan.",
    publicHref: "/",
    publicLabel: "Startsidan",
  },
  {
    slug: "traning",
    label: "Träning",
    group: "Träning & tävling",
    about: "Träningsgrupperna, terminens tisdagspass och årets långpass.",
    publicHref: "/trana-med-oss",
    publicLabel: "Träna med oss",
  },
  {
    slug: "lopp",
    label: "Våra lopp",
    group: "Träning & tävling",
    about: "Jämjöhalvan, Kustmaran och de andra: datum, distanser, avgifter och anmälan.",
    publicHref: "/tavla",
    publicLabel: "Tävla",
  },
  {
    slug: "resultat",
    label: "Resultat",
    group: "Träning & tävling",
    planned: true,
    about:
      "Lägg in klubbens resultat från lopp och tävlingar. De samlas under Tävla, och klubbrekorden (All Time High) räknas fram automatiskt.",
    publicHref: "/tavla#resultat",
    publicLabel: "Resultat",
  },
  {
    slug: "aktiviteter",
    label: "Anmälningar",
    group: "Medlemmar",
    planned: true,
    about:
      "Se vilka som anmält sig till stafetter, funktionärspass och resor – och ladda ner listan när lagen ska sättas.",
    publicHref: "/nyheter",
    publicLabel: "Nyheter med anmälan",
  },
  {
    slug: "klubbflodet",
    label: "Klubbflödet",
    group: "Medlemmar",
    planned: true,
    about:
      "Se inlägg och kommentarer som medlemmar har anmält och dölj det som inte hör hemma i flödet. Styrelsen får en avisering när något anmäls.",
    publicHref: "/flodet",
    publicLabel: "Klubbflödet",
  },
];

export function getAdminSection(slug: string) {
  return adminSections.find((s) => s.slug === slug);
}
