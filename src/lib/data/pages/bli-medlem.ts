import type { PageTextsDef } from "./types";

// The fee, its year, Swish and bankgiro come from Föreningsuppgifter; the
// texts around them are split so no editor has to learn placeholders.
const factsHint = "Avgiften, årtalet, Swish och bankgiro ändrar du under Föreningsuppgifter.";

export const bliMedlemTexts: PageTextsDef = {
  id: "bli-medlem",
  label: "Bli medlem",
  href: "/bli-medlem",
  related: [
    {
      href: "/admin/foreningsuppgifter",
      label: "Föreningsuppgifter",
      text: "Medlemsavgift, årtal, Swish och bankgiro",
    },
  ],
  sections: [
    {
      title: "Överst på sidan",
      fields: [
        {
          key: "hero.kicker",
          label: "Etikett ovanför rubriken: mellan avgiften och årtalet",
          value: "för hela",
          hint: `Etiketten blir t.ex. ”650 kr för hela 2026”. ${factsHint}`,
        },
        { key: "hero.titleStart", label: "Rubrik, början", value: "Bli" },
        {
          key: "hero.titleAccent",
          label: "Rubrik, det orange snedställda ordet",
          value: "medlem",
          hint: "Rubriken blir: början + det orange ordet.",
        },
        { key: "hero.introBeforeYear", label: "Ingress: före årtalet", value: "Avgiften för" },
        { key: "hero.introBeforeFee", label: "Ingress: mellan årtalet och avgiften", value: "är" },
        {
          key: "hero.introAfterFee",
          label: "Ingress: efter avgiften",
          value: "per person och gäller för hela året, oavsett när på året du betalar in den.",
          hint: "Ingressen blir t.ex. ”Avgiften för 2026 är 650 kr per person …”.",
        },
        { key: "hero.apply", label: "Knapp till ansökan", value: "Ansök nu" },
        { key: "hero.tryFirst", label: "Knapp till Prova på", value: "Prova på först" },
      ],
    },
    {
      title: "Så går det till",
      fields: [
        { key: "steps.heading", label: "Rubrik", value: "Så går det till" },
        {
          key: "steps.sub",
          label: "Text under rubriken",
          value: "Fyra sträckor – och stafettpinnen går vidare till dig.",
          optional: true,
        },
        {
          key: "steps.leg",
          label: "Ordet före stegets nummer",
          value: "Sträcka",
          hint: "Står överst i varje steg: ”Sträcka 1”, ”Sträcka 2” …",
        },
        { key: "steps.1.title", label: "Steg 1: rubrik", value: "Prova på" },
        {
          key: "steps.1.text",
          label: "Steg 1: text",
          value: "Var med på upp till 3 träningspass. Du väljer själv vilka, intervall eller långdistans.",
        },
        {
          key: "steps.1.link",
          label: "Steg 1: länk till Prova på under Träna med oss",
          value: "Så går det till",
          optional: true,
        },
        { key: "steps.2.title", label: "Steg 2: rubrik", value: "Ansök" },
        { key: "steps.2.before", label: "Steg 2: text före länken", value: "Fyll i" },
        { key: "steps.2.link", label: "Steg 2: länken till ansökan", value: "ansökan" },
        { key: "steps.2.after", label: "Steg 2: text efter länken", value: "med namn och kontaktuppgifter." },
        {
          key: "steps.3.title",
          label: "Steg 3: rubrik",
          value: "Betala",
          hint: "Följs av avgiften, t.ex. ”Betala 650 kr”.",
        },
        { key: "steps.3.beforeSwish", label: "Steg 3: text före Swishnumret", value: "När ansökan är godkänd: Swish" },
        {
          key: "steps.3.beforeBankgiro",
          label: "Steg 3: text mellan Swishnumret och bankgironumret",
          value: "eller bankgiro",
          hint: factsHint,
        },
        { key: "steps.4.title", label: "Steg 4: rubrik", value: "Välkommen!" },
        {
          key: "steps.4.text",
          label: "Steg 4: text",
          value: "Nu är du medlem – automatiskt, tills du själv säger upp medlemskapet.",
        },
      ],
    },
    {
      title: "Det här ingår",
      fields: [
        { key: "included.heading", label: "Rubrik", value: "Det här ingår" },
        {
          key: "included.subMiddle",
          label: "Text under rubriken: mellan avgiften och årtalet",
          value: "för hela",
        },
        {
          key: "included.subEnd",
          label: "Text under rubriken: efter årtalet",
          value: "– oavsett när på året du går med.",
          hint: "Texten blir t.ex. ”650 kr för hela 2026 – oavsett när på året du går med.”",
        },
        { key: "included.1.title", label: "Ruta 1 (sköld): rubrik", value: "Olycksfallsförsäkring" },
        { key: "included.1.text", label: "Ruta 1: text", value: "Ingår i medlemsavgiften och gäller på föreningens träningar." },
        { key: "included.2.title", label: "Ruta 2 (löpare): rubrik", value: "Alla träningar" },
        {
          key: "included.2.text",
          label: "Ruta 2: text",
          value: "Intervaller i tre grupper på tisdagar, Hälsagruppen och månadens långpass.",
        },
        { key: "included.3.title", label: "Ruta 3 (biljett): rubrik", value: "Subventionerade startavgifter" },
        { key: "included.3.text", label: "Ruta 3: text", value: "Föreningen betalar en del av startavgiften till vissa tävlingar." },
        { key: "included.4.title", label: "Ruta 4 (buss): rubrik", value: "Bussresor till självkostnadspris" },
        { key: "included.4.text", label: "Ruta 4: text", value: "Till en del tävlingar åker vi buss tillsammans." },
        { key: "included.member.lead", label: "Första faktarutan: fetstil i början", value: "Medlem tills du säger upp." },
        {
          key: "included.member.text",
          label: "Första faktarutan: text",
          value: "Du är medlem automatiskt tills du säger upp medlemskapet – du betalar bara årets avgift.",
        },
        { key: "included.thursday.lead", label: "Andra faktarutan: fetstil i början", value: "Torsdagsgruppen" },
        { key: "included.thursday.beforeFee", label: "Andra faktarutan: text före avgiften", value: "(60+ eller dagledig):" },
        {
          key: "included.thursday.afterFee",
          label: "Andra faktarutan: text efter avgiften",
          value: "för hela årets aktiviteter, medlemskapet ingår.",
        },
        {
          key: "included.thursday.link",
          label: "Andra faktarutan: länk till Torsdagsgruppen",
          value: "Läs mer",
          optional: true,
        },
      ],
    },
    {
      title: "Ansök om medlemskap",
      fields: [
        { key: "apply.heading", label: "Rubrik", value: "Ansök om medlemskap" },
        {
          key: "apply.text",
          label: "Text under rubriken",
          value: "Har du provat på och vill fortsätta? Fyll i ansökan. När den är godkänd betalar du årets avgift.",
          long: true,
        },
        {
          key: "apply.payHeading",
          label: "Orange betalrutan: rubrik",
          value: "Betala",
          hint: "Följs av avgiften, t.ex. ”Betala 650 kr”.",
        },
        { key: "apply.swish", label: "Orange betalrutan: etikett före Swishnumret", value: "Swish" },
        { key: "apply.bankgiro", label: "Orange betalrutan: etikett före bankgironumret", value: "Bankgiro" },
        { key: "apply.payNote", label: "Orange betalrutan: text längst ner", value: "Betala först när ansökan är godkänd." },
        { key: "apply.faqLink", label: "Länk till Frågor & kontakt", value: "Fler frågor om medlemskapet" },
        { key: "apply.formHeading", label: "Rubrik på formuläret", value: "Ansökan" },
      ],
    },
    {
      title: "Ansökningsformuläret",
      fields: [
        { key: "form.name", label: "Fält: namn", value: "Namn" },
        { key: "form.email", label: "Fält: e-post", value: "E-post" },
        { key: "form.emailExample", label: "Exempel som står i e-postfältet", value: "namn@exempel.se" },
        { key: "form.phone", label: "Fält: telefon", value: "Telefon" },
        { key: "form.optional", label: "Efter fält man inte måste fylla i", value: "(valfritt)" },
        { key: "form.groupQuestion", label: "Frågan om träningsgrupp", value: "Vilken grupp vill du träna i?" },
        { key: "form.group.langa", label: "Val 1: namn", value: "Långa gruppen" },
        { key: "form.group.langaHint", label: "Val 1: liten text", value: "Tisdagar 18:00, ca 10 km" },
        { key: "form.group.korta", label: "Val 2: namn", value: "Korta gruppen" },
        { key: "form.group.kortaHint", label: "Val 2: liten text", value: "Tisdagar 18:00, ca 5 km" },
        { key: "form.group.halsa", label: "Val 3: namn", value: "Hälsagruppen" },
        { key: "form.group.halsaHint", label: "Val 3: liten text", value: "Tisdagar 17:45, inga krav" },
        { key: "form.group.torsdag", label: "Val 4: namn", value: "Torsdagsgruppen" },
        { key: "form.group.torsdagHint", label: "Val 4: liten text", value: "Torsdagar 10:00, 60+ eller dagledig" },
        { key: "form.group.unsure", label: "Val 5: namn", value: "Vet inte än" },
        {
          key: "form.group.unsureHint",
          label: "Val 5: liten text",
          value: "Vi hjälper dig att välja",
          hint: "Val 5 är förvalt.",
        },
        { key: "form.submit", label: "Knappen som skickar", value: "Skicka ansökan" },
      ],
    },
    {
      title: "När ansökan är skickad",
      fields: [
        {
          key: "thanks.heading",
          label: "Rubrik",
          value: "Tack",
          hint: "Följs av förnamnet: ”Tack, Anna!”",
        },
        {
          key: "thanks.beforeFee",
          label: "Text före avgiften",
          value: "På riktigt går ansökan till föreningen. När den är godkänd betalar du",
        },
        { key: "thanks.beforeSwish", label: "Text före Swishnumret", value: "med Swish" },
        {
          key: "thanks.beforeBankgiro",
          label: "Text före bankgironumret",
          value: "eller bankgiro",
          hint: factsHint,
        },
        {
          key: "thanks.thursday",
          label: "Tillägg för den som valt Torsdagsgruppen",
          value: "– i Torsdagsgruppen ingår medlemskapet i årets avgift.",
          optional: true,
        },
        { key: "thanks.planButton", label: "Knapp till terminsplanen", value: "Se terminsplanen" },
        { key: "thanks.again", label: "Knapp för att fylla i igen", value: "Fyll i igen" },
      ],
    },
  ],
};
