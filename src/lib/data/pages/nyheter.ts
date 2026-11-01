import type { PageTextsDef } from "./types";

export const nyheterTexts: PageTextsDef = {
  id: "nyheter",
  label: "Nyheter",
  href: "/nyheter",
  related: [
    { href: "/admin/nyheter", label: "Nyheterna", text: "Skriv nya, ändra eller ta bort nyheter" },
  ],
  sections: [
    {
      title: "Överst på sidan",
      fields: [
        { key: "hero.title", label: "Rubrik", value: "Nyheter" },
        {
          key: "hero.intro",
          label: "Ingress",
          value:
            "Meddelanden från styrelsen, tränarna och arrangörerna. Som inloggad ser du även nyheter som bara är för medlemmar.",
          long: true,
        },
        {
          key: "hero.login",
          label: "Knapp för den som inte är inloggad",
          value: "Logga in för medlemsnyheter",
        },
      ],
    },
    {
      title: "Listan med nyheter",
      fields: [
        {
          key: "list.pinned",
          label: "Rubrik över fästa nyheter",
          value: "Viktigt nu",
          hint: "Visas bara när någon nyhet är fäst.",
        },
        { key: "list.latest", label: "Rubrik över de senaste nyheterna", value: "Senaste" },
        { key: "list.more", label: "Knapp längst ner i listan", value: "Visa fler nyheter" },
      ],
    },
    {
      title: "Ruta för den som inte är inloggad",
      fields: [
        {
          key: "guest.title",
          label: "Rubrik",
          value: "Fler nyheter är bara för medlemmar",
          hint: "Antalet nyheter som bara är för medlemmar visas bredvid.",
        },
        {
          key: "guest.text",
          label: "Text",
          value: "Anmälningar, funktionärspass och protokoll från styrelsen syns när du loggat in.",
          long: true,
        },
        { key: "guest.button", label: "Knapp", value: "Logga in" },
      ],
    },
    {
      title: "Spalten bredvid listan",
      fields: [
        {
          key: "aside.deadlines",
          label: "Rubrik över sista anmälningsdagar",
          value: "Kommande sista dagar",
          hint: "Visas bara när någon anmälan är öppen.",
        },
        { key: "aside.archive", label: "Rubrik över äldre år", value: "Tidigare nyheter" },
      ],
    },
    {
      title: "Missa inget",
      fields: [
        { key: "notify.title", label: "Rubrik", value: "Missa inget", hint: "Visas på Nyheter och bredvid varje nyhet." },
        {
          key: "notify.text",
          label: "Text",
          value: "Få nyheter per mejl direkt, som dagssammanfattning eller veckobrev – du väljer per kategori.",
          long: true,
        },
        { key: "notify.button", label: "Knapp för inloggade", value: "Ställ in aviseringar" },
        { key: "notify.login", label: "Knapp för den som inte är inloggad", value: "Logga in och ställ in" },
        { key: "notify.rss", label: "Länk till RSS", value: "Nyheter via RSS" },
      ],
    },
    {
      title: "En nyhet som bara är för medlemmar",
      fields: [
        {
          key: "locked.title",
          label: "Rubrik i rutan",
          value: "Den här nyheten är bara för medlemmar",
          hint: "Visas för den som öppnar en länk till nyheten utan att vara inloggad.",
        },
        {
          key: "locked.text",
          label: "Text i rutan",
          value: "Logga in med din e-postadress – vi skickar en inloggningslänk, inget lösenord behövs.",
          long: true,
        },
      ],
    },
  ],
};
