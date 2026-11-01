import type { PageTextsDef } from "./types";

export const startsidaTexts: PageTextsDef = {
  id: "startsida",
  label: "Startsidan",
  href: "/",
  related: [
    {
      href: "/admin/aktuellt",
      label: "Aktuellt-bandet",
      text: "Den orange raden allra överst: visa, dölj och ändra",
    },
    {
      href: "/admin/traning",
      label: "Träning",
      text: "Grupperna och kvällens pass under Veckans träning",
    },
    {
      href: "/admin/lopp",
      label: "Våra lopp",
      text: "Loppen i det mörka bandet och nedräkningen",
    },
    {
      href: "/admin/sponsorer",
      label: "Sponsorer",
      text: "Loggorna längst ner på sidan",
    },
  ],
  sections: [
    {
      title: "Överst: rubrik och bild",
      fields: [
        {
          key: "hero.kickerBefore",
          label: "Etikett ovanför rubriken, före året",
          value: "Sedan",
          hint: "Följs av året föreningen bildades, från Föreningsuppgifter.",
        },
        {
          key: "hero.kickerAfter",
          label: "Etikett ovanför rubriken, efter året",
          value: "· Bastasjöområdet, Karlskrona",
          optional: true,
        },
        { key: "hero.titleStart", label: "Rubrik, början", value: "Löparklubb i Karlskrona – för" },
        {
          key: "hero.titleAccent",
          label: "Rubrik, orden i orange (lutar)",
          value: "alla typer",
          optional: true,
        },
        { key: "hero.titleEnd", label: "Rubrik, slutet", value: "av löpare", optional: true },
        {
          key: "hero.introBefore",
          label: "Ingress, text före adressen",
          value:
            "Gammal som ung, mindre snabb som snabb. Varje tisdag kl. 18 tränar vi intervaller i tre grupper från klubblokalen på",
          hint: "Mellan texterna står klubblokalens adress, t.ex. ”Tennvägen 11 A i Torskors”. Adressen ändrar du under Föreningsuppgifter.",
        },
        {
          key: "hero.introAfter",
          label: "Ingress, text efter adressen",
          value: ".",
          hint: "Står direkt efter adressen – här bara en punkt.",
          optional: true,
        },
        { key: "hero.primary", label: "Orange knapp (till Prova på)", value: "Prova på gratis" },
        { key: "hero.secondary", label: "Ljus knapp (till Bli medlem)", value: "Bli medlem" },
        {
          key: "hero.check",
          label: "Rad med bock under knapparna",
          value: "Prova upp till tre träningspass gratis innan du blir medlem.",
          optional: true,
        },
        {
          key: "hero.countdown",
          label: "Text efter loppets namn i nedräkningen",
          value: "start om",
          hint: "Nedräkningen visar nästa lopp under Våra lopp, t.ex. ”Jämjöhalvan · start om”.",
        },
      ],
    },
    {
      title: "Veckans träning",
      fields: [
        { key: "week.heading", label: "Rubrik", value: "Veckans träning" },
        {
          key: "week.tonight",
          label: "Ord före datumet när det är träning i kväll",
          value: "I kväll",
          hint: "Visas på tisdagar, t.ex. ”I kväll, tisdag 3 november”.",
        },
        {
          key: "week.place",
          label: "Plats före adressen",
          value: "Klubblokalen",
          hint: "Under rubriken står datum · tid · plats, t.ex. ”Klubblokalen, Tennvägen 11 A, Torskors”.",
        },
        { key: "week.all", label: "Länk till hela terminsplanen", value: "Hela terminsplanen" },
        {
          key: "week.missing",
          label: "Text när kvällens pass inte är inlagt",
          value: "[Kvällens pass enligt terminsplanen]",
        },
        { key: "week.missingShort", label: "…samma, kort version på mobilen", value: "[Pass]" },
        {
          key: "week.meet",
          label: "Ord före tiden för en grupp som samlas en annan tid",
          value: "Samling",
          hint: "T.ex. ”Samling 17:45” på Hälsagruppens kort.",
        },
        {
          key: "week.newText",
          label: "Text under korten",
          value: "Ny? Läs Prova på – vilken grupp som passar dig och var du parkerar.",
          optional: true,
        },
        {
          key: "week.newLinkTry",
          label: "Ord i texten som blir en länk till Prova på",
          value: "Prova på",
          hint: "Skriv orden exakt som de står i texten ovanför.",
          optional: true,
        },
        {
          key: "week.newLinkParking",
          label: "Ord i texten som blir en länk till parkeringen",
          value: "var du parkerar",
          hint: "Skriv orden exakt som de står i texten ovanför.",
          optional: true,
        },
      ],
    },
    {
      title: "Genvägar (bara på mobilen)",
      fields: [
        { key: "quick.results", label: "Genväg till resultaten", value: "Resultat & rekord" },
        { key: "quick.faq", label: "Genväg till vanliga frågor", value: "Vanliga frågor" },
      ],
    },
    {
      title: "Senaste nytt",
      fields: [
        { key: "news.heading", label: "Rubrik", value: "Senaste nytt", hint: "Nyheterna själva skriver du under Nyheter." },
        { key: "news.all", label: "Länk till alla nyheter", value: "Alla nyheter" },
      ],
    },
    {
      title: "Kommande aktiviteter (i högerspalten)",
      fields: [
        {
          key: "upcoming.heading",
          label: "Rubrik",
          value: "Kommande aktiviteter",
          hint: "Aktiviteterna kommer från kalendern.",
        },
        { key: "upcoming.own", label: "Tillägg efter platsen för klubbens egna lopp", value: "eget lopp" },
        { key: "upcoming.all", label: "Länk till kalendern", value: "Hela kalendern" },
        { key: "upcoming.subscribe", label: "Länk för att prenumerera på kalendern", value: "Prenumerera (iCal)" },
      ],
    },
    {
      title: "Bli medlem (orange rutan i högerspalten)",
      fields: [
        { key: "join.heading", label: "Rubrik", value: "Bli medlem" },
        {
          key: "join.text",
          label: "Text efter avgiften och året",
          value: "oavsett när på året du går med. Prova gärna upp till tre pass först.",
          hint: "Texten börjar med avgiften och året från Föreningsuppgifter: ”650 kr för hela 2026,”.",
        },
        { key: "join.button", label: "Knapp", value: "Så blir du medlem" },
      ],
    },
    {
      title: "Följ oss (i högerspalten)",
      fields: [
        { key: "follow.heading", label: "Rubrik", value: "Följ oss" },
        { key: "follow.instagram", label: "Länk till Instagram", value: "Instagram" },
        {
          key: "follow.text",
          label: "Liten text",
          value: "Medlem? Nyheter för medlemmar och Klubbflödet – löprundor, bilder och prat – finns när du loggat in.",
          optional: true,
        },
        {
          key: "follow.textLink",
          label: "Ord i texten som blir en länk till inloggningen",
          value: "loggat in",
          hint: "Skriv orden exakt som de står i texten ovanför.",
          optional: true,
        },
      ],
    },
    {
      title: "Våra lopp (det mörka bandet)",
      fields: [
        {
          key: "races.heading",
          label: "Rubrik",
          value: "Våra lopp",
          hint: "Loppen och knapparna på korten ändrar du under Våra lopp.",
        },
        { key: "races.results", label: "Länk till resultaten", value: "Resultat från våra lopp" },
      ],
    },
    {
      title: "Vanliga frågor",
      fields: [
        {
          key: "faq.heading",
          label: "Rubrik",
          value: "Vanliga frågor",
          hint: "De fyra översta frågorna under Vanliga frågor visas här.",
        },
        { key: "faq.text", label: "Text under rubriken", value: "Svar på det vi oftast får frågor om via mejl." },
        { key: "faq.all", label: "Länk till alla frågor", value: "Alla frågor och svar" },
      ],
    },
    {
      title: "Samarbetspartners (längst ner)",
      fields: [
        {
          key: "partners.heading",
          label: "Rubrik",
          value: "Samarbetspartners",
          hint: "Loggorna ändrar du under Sponsorer.",
        },
      ],
    },
    {
      title: "Medlemmarnas startsida (när man är inloggad)",
      fields: [
        {
          key: "member.meetBefore",
          label: "Rad under Veckans träning, text före adressen",
          value: "Samling 18:00 vid klubblokalen,",
          hint: "Mellan texterna står gatuadressen, t.ex. ”Tennvägen 11 A”. Ändras tiderna för grupperna, ändra tiderna här också.",
        },
        {
          key: "member.meetAfter",
          label: "Rad under Veckans träning, text efter adressen",
          value: "– Hälsagruppen 17:45.",
          optional: true,
        },
      ],
    },
  ],
};
