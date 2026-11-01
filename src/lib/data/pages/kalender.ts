import type { PageTextsDef } from "./types";

export const kalenderTexts: PageTextsDef = {
  id: "kalender",
  label: "Kalender",
  href: "/kalender",
  related: [
    {
      href: "/admin/kalender",
      label: "Kalendern",
      text: "Träningar, möten, lopp och resor lägger du in under Kalender.",
    },
  ],
  sections: [
    {
      title: "Överst på sidan",
      fields: [
        { key: "hero.kicker", label: "Etikett ovanför rubriken", value: "Kalender" },
        { key: "hero.title", label: "Rubrik", value: "Nästa pass, nästa lopp," },
        {
          key: "hero.titleAccent",
          label: "Rubrikens slut, i orange",
          value: "nästa runda",
          hint: "Visas lutande i orange direkt efter rubriken.",
          optional: true,
        },
        {
          key: "hero.introGuest",
          label: "Ingress för besökare",
          value: "Träningar, våra egna lopp, möten och resor. Prenumerera, så hamnar allt i din egen kalender.",
          long: true,
        },
        {
          key: "hero.introMember",
          label: "Ingress för inloggade medlemmar",
          value: "Träningar, våra egna lopp, möten och resor – och löprundorna från Klubbflödet.",
          long: true,
        },
      ],
    },
    {
      title: "Rutan Prenumerera",
      fields: [
        { key: "subscribe.heading", label: "Rubrik", value: "Prenumerera" },
        {
          key: "subscribe.text",
          label: "Text",
          value:
            "Kopiera kalenderlänken och lägg till den i Google Kalender, Outlook eller Kalender på mobilen – då uppdateras den av sig själv.",
          long: true,
        },
        {
          key: "subscribe.note",
          label: "Liten text under",
          value: "Prenumerationen innehåller det som är öppet för alla, inte medlemmarnas löprundor.",
        },
      ],
    },
    {
      title: "Rutan för medlemmar",
      fields: [
        { key: "members.heading", label: "Rubrik", value: "Löprundor från flödet" },
        {
          key: "members.text",
          label: "Text",
          value: "När någon lägger upp en löprunda i Klubbflödet hamnar den här, med vilka som hänger med.",
          long: true,
        },
        { key: "members.button", label: "Knapp", value: "Lägg upp en löprunda" },
      ],
    },
    {
      title: "Rutan för besökare som inte är inloggade",
      fields: [
        { key: "guests.heading", label: "Rubrik", value: "Medlem?" },
        {
          key: "guests.text",
          label: "Text",
          value: "Logga in för att se medlemmarnas löprundor, styrelsemöten och resor i kalendern.",
          long: true,
        },
      ],
    },
    {
      title: "Kalenderprenumerationen",
      fields: [
        {
          key: "ics.description",
          label: "Beskrivning av kalendern",
          value: "Träningar, egna lopp, möten och resor – Team Blekinge Löparförening, Karlskrona.",
          hint: "Syns i Google Kalender, Outlook och mobilens kalender hos den som prenumererar.",
        },
      ],
    },
  ],
};
