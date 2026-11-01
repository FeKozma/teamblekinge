import type { PageTextsDef } from "./types";

const addressHint =
  "Mellan texterna står klubblokalens adress, t.ex. ”Tennvägen 11 A i Torskors”. Adressen ändrar du under Föreningsuppgifter.";
const timesHint = "Ändras tiderna för grupperna, ändra tiderna i texten också.";

export const tranaTexts: PageTextsDef = {
  id: "trana-med-oss",
  label: "Träna med oss",
  href: "/trana-med-oss",
  related: [
    {
      href: "/admin/traning",
      label: "Träning",
      text: "Grupperna, terminsplanen och långpassen",
    },
    {
      href: "/admin/foreningsuppgifter",
      label: "Föreningsuppgifter",
      text: "Adressen, medlemsavgiften och kontaktpersoner",
    },
  ],
  sections: [
    {
      title: "Överst på sidan",
      fields: [
        {
          key: "hero.kicker",
          label: "Etikett ovanför rubriken",
          value: "Varje tisdag",
          hint: "Följs av stadsdel och stad från Föreningsuppgifter: ”· Torskors, Karlskrona”.",
        },
        { key: "hero.title", label: "Rubrik", value: "Träna med" },
        {
          key: "hero.titleAccent",
          label: "Sista ordet i rubriken (lutar, i orange)",
          value: "oss",
          optional: true,
        },
        {
          key: "hero.introBefore",
          label: "Ingress, text före adressen",
          value:
            "Intervaller varje tisdag kl. 18 för vuxna och lite äldre ungdomar i Bastasjöområdet. Vi samlas vid klubblokalen på",
          hint: `${addressHint} ${timesHint}`,
        },
        {
          key: "hero.introAfter",
          label: "Ingress, text efter adressen",
          value: "– och fikar tillsammans efteråt.",
          optional: true,
        },
      ],
    },
    {
      title: "Snabblänkar under rubriken",
      fields: [
        { key: "jump.groups", label: "Till grupperna", value: "Grupperna" },
        { key: "jump.health", label: "Till Hälsagruppen", value: "Hälsagruppen" },
        { key: "jump.plan", label: "Till terminsplanen", value: "Terminsplan" },
        { key: "jump.try", label: "Till Prova på", value: "Prova på" },
        { key: "jump.longRuns", label: "Till långpassen", value: "Långpass" },
        { key: "jump.thursday", label: "Till Torsdagsgruppen", value: "Torsdagsgruppen" },
        { key: "jump.parking", label: "Till Hitta hit", value: "Hitta hit" },
      ],
    },
    {
      title: "Grupperna",
      fields: [
        { key: "groups.heading", label: "Rubrik", value: "Tre grupper på tisdagar" },
        {
          key: "groups.subBefore",
          label: "Text under rubriken, före adressen",
          value: "Samling vid klubblokalen,",
          hint: "Mellan texterna står gatuadressen, t.ex. ”Tennvägen 11 A”.",
        },
        {
          key: "groups.subAfter",
          label: "Text under rubriken, efter adressen",
          value: "· genomgång kl. 18:00 · gemensam fika efteråt",
          hint: timesHint,
          optional: true,
        },
        {
          key: "groups.day",
          label: "Veckodag före tiden på korten",
          value: "Tisdagar",
          hint: "Korten visar t.ex. ”Tisdagar 18:00”. Gruppernas namn, tider och texter ändrar du under Träning.",
        },
        { key: "groups.healthLink", label: "Länk på Hälsagruppens kort", value: "Mer om Hälsagruppen" },
        {
          key: "groups.help",
          label: "Text under korten",
          value: "Osäker på vilken grupp som passar? Läs Vilken grupp ska jag välja? bland våra vanliga frågor.",
          optional: true,
        },
        {
          key: "groups.helpLink",
          label: "Ord i texten som blir en länk till Vanliga frågor",
          value: "Vilken grupp ska jag välja?",
          hint: "Skriv orden exakt som de står i texten ovanför.",
          optional: true,
        },
      ],
    },
    {
      title: "Hälsagruppen (det lila bandet)",
      fields: [
        { key: "health.heading", label: "Rubrik", value: "Hälsagruppen" },
        {
          key: "health.quote",
          label: "Citat i stor stil",
          value: "”Här finns inga krav på att du tränat löpning tidigare.”",
        },
        {
          key: "health.text",
          label: "Text",
          value: "Vi varvar löpning och promenad och lägger till övningar för styrka och balans. Målet är att må bra.",
          long: true,
        },
        {
          key: "health.when",
          label: "Text före Hälsagruppens tid",
          value: "Tisdagar, samling",
          hint: "Följs av Hälsagruppens tid från Träning, t.ex. ”17:45”.",
        },
        {
          key: "health.place",
          label: "Text före adressen",
          value: "Klubblokalen",
          hint: "Följs av gatuadressen, t.ex. ”Klubblokalen, Tennvägen 11 A”.",
        },
        { key: "health.button", label: "Knapp", value: "Prova på i Hälsagruppen" },
        { key: "health.rhythmLabel", label: "Rubrik i rutan med det rullande bandet", value: "Passets rytm" },
        { key: "health.rhythmRun", label: "Ord för löpning i bandet", value: "Spring" },
        { key: "health.rhythmWalk", label: "Ord för promenad i bandet", value: "Gå" },
        { key: "health.rhythmStrength", label: "Ord för styrka i bandet", value: "Styrka" },
        { key: "health.rhythmBalance", label: "Ord för balans i bandet", value: "Balans" },
        {
          key: "health.rhythmText",
          label: "Text under bandet",
          value: "Löpning och promenad om vartannat – i den takt som passar dig.",
        },
      ],
    },
    {
      title: "Terminsplan",
      fields: [
        { key: "plan.heading", label: "Rubrik", value: "Terminsplan" },
        {
          key: "plan.sub",
          label: "Text under rubriken",
          value: "Kvällens pass per grupp. Samma tid och plats varje tisdag.",
          hint: "Själva passen fyller du i under Träning.",
        },
        { key: "plan.next", label: "Etikett på nästa träning", value: "Nästa träning" },
        {
          key: "plan.empty",
          label: "Text när inga kommande tisdagar finns i planen",
          value: "[Terminsplanen för nästa termin publiceras här]",
        },
      ],
    },
    {
      title: "Prova på (det orange bandet)",
      fields: [
        { key: "try.heading", label: "Rubrik", value: "Prova på" },
        {
          key: "try.sub",
          label: "Text under rubriken",
          value: "Du får vara med på upp till 3 träningspass innan du går med i föreningen.",
        },
        { key: "try.step1Title", label: "Steg 1, rubrik", value: "Välj grupp" },
        {
          key: "try.step1Text",
          label: "Steg 1, text",
          value: "Långa gruppen (ca 10 km), korta gruppen (ca 5 km) eller Hälsagruppen – där finns inga krav alls.",
        },
        { key: "try.step2Title", label: "Steg 2, rubrik", value: "Kom till klubblokalen" },
        {
          key: "try.step2Text",
          label: "Steg 2, text efter adressen",
          value: "Genomgången börjar kl. 18:00 – Hälsagruppen samlas redan 17:45.",
          hint: `Texten börjar med adressen, t.ex. ”Tennvägen 11 A i Torskors.”. ${timesHint}`,
          optional: true,
        },
        { key: "try.step3Title", label: "Steg 3, rubrik", value: "Träna upp till 3 pass" },
        {
          key: "try.step3Text",
          label: "Steg 3, text",
          value: "Du väljer själv vilka, intervall eller långdistans. Sedan bestämmer du dig för om du vill bli medlem.",
        },
        { key: "try.whenTitle", label: "Första mörka rutan, rubrik", value: "När ska jag komma?" },
        {
          key: "try.whenText",
          label: "Första mörka rutan, text",
          value: "Kom i god tid före genomgången kl. 18:00 (Hälsagruppen 17:45), så hinner du hälsa och hitta rätt grupp.",
          hint: timesHint,
        },
        { key: "try.bringTitle", label: "Andra mörka rutan, rubrik", value: "Vad tar jag med?" },
        {
          key: "try.bringText",
          label: "Andra mörka rutan, text",
          value: "Kläder efter väder och skor som du kan springa i.",
        },
        { key: "try.afterTitle", label: "Tredje mörka rutan, rubrik", value: "Och sedan?" },
        {
          key: "try.afterText",
          label: "Tredje mörka rutan, text",
          value: "Gemensam fika efter passet. Vill du stanna kvar blir du medlem.",
        },
        { key: "try.findButton", label: "Knapp till Hitta hit", value: "Hitta hit" },
        { key: "try.joinButton", label: "Knapp till Bli medlem", value: "Så blir du medlem" },
      ],
    },
    {
      title: "Långpass",
      fields: [
        { key: "longRuns.heading", label: "Rubrik", value: "Långpass" },
        {
          key: "longRuns.sub",
          label: "Text under rubriken",
          value: "En gång i månaden · från 10 km upp till minst halvmara, ibland 30 km",
        },
        {
          key: "longRuns.text",
          label: "Text",
          value:
            "En gång i månaden springer vi långt tillsammans, från olika samlingsplatser. Distanserna går från 10 km och upp till minst halvmaraton – ibland 30 km.",
          long: true,
        },
        {
          key: "longRuns.note",
          label: "Liten text under",
          value:
            "En deltagaravgift täcker vätska och fika ([belopp]). Samlingsplats och starttid kommer som en nyhet inför varje pass.",
          optional: true,
        },
        {
          key: "longRuns.noteLink",
          label: "Ord i texten som blir en länk till Nyheter",
          value: "nyhet",
          hint: "Skriv ordet exakt som det står i texten ovanför.",
          optional: true,
        },
        {
          key: "longRuns.listHeading",
          label: "Rubrik över långpassens datum",
          value: "Långpassen",
          hint: "Året läggs till efter, t.ex. ”Långpassen 2026”. Datumen och platserna ändrar du under Träning.",
        },
        { key: "longRuns.next", label: "Text före nästa långpass", value: "Nästa långpass:" },
        {
          key: "longRuns.done",
          label: "Text när årets alla långpass är sprungna",
          value: "Årets alla långpass är sprungna.",
        },
        {
          key: "longRuns.doneMore",
          label: "…och texten efter",
          value: "[Datum för långpassen 2027 publiceras här]",
          optional: true,
        },
      ],
    },
    {
      title: "Torsdagsgruppen",
      fields: [
        {
          key: "thursday.badge",
          label: "Etikett på den mörka rutan",
          value: "60+ eller dagledig",
        },
        {
          key: "thursday.feeText",
          label: "Text under beloppet i den mörka rutan",
          value: "för hela årets aktiviteter – medlemskapet ingår.",
          hint: "Beloppet är medlemsavgiften från Föreningsuppgifter.",
        },
        { key: "thursday.heading", label: "Rubrik", value: "Torsdagsgruppen" },
        {
          key: "thursday.textBefore",
          label: "Text före adressen",
          value: "För dig som är 60+ eller dagledig. Vi ses torsdagar kl. 10:00 vid klubblokalen på",
          hint: "Mellan texterna står gatuadressen, t.ex. ”Tennvägen 11 A”.",
        },
        {
          key: "thursday.textAfter",
          label: "Text efter adressen",
          value: ", tar en promenad i Bastasjöskogen och fikar sedan tillsammans.",
          optional: true,
        },
        {
          key: "thursday.contact",
          label: "Text före kontaktpersonen",
          value: "Kontaktperson:",
          hint: "Namnet hämtas från Styrelse och ansvariga (uppdraget som heter Torsdagsgruppen).",
        },
        { key: "thursday.contactLink", label: "Länk till kontaktformuläret", value: "Kontakta oss" },
        {
          key: "thursday.next",
          label: "Rubrik över nästa torsdagar",
          value: "Nästa torsdagar",
          hint: "Datumen kommer från kalendern.",
        },
      ],
    },
    {
      title: "Hitta hit & parkering",
      fields: [
        { key: "parking.heading", label: "Rubrik", value: "Hitta hit & parkering" },
        {
          key: "parking.place",
          label: "Rubrik i adressrutan",
          value: "Klubblokalen",
          hint: "Står också på huset i skissen. Adressen ändrar du under Föreningsuppgifter.",
        },
        { key: "parking.mapButton", label: "Knapp till kartan", value: "Öppna i Google Maps" },
        { key: "parking.title", label: "Rubrik i parkeringsrutan", value: "Parkering" },
        {
          key: "parking.text",
          label: "Text i parkeringsrutan",
          value: "Gröna ytor går bra att parkera på. Undvik de rödmarkerade ytorna.",
        },
        { key: "parking.green", label: "Förklaring till grönt", value: "Grönt – här går det bra att parkera" },
        { key: "parking.red", label: "Förklaring till rött", value: "Rött – undvik, håll fritt" },
        {
          key: "parking.caption",
          label: "Text under skissen",
          value: "Schematisk skiss, inte skalenlig. [Klubbens riktiga parkeringskarta läggs in här]",
          optional: true,
        },
      ],
    },
  ],
};
