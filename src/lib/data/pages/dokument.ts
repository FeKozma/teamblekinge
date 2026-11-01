import type { PageTextsDef } from "./types";

export const dokumentTexts: PageTextsDef = {
  id: "dokument",
  label: "Dokument",
  href: "/dokument",
  sections: [
    {
      title: "Överst på sidan",
      fields: [
        { key: "hero.kicker", label: "Etikett ovanför rubriken", value: "Dokument" },
        { key: "hero.title", label: "Rubrik", value: "Protokoll, policys och stadgar" },
        {
          key: "hero.introGuest",
          label: "Ingress för besökare som inte är inloggade",
          value:
            "Föreningens styrdokument samlade på ett ställe. Protokollen från styrelsemöten och årsmöten är för medlemmar – logga in så ser du dem.",
          long: true,
        },
        {
          key: "hero.introMember",
          label: "Ingress för inloggade medlemmar",
          value:
            "Föreningens protokoll och styrdokument samlade på ett ställe. Dela gärna länkar: den som inte är inloggad loggar in och hamnar direkt rätt.",
          long: true,
        },
      ],
    },
  ],
  related: [
    {
      href: "/admin/dokument/mappar",
      label: "Dokument och mappar",
      text: "Själva dokumenten, mapparna och vem som får se dem",
    },
  ],
};
