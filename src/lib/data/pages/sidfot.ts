import type { PageTextsDef } from "./types";

// The footer on every page. Where the links lead is fixed; what they say is not.
export const sidfotTexts: PageTextsDef = {
  id: "sidfot",
  label: "Sidfoten (längst ner på alla sidor)",
  href: "/",
  related: [
    {
      href: "/admin/foreningsuppgifter",
      label: "Föreningsuppgifter",
      text: "Adressen och länkarna till Instagram och Facebook",
    },
  ],
  sections: [
    {
      title: "Vänstra spalten",
      fields: [
        {
          key: "place",
          label: "Ord före adressen",
          value: "Klubblokalen",
          hint: "Följs av klubblokalens adress från Föreningsuppgifter.",
        },
        { key: "contact", label: "Länk till kontaktsidan", value: "Kontakta oss" },
        {
          key: "instagram",
          label: "Instagram-knappen",
          value: "Instagram",
          hint: "Knappen visar bara en ikon. Texten läses upp för den som inte kan se den.",
        },
        {
          key: "facebook",
          label: "Facebook-knappen",
          value: "Facebookgruppen för medlemmar",
          hint: "Knappen visar bara en ikon. Texten läses upp för den som inte kan se den.",
        },
      ],
    },
    {
      title: "Mittenspalten",
      fields: [
        { key: "find.heading", label: "Rubrik", value: "Hitta" },
        { key: "find.tryOut", label: "Länk till Prova på", value: "Prova på" },
        { key: "find.training", label: "Länk till Träna med oss", value: "Träningspass" },
        { key: "find.calendar", label: "Länk till kalendern", value: "Kalender" },
        { key: "find.results", label: "Länk till resultaten under Tävla", value: "Resultatarkiv" },
      ],
    },
    {
      title: "Högra spalten",
      fields: [
        { key: "club.heading", label: "Rubrik", value: "Föreningen" },
        { key: "club.board", label: "Länk till styrelsen", value: "Styrelsen och ansvariga" },
        { key: "club.thursday", label: "Länk till Torsdagsgruppen", value: "Torsdagsgruppen" },
        { key: "club.join", label: "Länk till Bli medlem", value: "Bli medlem" },
        { key: "club.documents", label: "Länk till dokumenten", value: "Dokument & policys" },
        { key: "club.faq", label: "Länk till Frågor & kontakt", value: "Frågor & kontakt" },
      ],
    },
    {
      title: "Längst ner",
      fields: [
        {
          key: "smallPrint",
          label: "Liten text längst ner till vänster",
          value: "Ingen spårning och inga kakor att godkänna.",
          optional: true,
        },
      ],
    },
  ],
};
