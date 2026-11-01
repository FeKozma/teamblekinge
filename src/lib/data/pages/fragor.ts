import type { PageTextsDef } from "./types";

export const fragorTexts: PageTextsDef = {
  id: "fragor",
  label: "Frågor & kontakt",
  href: "/fragor",
  sections: [
    {
      title: "Överst på sidan",
      fields: [
        { key: "hero.kicker", label: "Etikett ovanför rubriken", value: "Frågor & kontakt" },
        { key: "hero.title", label: "Rubrik", value: "Vanliga frågor" },
        {
          key: "hero.intro",
          label: "Ingress",
          value: "Svar på det vi oftast får frågor om via mejl. Hittar du inte svaret? Hör av dig.",
          long: true,
        },
      ],
    },
    {
      title: "Kontakt",
      fields: [
        { key: "contact.heading", label: "Rubrik", value: "Kontakt" },
        { key: "contact.sub", label: "Text under rubriken", value: "Skriv till oss, eller kom förbi en tisdag." },
        { key: "contact.formHeading", label: "Rubrik på formuläret", value: "Skriv till oss" },
      ],
    },
  ],
};
