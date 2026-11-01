import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { IconKey, IconLock, IconPeople } from "@/components/icons";
import { JumpNav, wrap } from "@/components/public/layout";
import { Page, PageHero, SectionHeading } from "@/components/ui";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Så fungerar demon",
  description: "Vad som händer på riktigt på nya teamblekinge.nu – och vad demon gör i stället.",
  robots: { index: false },
};

// A plain account of the demo vs. the real site, for the board and anyone the
// demo is shown to. Describes how the site is meant to work — no club facts.

type Row = { area: string; admin?: string; real: ReactNode; demo: ReactNode };

const rows: Row[] = [
  {
    area: "Nyheter",
    admin: "/admin/nyheter",
    real: "Styrelsen skriver, ändrar och tar bort nyheter. En nyhet kan vara öppen för alla eller bara för medlemmar, fästas under ”Viktigt nu” och ha en anmälan. De som följer kategorin får ett mejl – direkt, en gång om dagen eller i veckobrevet, som var och en valt. Öppna nyheter går också ut via RSS.",
    demo: "Allt i administrationen fungerar, men inga mejl skickas – efter publicering står det vilka som skulle ha fått ett.",
  },
  {
    area: "Kalender",
    admin: "/admin/kalender",
    real: "Enstaka händelser och återkommande pass läggs in i administrationen. Ett enskilt pass kan ställas in med en orsak. Den som prenumererar på kalendern i mobilen eller datorn får ändringarna automatiskt.",
    demo: "Ändringarna syns i kalendern på webbplatsen. En kalenderapp som prenumererar ser bara originalet, och mejlet om inställda pass skickas inte.",
  },
  {
    area: "Dokument",
    admin: "/admin/dokument",
    real: "Protokoll och andra PDF:er laddas upp i rätt mapp, med val av vem som får se dem – alla, medlemmar eller bara styrelsen. Rättigheten kontrolleras varje gång någon öppnar en fil. Ett nytt protokoll kan meddelas medlemmarna som en nyhet.",
    demo: "Du kan ladda upp riktiga PDF:er och öppna dem i webbläsarens PDF-läsare. Exempeldokumenten är genererade platshållare – inga riktiga protokoll.",
  },
  {
    area: "Sidtexter och föreningsuppgifter",
    admin: "/admin/sidor",
    real: "Rubriker och texter på de fasta sidorna, avgift, Swish, adress, styrelse, sponsorer, träningsgrupper, terminsplan och loppen ändras i enkla formulär. Ändrar man avgiften på ett ställe, ändras den överallt.",
    demo: "Fungerar fullt ut – men bara för dig.",
  },
  {
    area: "Medlemmens egna inställningar",
    real: "Varje medlem väljer själv vilka mejl hen vill ha och fyller i e-post och telefon under Inställningar.",
    demo: "Sparas bara i din webbläsare. Inga mejl skickas.",
  },
  {
    area: "Klubbflödet, gilla, kommentarer och anmälningar",
    real: "Medlemmarna skriver inlägg, bjuder in till löprundor, kommenterar och anmäler sig. Allt sparas på servern och syns för de andra medlemmarna.",
    demo: "Sparas bara i din webbläsare. ”Återställ demons klick” längst ner tömmer det.",
  },
];

const later = [
  { title: "Resultat", text: "Klubbens resultat läggs in och klubbrekorden räknas fram automatiskt." },
  { title: "Anmälningar", text: "Se vilka som anmält sig till stafetter och funktionärspass och ladda ner listan." },
  { title: "Moderering av Klubbflödet", text: "Dölja inlägg som anmälts, med avisering till styrelsen." },
  { title: "Ändringshistorik", text: "Se vem som ändrade vad, och ångra en ändring." },
  { title: "Schemalagd publicering", text: "Skriv nyheten nu, låt den publiceras en viss dag." },
  { title: "Fler roller", text: "T.ex. tränare som bara får ändra träningsplanen, eller en stafettansvarig som sköter anmälningarna." },
];

function Fact({ icon, title, children, i }: { icon: ReactNode; title: string; children: ReactNode; i: number }) {
  return (
    <div
      className="card flex flex-col gap-3 p-5 md:p-6"
      data-settle
      style={{ "--rest-rotate": i % 2 ? "0.8deg" : "-0.8deg", "--reveal-i": i } as CSSProperties}
    >
      <span className="flex h-11 w-11 -rotate-3 items-center justify-center rounded-lg bg-orange-soft text-orange-dark">
        {icon}
      </span>
      <h3 className="m-0 text-[19px] font-extrabold">{title}</h3>
      <div className="flex flex-col gap-2 text-[15px] text-muted">{children}</div>
    </div>
  );
}

export default async function AboutDemoPage() {
  const user = await getSession();
  const board = user?.role === "board";
  return (
    <Page>
      <PageHero
        kicker="Om demon"
        title="Så fungerar det på riktigt"
        intro="Det här är en klickbar demo av nya teamblekinge.nu. Den visar hur webbplatsen ska fungera – här står vad som händer på riktigt, och vad demon gör i stället."
      >
        <JumpNav
          links={[
            { href: "#grunderna", label: "Grunderna" },
            { href: "#avsnitt", label: "Avsnitt för avsnitt" },
            { href: "#senare", label: "Kan komma senare" },
          ]}
        />
      </PageHero>

      <div className={`${wrap} flex flex-col gap-14 pt-6 pb-24`}>
        <section id="grunderna" className="flex scroll-mt-4 flex-col gap-5">
          <SectionHeading>Grunderna</SectionHeading>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Fact icon={<IconKey size={22} />} title="Inloggning" i={0}>
              <p className="m-0">
                Medlemmar loggar in med sin e-postadress – de får en inloggningslänk – eller med en passkey. Inga
                lösenord att komma ihåg.
              </p>
              <p className="m-0 font-semibold text-ink">
                Demo: välj Ingrid (medlem) eller Stina (styrelsen) på{" "}
                <Link href="/logga-in" className="text-orange-dark">
                  Logga in
                </Link>
                .
              </p>
            </Fact>
            <Fact icon={<IconPeople size={22} />} title="Vem får ändra" i={1}>
              <p className="m-0">
                Konton med rollen styrelse ser Administration i menyn och kan ändra allt innehåll. Ingen behöver kunna
                något tekniskt: fyll i, tryck Spara.
              </p>
              <p className="m-0">
                Den som är inloggad i styrelsen får också en knapp ”Ändra den här sidan” på webbplatsen, som leder
                rakt till rätt ställe.
              </p>
            </Fact>
            <Fact icon={<IconLock size={22} />} title="Var det sparas" i={2}>
              <p className="m-0">
                Innehållet sparas i en databas och filerna i en fillagring på servern. En ändring syns direkt för alla
                besökare.
              </p>
              <p className="m-0 font-semibold text-ink">
                Demo: det du ändrar syns bara för dig och försvinner när du stänger webbläsaren.
              </p>
            </Fact>
          </div>
          {board ? (
            <Link href="/admin" className="btn btn-dark self-start">
              Till administrationen
            </Link>
          ) : (
            <p className="m-0 text-[15px] text-muted">
              Vill du prova administrationen?{" "}
              <Link href="/logga-in?next=/admin" className="font-semibold">
                Logga in som Stina
              </Link>
              .
            </p>
          )}
        </section>

        <section id="avsnitt" className="flex scroll-mt-4 flex-col gap-5">
          <SectionHeading tone="purple">Avsnitt för avsnitt</SectionHeading>
          <div className="card overflow-hidden" data-reveal="up">
            <div className="hidden grid-cols-[1fr_2fr_1.5fr] gap-6 bg-paper px-5 py-3 text-[13px] font-bold text-muted md:grid">
              <span>Avsnitt</span>
              <span>På riktigt</span>
              <span>I demon</span>
            </div>
            <ul className="m-0 list-none divide-y divide-line p-0">
              {rows.map((r) => (
                <li key={r.area} className="grid grid-cols-1 gap-2 px-5 py-4 md:grid-cols-[1fr_2fr_1.5fr] md:gap-6">
                  <span className="flex flex-col gap-1">
                    <span className="font-extrabold">{r.area}</span>
                    {board && r.admin && (
                      <Link href={r.admin} className="text-[14px] font-semibold">
                        Öppna i administrationen
                      </Link>
                    )}
                  </span>
                  <p className="m-0 text-[15px]">
                    <span className="mr-1.5 text-[12px] font-bold tracking-[0.5px] text-muted uppercase md:hidden">
                      På riktigt:
                    </span>
                    {r.real}
                  </p>
                  <p className="m-0 rounded-lg bg-purple-soft px-3 py-2 text-[14px] text-purple md:self-start">
                    <span className="mr-1.5 text-[12px] font-bold tracking-[0.5px] uppercase md:hidden">I demon:</span>
                    {r.demo}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="senare" className="flex scroll-mt-4 flex-col gap-5">
          <SectionHeading tone="ink" sub="Inte byggt i demon ännu – men tänkt att komma.">
            Kan komma senare
          </SectionHeading>
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {later.map((l, i) => (
              <li
                key={l.title}
                className="flex flex-col gap-1 rounded-xl border border-dashed border-[#cfc8c4] bg-white/60 p-4"
                data-reveal="up"
                style={{ "--reveal-i": i } as CSSProperties}
              >
                <span className="font-bold">{l.title}</span>
                <span className="text-[14px] text-muted">{l.text}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Page>
  );
}
