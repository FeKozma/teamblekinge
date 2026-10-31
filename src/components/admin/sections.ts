// The admin sidebar, grouped as in drawup 09: what the board can already do on
// the old site ("Som förut") and what the new site adds ("Nytt"). Only
// Dokument is built in the demo; the rest get a page saying what they'll do.

export type AdminSection = {
  slug: string;
  label: string;
  group: "Som förut" | "Nytt";
  /** What the section will do on the real site (placeholder pages). */
  about: string;
  /** Where the result shows up on the public site. */
  publicHref?: string;
  publicLabel?: string;
};

export const adminSections: AdminSection[] = [
  {
    slug: "nyheter",
    label: "Nyheter",
    group: "Som förut",
    about:
      "Skriv nyheter, välj kategori och om de är öppna för alla eller bara för medlemmar. Viktiga nyheter kan fästas under ”Viktigt nu” fram till ett visst datum.",
    publicHref: "/nyheter",
    publicLabel: "Nyheter",
  },
  {
    slug: "kalender",
    label: "Kalender",
    group: "Som förut",
    about:
      "Lägg in träningar, långpass, tävlingar och möten. Allt som läggs in syns i kalendern på webbplatsen och i medlemmarnas kalenderprenumeration.",
    publicHref: "/kalender",
    publicLabel: "Kalendern",
  },
  {
    slug: "aktiviteter",
    label: "Aktiviteter med anmälan",
    group: "Som förut",
    about:
      "Skapa anmälningar till stafetter, funktionärspass och resor – med sista anmälningsdag, antal platser och egna frågor som sträcka, fart eller platser i bil. Listan kan laddas ner när lagen ska sättas.",
    publicHref: "/nyheter",
    publicLabel: "Nyheter med anmälan",
  },
  {
    slug: "sidor",
    label: "Sidor",
    group: "Som förut",
    about:
      "Redigera de fasta sidorna – Träna med oss, Tävla, Föreningen och Bli medlem – i en enkel editor, utan att behöva kunna kod.",
    publicHref: "/trana-med-oss",
    publicLabel: "Träna med oss",
  },
  {
    slug: "dokument",
    label: "Dokument",
    group: "Som förut",
    about: "Ladda upp protokoll och styrdokument och välj vem som får se dem.",
    publicHref: "/dokument",
    publicLabel: "Dokument",
  },
  {
    slug: "sponsorer",
    label: "Sponsorer",
    group: "Som förut",
    about:
      "Lägg till samarbetspartners med logga och länk och bestäm i vilken ordning de visas. De rullar förbi längst ner på startsidan.",
    publicHref: "/",
    publicLabel: "Startsidan",
  },
  {
    slug: "klubbflodet",
    label: "Klubbflödet (moderering)",
    group: "Nytt",
    about:
      "Se inlägg och kommentarer som medlemmar har anmält och dölj det som inte hör hemma i flödet. Styrelsen får en avisering när något anmäls.",
    publicHref: "/flodet",
    publicLabel: "Klubbflödet",
  },
  {
    slug: "resultat",
    label: "Resultat",
    group: "Nytt",
    about:
      "Lägg in klubbens resultat från lopp och tävlingar. De samlas under Tävla, och klubbrekorden (All Time High) räknas fram automatiskt.",
    publicHref: "/tavla#resultat",
    publicLabel: "Resultat",
  },
  {
    slug: "traningsplan",
    label: "Träningsplan",
    group: "Nytt",
    about:
      "Planera terminens tisdagspass för de tre träningsgrupperna. Planen visas under ”Veckans träning” på startsidan och i kalendern.",
    publicHref: "/trana-med-oss",
    publicLabel: "Träna med oss",
  },
  {
    slug: "vanliga-fragor",
    label: "Vanliga frågor",
    group: "Nytt",
    about:
      "Lägg till, ändra och sortera frågor och svar. De visas under Frågor & kontakt, och de vanligaste som genvägar på startsidan.",
    publicHref: "/fragor",
    publicLabel: "Frågor & kontakt",
  },
];

export function getAdminSection(slug: string) {
  return adminSections.find((s) => s.slug === slug);
}
