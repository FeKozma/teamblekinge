import type { PageTextsDef } from "./types";

// Facts (name, year, members, address, links) come from Föreningsuppgifter;
// the texts around them are split so no editor has to learn placeholders.
export const foreningenTexts: PageTextsDef = {
  id: "foreningen",
  label: "Föreningen",
  href: "/foreningen",
  related: [
    {
      href: "/admin/foreningsuppgifter",
      label: "Föreningsuppgifter",
      text: "Namn, årtal, antal medlemmar, adress och länkar",
    },
    { href: "/admin/historia", label: "Historia", text: "Händelserna på tidslinjen" },
    { href: "/admin/styrelsen", label: "Styrelse och ansvariga", text: "Styrelsen, kommittéer och ansvariga" },
  ],
  sections: [
    {
      title: "Överst på sidan",
      fields: [
        {
          key: "hero.kicker",
          label: "Etikett ovanför rubriken",
          value: "Sedan",
          hint: "Följs av året föreningen bildades, som ändras under Föreningsuppgifter.",
        },
        { key: "hero.titleStart", label: "Rubrik, början", value: "En förening för" },
        {
          key: "hero.titleAccent",
          label: "Rubrik, de orange snedställda orden",
          value: "alla typer",
          hint: "Rubriken blir: början + de orange orden + slutet.",
        },
        { key: "hero.titleEnd", label: "Rubrik, slut", value: "av löpare", optional: true },
        {
          key: "hero.introBeforeMembers",
          label: "Ingress: mellan föreningens namn och antalet medlemmar",
          value: "har",
        },
        {
          key: "hero.introBeforeAddress",
          label: "Ingress: mellan antalet medlemmar och klubblokalens adress",
          value: "medlemmar och tränar från klubblokalen på",
          hint: "Ingressen blir: föreningens namn, texten ovan, antalet medlemmar, den här texten och adressen. Namn, antal och adress ändrar du under Föreningsuppgifter.",
        },
      ],
    },
    {
      title: "Genvägarna under ingressen",
      fields: [
        {
          key: "nav.history",
          label: "Till historien",
          value: "Historia",
          hint: "Knapparna som hoppar ner till en del av sidan.",
        },
        { key: "nav.board", label: "Till styrelsen", value: "Styrelsen" },
        { key: "nav.kit", label: "Till klubbkläderna", value: "Klubbkläder" },
        { key: "nav.policies", label: "Till policyerna", value: "Policys" },
        { key: "nav.facts", label: "Till föreningsuppgifterna", value: "Föreningsuppgifter" },
      ],
    },
    {
      title: "De tre siffrorna",
      fields: [
        {
          key: "stats.foundedText",
          label: "Under årtalet",
          value: "bildades föreningen i Sjöarp, Bräkne-Hoby",
          hint: "Årtalet och antalet medlemmar hämtas från Föreningsuppgifter.",
        },
        { key: "stats.membersText", label: "Under antalet medlemmar", value: "medlemmar – gammal som ung, mindre snabb som snabb" },
        { key: "stats.trainingBig", label: "Tredje rutan, stor text", value: "Tisdagar 18" },
        {
          key: "stats.trainingText",
          label: "Tredje rutan, text under",
          value: "intervaller i tre grupper från",
          hint: "Följs av området där klubblokalen ligger (från Föreningsuppgifter).",
        },
      ],
    },
    {
      title: "Vår historia",
      fields: [
        { key: "history.heading", label: "Rubrik", value: "Vår historia" },
        {
          key: "history.subBeforeMembers",
          label: "Text under rubriken, före antalet medlemmar",
          value: "Från en resa till Berlin Marathon till",
        },
        {
          key: "history.subAfterMembers",
          label: "Text under rubriken, efter antalet medlemmar",
          value: "medlemmar. Scrolla – du springer banan.",
        },
        {
          key: "history.planned",
          label: "Märke på händelser som inte har hänt än",
          value: "Planeras",
          hint: "Själva händelserna på tidslinjen ändrar du under Föreningen › Historia.",
        },
      ],
    },
    {
      title: "Styrelsen och ansvariga",
      fields: [
        {
          key: "board.heading",
          label: "Rubrik",
          value: "Styrelsen och ansvariga",
          hint: "Personerna ändrar du under Föreningen › Styrelse och ansvariga.",
        },
        {
          key: "board.subYear",
          label: "Text under rubriken, före årtalet",
          value: "Styrelsen",
          hint: "Följs av året för medlemsavgiften (Föreningsuppgifter).",
        },
        {
          key: "board.subContact",
          label: "Text under rubriken, före kontaktpersonens namn",
          value: "Föreningens kontaktperson är ordföranden,",
          hint: "Följs av kontaktpersonens namn från Föreningsuppgifter. Byter ni kontaktperson, se till att texten fortfarande stämmer.",
        },
        { key: "board.rolesHeading", label: "Rubrik över kommittéer och ansvariga", value: "Kommittéer och ansvariga" },
      ],
    },
    {
      title: "Klubbkläder",
      fields: [
        { key: "kit.heading", label: "Rubrik", value: "Klubbkläder" },
        {
          key: "kit.text",
          label: "Text",
          value:
            "Klubbkläderna kommer från Trimtex och beställs i klubbens webbshop. Gå gärna ihop och beställ, så blir fraktkostnaden mindre.",
          long: true,
        },
        {
          key: "kit.note",
          label: "Tips bredvid tröjan",
          value: "Ska du springa Veteran-SM? Där är det obligatoriskt att tävla i klubbens tävlingsdräkt.",
          optional: true,
        },
        {
          key: "kit.button",
          label: "Knapp till webbshoppen",
          value: "Till Trimtex webbshop",
          hint: "Adressen till webbshoppen ändrar du under Föreningsuppgifter.",
        },
        {
          key: "kit.imageAlt",
          label: "Beskrivning av bilden",
          value: "Två löpare i Team Blekinges klubbdräkt från Trimtex",
          hint: "Läses upp för den som inte kan se bilden.",
        },
      ],
    },
    {
      title: "Policys",
      fields: [
        { key: "policies.heading", label: "Rubrik", value: "Policys" },
        {
          key: "policies.sub",
          label: "Text under rubriken",
          value: "Föreningens styrdokument finns under Dokument.",
          optional: true,
        },
        { key: "policies.drugs", label: "Första rutan", value: "Drogpolicy" },
        { key: "policies.equality", label: "Andra rutan", value: "Jämställdhetspolicy" },
        {
          key: "policies.antidoping",
          label: "Tredje rutan",
          value: "Antidopingplan",
          hint: "Under den står vem som är antidopingansvarig, från Styrelse och ansvariga.",
        },
        { key: "policies.link", label: "Länktext i rutorna", value: "Läs under Dokument" },
      ],
    },
    {
      title: "Föreningsuppgifter (rutan längst ner)",
      fields: [
        {
          key: "facts.heading",
          label: "Rubrik",
          value: "Föreningsuppgifter",
          hint: "Själva uppgifterna – namn, nummer, adress och länkar – ändrar du under Föreningsuppgifter.",
        },
        { key: "facts.name", label: "Etikett före namnet", value: "Namn" },
        { key: "facts.founded", label: "Etikett före datumet då föreningen bildades", value: "Bildad" },
        { key: "facts.orgNr", label: "Etikett före organisationsnumret", value: "Org.nr" },
        { key: "facts.foreningsNr", label: "Etikett före föreningsnumret", value: "Föreningsnr" },
        { key: "facts.place", label: "Ord före adressen", value: "Klubblokalen" },
        { key: "facts.instagram", label: "Knapp till Instagram", value: "Instagram" },
        { key: "facts.facebook", label: "Knapp till Facebookgruppen", value: "Facebookgruppen" },
        {
          key: "facts.facebookName",
          label: "Facebookgruppens namn",
          value: "Team Blekinge LF medlem",
          hint: "Syns inte, men läses upp för den som inte kan se knappen.",
          optional: true,
        },
        { key: "facts.contact", label: "Länk till kontaktsidan", value: "Kontakta oss" },
      ],
    },
  ],
};
