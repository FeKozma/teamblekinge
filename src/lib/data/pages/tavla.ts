import type { PageTextsDef } from "./types";

export const tavlaTexts: PageTextsDef = {
  id: "tavla",
  label: "Tävla",
  href: "/tavla",
  related: [
    {
      href: "/admin/lopp",
      label: "Våra lopp",
      text: "Loppen: datum, distanser, avgifter, anmälan och resultatraderna",
    },
    {
      href: "/admin/kalender",
      label: "Kalender",
      text: "Planeringsträffen för Åka och tävla",
    },
  ],
  sections: [
    {
      title: "Överst på sidan",
      fields: [
        { key: "hero.kicker", label: "Etikett ovanför rubriken", value: "Egna lopp · åka och tävla · resultat" },
        { key: "hero.title", label: "Rubrik", value: "Tävla" },
        {
          key: "hero.intro",
          label: "Ingress",
          value:
            "Vi arrangerar Jämjöhalvan i november och Kustmaran & Kristianopel Runt i juli – i år avgörs också Veteran-SM i halvmaraton i Jämjö. Och vi åker gärna och tävlar tillsammans.",
          long: true,
        },
        {
          key: "hero.countdown",
          label: "Text efter loppets namn i nedräkningen",
          value: "start om",
          hint: "Nedräkningen visar nästa lopp, t.ex. ”Jämjöhalvan · start om”.",
        },
      ],
    },
    {
      title: "Snabblänkar under rubriken",
      fields: [
        { key: "jump.races", label: "Till loppen", value: "Våra lopp" },
        { key: "jump.travel", label: "Till Åka och tävla", value: "Åka och tävla" },
        { key: "jump.results", label: "Till resultaten", value: "Resultat" },
      ],
    },
    {
      title: "Våra lopp",
      fields: [
        {
          key: "races.heading",
          label: "Rubrik",
          value: "Våra lopp",
          hint: "Loppen och knapparna på korten ändrar du under Våra lopp.",
        },
      ],
    },
    {
      title: "Åka och tävla (det mörka bandet)",
      fields: [
        { key: "travel.heading", label: "Rubrik", value: "Åka och tävla" },
        {
          key: "travel.sub",
          label: "Text under rubriken",
          value: "Det är roligare att tävla tillsammans. Som medlem får du hjälp på vägen till andras lopp.",
        },
        { key: "travel.perk1Title", label: "Första kortet, rubrik", value: "Subventionerade startavgifter" },
        {
          key: "travel.perk1Text",
          label: "Första kortet, text",
          value: "Föreningen betalar en del av startavgiften till vissa tävlingar.",
        },
        { key: "travel.perk2Title", label: "Andra kortet, rubrik", value: "Bussresor till självkostnadspris" },
        {
          key: "travel.perk2Text",
          label: "Andra kortet, text",
          value: "Till en del tävlingar ordnar vi bussresa – du betalar bara vad det kostar.",
        },
        {
          key: "travel.meeting",
          label: "Etikett på nästa planeringsträff",
          value: "Planeringsträff",
          hint: "Träffen hämtas från kalendern.",
        },
        { key: "travel.calendar", label: "Länk till kalendern", value: "Se i kalendern" },
        {
          key: "travel.noMeeting",
          label: "Text när ingen träff är inlagd",
          value: "[Nästa planeringsträff publiceras i kalendern]",
        },
      ],
    },
    {
      title: "Resultat",
      fields: [
        { key: "results.heading", label: "Rubrik", value: "Resultat" },
        {
          key: "results.sub",
          label: "Text under rubriken",
          value: "Resultat från våra egna lopp, år för år – och klubbens egna listor.",
          hint: "Raderna för varje lopp ändrar du under Våra lopp.",
        },
        { key: "results.upcoming", label: "Etikett på årets lopp fram till loppdagen", value: "Kommer" },
        {
          key: "results.upcomingBefore",
          label: "Årets lopp före loppdagen: text före datumet",
          value: "Avgörs",
          hint: "Mellan texterna står loppets datum, t.ex. ”7 nov”.",
        },
        {
          key: "results.upcomingAfter",
          label: "Årets lopp före loppdagen: text efter datumet",
          value: "– resultatet publiceras här efter loppet.",
          optional: true,
        },
        {
          key: "results.pending",
          label: "Årets lopp efter loppdagen, om raden inte har någon text",
          value: "[Resultatet publiceras här]",
        },
        { key: "results.records", label: "Rubrik på banrekorden", value: "Banrekord" },
        { key: "results.colTime", label: "Banrekord, kolumnen för tid", value: "Tid" },
        { key: "results.colName", label: "Banrekord, kolumnen för namn", value: "Namn" },
        { key: "results.colRace", label: "Banrekord, kolumnen för lopp", value: "Lopp" },
        { key: "results.colYear", label: "Banrekord, kolumnen för år", value: "År" },
        { key: "results.lists", label: "Rubrik över klubbens listor", value: "Klubbens listor" },
        { key: "results.list1Title", label: "Första listan, rubrik", value: "Tävlingsresultat 2026" },
        {
          key: "results.list1Text",
          label: "Första listan, text",
          value: "[Medlemmarnas resultat från årets tävlingar]",
        },
        { key: "results.list2Title", label: "Andra listan, rubrik", value: "All Time High" },
        {
          key: "results.list2Text",
          label: "Andra listan, text",
          value: "[Klubbens bästa tider genom åren, per distans]",
        },
        { key: "results.list3Title", label: "Tredje listan, rubrik", value: "Årens utmärkelser" },
        { key: "results.list3Text", label: "Tredje listan, text", value: "[Utmärkelser per år]" },
        { key: "results.calendar", label: "Länk längst ner", value: "Se kommande lopp och resor i kalendern" },
      ],
    },
    {
      title: "Sidan för varje lopp",
      fields: [
        {
          key: "race.back",
          label: "Länk tillbaka till alla lopp",
          value: "Alla lopp",
          hint: "Texterna här gäller alla loppens sidor. Det som är unikt för ett lopp ändrar du under Våra lopp.",
        },
        { key: "race.firstStart", label: "Text före första starttiden", value: "Första start" },
        { key: "race.signupButton", label: "Orange knapp (till anmälan)", value: "Anmälan" },
        { key: "race.distancesButton", label: "Ljus knapp (till distanserna)", value: "Distanser & starttider" },
        { key: "race.countdown", label: "Etikett över nedräkningen", value: "Start om" },
        { key: "race.done", label: "Text när loppet är avgjort", value: "Loppet är avgjort" },
        { key: "race.resultsLink", label: "Länk till resultaten när loppet är avgjort", value: "Resultat" },
        { key: "race.distances", label: "Rubrik på distanserna", value: "Distanser & starttider" },
        { key: "race.colDistance", label: "Kolumnen för distans", value: "Distans" },
        { key: "race.colStart", label: "Kolumnen för start", value: "Start" },
        { key: "race.colFee", label: "Kolumnen för avgift", value: "Avgift" },
        { key: "race.colNote", label: "Kolumnen för notering", value: "Notering" },
        {
          key: "race.noFee",
          label: "Förklaring när en distans saknar avgift",
          value: "– betyder att ingen avgift är publicerad för distansen.",
        },
        { key: "race.fees", label: "Rubrik på avgiftstrappan", value: "Avgifter" },
        {
          key: "race.feesSub",
          label: "Text under rubriken på avgiftstrappan",
          value: "Ju tidigare du anmäler dig, desto lägre avgift.",
        },
        { key: "race.signup", label: "Rubrik i det orange anmälningsbandet", value: "Anmälan" },
        { key: "race.signupLabel", label: "Etikett över anmälningsknappen", value: "Anmäl dig" },
        { key: "race.soon", label: "Etikett innan anmälan har öppnat", value: "Snart" },
        { key: "race.closedLabel", label: "Etikett när loppet är avgjort", value: "Avgjort" },
        { key: "race.closed", label: "Text när loppet är avgjort", value: "Anmälan är stängd" },
        { key: "race.facts", label: "Rubrik på Bra att veta", value: "Bra att veta" },
        { key: "race.records", label: "Rubrik på banrekorden", value: "Banrekord" },
        { key: "race.more", label: "Rubrik på de andra loppen", value: "Fler lopp" },
        { key: "race.related", label: "Etikett på lopp som hänger ihop", value: "Hänger ihop" },
        { key: "race.toRace", label: "Länk på de andra loppens kort", value: "Till loppet" },
      ],
    },
  ],
};
