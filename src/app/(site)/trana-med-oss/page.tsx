import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconCheck, IconClock, IconMapPin, IconRunner } from "@/components/icons";
import { Band, BandHeading, DemoNote, JumpNav, mapsUrl, wrap } from "@/components/public/layout";
import { IconCoffee, IconExternal } from "@/components/public/icons";
import { LongRunTrack } from "@/components/public/LongRunTrack";
import { ParkingSketch } from "@/components/public/ParkingSketch";
import { ArrowLink, DateBadge, Page, PageHero, Pill, SectionHeading } from "@/components/ui";
import { club, longRuns2026, termPlan, trainingGroups, type TrainingGroup } from "@/lib/data/club";
import { getEvents } from "@/lib/content/events";
import { longDate, todayISO } from "@/lib/format";

export const metadata: Metadata = {
  title: "Träna med oss",
  description:
    "Intervaller varje tisdag kl. 18 i tre grupper från klubblokalen på Tennvägen 11 A i Torskors, Karlskrona. Hälsagruppen, långpass, Torsdagsgruppen och prova på.",
};

const address = `${club.address.street}, ${club.address.zip} ${club.address.city}`;

// What the old site says about each group, beyond the shared data in club.ts.
const groupDetails: Record<TrainingGroup["id"], { distance: string; suits: string; needs: string[] }> = {
  langa: {
    distance: "ca 10 km",
    suits: "Lite längre intervallpass för de lite mer erfarna löparna.",
    needs: ["Du klarar cirka 10 km löpning", "Inga skadesymtom", "Du har sprungit någorlunda regelbundet ett par månader"],
  },
  korta: {
    distance: "ca 5 km",
    suits: "Lite kortare intervallpass för dig som är mindre van.",
    needs: ["Du klarar cirka 5 km löpning", "Inga skadesymtom", "Du har sprungit någorlunda regelbundet ett par månader"],
  },
  halsa: {
    distance: "Gå & spring",
    suits: "Löpning varvat med promenad, plus styrka och balans.",
    needs: ["Inga krav på att du tränat löpning tidigare"],
  },
};

const toneTop = { ink: "bg-ink", orange: "bg-orange", purple: "bg-purple" } as const;

export default function TrainWithUsPage() {
  const today = todayISO();
  return (
    <Page>
      <PageHero
        kicker="Varje tisdag · Torskors, Karlskrona"
        title={
          <>
            Träna med <span className="tilt-pop inline-block -rotate-3 text-orange">oss</span>
          </>
        }
        intro="Intervaller varje tisdag kl. 18 för vuxna och lite äldre ungdomar i Bastasjöområdet. Vi samlas vid klubblokalen på Tennvägen 11 A i Torskors – och fikar tillsammans efteråt."
      >
        <JumpNav
          links={[
            { href: "#grupper", label: "Grupperna" },
            { href: "#halsagruppen", label: "Hälsagruppen" },
            { href: "#terminsplan", label: "Terminsplan" },
            { href: "#prova-pa", label: "Prova på" },
            { href: "#langpass", label: "Långpass" },
            { href: "#torsdagsgruppen", label: "Torsdagsgruppen" },
            { href: "#parkering", label: "Hitta hit" },
          ]}
        />
      </PageHero>
      <Groups />
      <HealthGroup />
      <TermPlan today={today} />
      <TryItOut />
      <LongRuns today={today} />
      <ThursdayGroup today={today} />
      <Parking />
    </Page>
  );
}

function Groups() {
  const rests = ["-1deg", "0.8deg", "-0.6deg"];
  return (
    <section id="grupper" className={`${wrap} flex scroll-mt-4 flex-col gap-6 pt-8 pb-16`}>
      <SectionHeading sub="Samling vid klubblokalen, Tennvägen 11 A · genomgång kl. 18:00 · gemensam fika efteråt">
        Tre grupper på tisdagar
      </SectionHeading>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-start gap-6">
        {trainingGroups.map((g, i) => {
          const d = groupDetails[g.id];
          return (
            <article
              key={g.id}
              data-settle
              style={{ "--rest-rotate": rests[i], "--reveal-i": i } as CSSProperties}
              className="straighten-hover relative flex flex-col gap-3 overflow-hidden rounded-[4px_4px_12px_12px] border border-line bg-white p-5 pt-7 shadow-[0_10px_24px_rgba(34,30,31,0.10)]"
            >
              <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-2 ${toneTop[g.tone]}`} />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Pill tone={g.tone}>{g.name}</Pill>
                <span className="text-[13px] font-extrabold tracking-[0.5px] text-muted uppercase">{d.distance}</span>
              </div>
              <h3 className="m-0 flex items-center gap-2 text-[26px] font-extrabold tracking-[-0.5px]">
                <IconClock size={22} className="text-orange-dark" />
                {g.time}
              </h3>
              <p className="m-0 text-[16px]">{d.suits}</p>
              <ul className="m-0 flex list-none flex-col gap-1.5 border-t border-line p-0 pt-3 text-[15px] text-muted">
                {d.needs.map((n) => (
                  <li key={n} className="flex gap-2">
                    <IconCheck size={18} strokeWidth={2.6} className="mt-0.5 flex-none text-orange-dark" />
                    {n}
                  </li>
                ))}
              </ul>
              {g.id === "halsa" && (
                <ArrowLink href="#halsagruppen" className="mt-1">
                  Mer om Hälsagruppen
                </ArrowLink>
              )}
            </article>
          );
        })}
      </div>
      <p className="m-0 text-[15px] text-muted" data-reveal>
        Osäker på vilken grupp som passar? Läs{" "}
        <Link href="/fragor" className="font-semibold">
          Vilken grupp ska jag välja?
        </Link>{" "}
        bland våra vanliga frågor.
      </p>
    </section>
  );
}

function HealthGroup() {
  // One loop of the walk–run rhythm; rendered twice for a seamless marquee.
  const rhythm = ["Spring", "Gå", "Spring", "Gå", "Styrka", "Spring", "Gå", "Balans"];
  return (
    <Band tone="purple" id="halsagruppen" labelledBy="halsagruppen-rubrik" className="scroll-mt-4">
      <div className="flex flex-wrap items-center gap-x-14 gap-y-10">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-5">
          <BandHeading id="halsagruppen-rubrik">Hälsagruppen</BandHeading>
          <p
            className="m-0 max-w-[560px] text-[24px] leading-[1.25] font-extrabold md:text-[28px]"
            data-reveal
            style={{ "--reveal-i": 1 } as CSSProperties}
          >
            ”Här finns inga krav på att du tränat löpning tidigare.”
          </p>
          <p className="m-0 max-w-[560px] text-[17px] text-white/85" data-reveal style={{ "--reveal-i": 2 } as CSSProperties}>
            Vi varvar löpning och promenad och lägger till övningar för styrka och balans. Målet är att må bra.
          </p>
          <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0" data-reveal style={{ "--reveal-i": 3 } as CSSProperties}>
            <li className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 font-semibold">
              <IconClock size={18} className="text-orange" /> Tisdagar, samling 17:45
            </li>
            <li className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 font-semibold">
              <IconMapPin size={18} className="text-orange" /> Klubblokalen, {club.address.street}
            </li>
          </ul>
          <Link href="#prova-pa" className="btn btn-primary self-start" data-reveal style={{ "--reveal-i": 4 } as CSSProperties}>
            Prova på i Hälsagruppen
          </Link>
        </div>

        <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-3" data-reveal="right">
          <div className="-rotate-2 rounded-xl bg-ink/35 p-4 ring-1 ring-white/15">
            <p className="m-0 mb-3 text-[13px] font-extrabold tracking-[1px] text-orange uppercase">Passets rytm</p>
            <div className="marquee overflow-hidden" aria-hidden="true">
              <ul className="marquee-track m-0 list-none gap-2 p-0" style={{ animationDuration: "18s" }}>
                {[...rhythm, ...rhythm].map((r, i) => (
                  <li
                    key={i}
                    className={`flex h-14 flex-none items-center gap-2 rounded-md px-4 text-[15px] font-extrabold [transform:skewX(-12deg)] ${
                      r === "Spring"
                        ? "w-[132px] bg-orange text-ink"
                        : r === "Gå"
                          ? "w-[92px] bg-white/90 text-purple"
                          : "w-[112px] bg-purple-soft text-purple"
                    }`}
                  >
                    {r === "Spring" && <IconRunner size={20} strokeWidth={2.4} />}
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <p className="m-0 mt-3 text-[15px] text-white/85">
              Löpning och promenad om vartannat – i den takt som passar dig.
            </p>
          </div>
        </div>
      </div>
    </Band>
  );
}

function TermPlan({ today }: { today: string }) {
  const upcoming = Object.entries(termPlan)
    .filter(([date]) => date >= today)
    .sort(([a], [b]) => a.localeCompare(b));
  const rests = ["-0.8deg", "0.6deg", "-0.4deg", "0.8deg"];
  return (
    <section id="terminsplan" className={`${wrap} flex scroll-mt-4 flex-col gap-6 pt-6 pb-16`}>
      <SectionHeading
        tone="ink"
        sub="Kvällens pass per grupp. Samma tid och plats varje tisdag."
        action={<DemoNote>Tränarna fyller i terminsplanen</DemoNote>}
      >
        Terminsplan
      </SectionHeading>
      {upcoming.length === 0 ? (
        <p className="card m-0 p-5 text-muted">[Terminsplanen för nästa termin publiceras här]</p>
      ) : (
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(270px,1fr))] items-start gap-5 p-0">
          {upcoming.map(([date, plan], i) => (
            <li
              key={date}
              data-settle
              style={{ "--rest-rotate": rests[i % rests.length], "--reveal-i": i } as CSSProperties}
              className={`straighten-hover card flex flex-col gap-3 p-5 ${i === 0 ? "border-orange shadow-[0_12px_26px_-10px_rgba(168,84,0,0.45)]" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className={`rounded-lg ${i === 0 ? "live-dot" : ""}`}>
                  <DateBadge date={date} today={today} highlight={i === 0} />
                </span>
                <span className="flex flex-col">
                  <span className="text-[17px] font-extrabold first-letter:uppercase">{longDate(date)}</span>
                  {i === 0 && <span className="text-[13px] font-bold text-orange-dark">Nästa träning</span>}
                </span>
              </div>
              <dl className="m-0 flex flex-col gap-2.5">
                {trainingGroups.map((g) => (
                  <div key={g.id} className="flex flex-col gap-1 border-t border-line pt-2.5">
                    <dt className="flex items-center gap-2">
                      <Pill tone={g.tone}>{g.short}</Pill>
                      <span className="text-[13px] text-muted">{g.id === "halsa" ? "17:45" : "18:00"}</span>
                    </dt>
                    <dd className="m-0 text-[15px] font-semibold">{plan[g.id]}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function TryItOut() {
  const steps = [
    {
      title: "Välj grupp",
      text: "Långa gruppen (ca 10 km), korta gruppen (ca 5 km) eller Hälsagruppen – där finns inga krav alls.",
    },
    {
      title: "Kom till klubblokalen",
      text: "Tennvägen 11 A i Torskors. Genomgången börjar kl. 18:00 – Hälsagruppen samlas redan 17:45.",
    },
    {
      title: "Träna upp till 3 pass",
      text: "Du väljer själv vilka, intervall eller långdistans. Sedan bestämmer du dig för om du vill bli medlem.",
    },
  ];
  const rests = ["-2deg", "1.5deg", "-1deg"];
  return (
    <Band tone="orange" id="prova-pa" labelledBy="prova-pa-rubrik" className="scroll-mt-4">
      <div className="flex flex-col gap-10">
        <BandHeading
          id="prova-pa-rubrik"
          bar="ink"
          subClassName="text-ink"
          sub="Du får vara med på upp till 3 träningspass innan du går med i föreningen."
        >
          Prova på
        </BandHeading>

        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(250px,1fr))] items-start gap-6 p-0 md:gap-8">
          {steps.map((s, i) => (
            <li
              key={s.title}
              data-settle
              style={{ "--rest-rotate": rests[i], "--reveal-i": i } as CSSProperties}
              className="straighten-hover relative flex flex-col gap-2 rounded-md bg-white p-6 pt-5 shadow-[0_14px_28px_rgba(122,61,0,0.28)]"
            >
              <span
                aria-hidden="true"
                className="-mt-12 mb-1 self-start bg-ink px-3 text-[52px] leading-[1.15] font-extrabold text-orange [transform:skewX(-12deg)]"
              >
                {i + 1}
              </span>
              <h3 className="m-0 text-[21px] font-extrabold">
                <span className="sr-only">Steg {i + 1}: </span>
                {s.title}
              </h3>
              <p className="m-0 text-[16px] text-muted">{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4" data-reveal="up">
          <div className="flex gap-3 rounded-xl bg-ink p-5 text-white">
            <IconClock size={24} className="mt-0.5 flex-none text-orange" />
            <div>
              <h3 className="m-0 text-[17px] font-extrabold">När ska jag komma?</h3>
              <p className="m-0 mt-1 text-[15px] text-mist">
                Kom i god tid före genomgången kl. 18:00 (Hälsagruppen 17:45), så hinner du hälsa och hitta rätt grupp.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl bg-ink p-5 text-white">
            <IconRunner size={24} className="mt-0.5 flex-none text-orange" />
            <div>
              <h3 className="m-0 text-[17px] font-extrabold">Vad tar jag med?</h3>
              <p className="m-0 mt-1 text-[15px] text-mist">Kläder efter väder och skor som du kan springa i.</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl bg-ink p-5 text-white">
            <IconCoffee size={24} className="mt-0.5 flex-none text-orange" />
            <div>
              <h3 className="m-0 text-[17px] font-extrabold">Och sedan?</h3>
              <p className="m-0 mt-1 text-[15px] text-mist">Gemensam fika efter passet. Vill du stanna kvar blir du medlem.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3" data-reveal>
          <Link href="#parkering" className="btn btn-dark btn-lg">
            Hitta hit
          </Link>
          <Link href="/bli-medlem" className="btn btn-lg border-[1.5px] border-ink text-ink hover:bg-ink hover:text-white">
            Så blir du medlem
          </Link>
        </div>
      </div>
    </Band>
  );
}

function LongRuns({ today }: { today: string }) {
  return (
    <section id="langpass" className={`${wrap} flex scroll-mt-4 flex-col gap-8 pt-6 pb-16`}>
      <div className="flex flex-wrap items-center gap-x-12 gap-y-8">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
          <SectionHeading sub="En gång i månaden · från 10 km upp till minst halvmara, ibland 30 km">Långpass</SectionHeading>
          <p className="m-0 text-[17px]" data-reveal style={{ "--reveal-i": 1 } as CSSProperties}>
            En gång i månaden springer vi långt tillsammans, från olika samlingsplatser. Distanserna går från 10 km och upp
            till minst halvmaraton – ibland 30 km.
          </p>
          <p className="m-0 text-[15px] text-muted" data-reveal style={{ "--reveal-i": 2 } as CSSProperties}>
            En deltagaravgift täcker vätska och fika ([belopp]). Samlingsplats och starttid kommer som en{" "}
            <Link href="/nyheter">nyhet</Link> inför varje pass.
          </p>
        </div>
        <div className="group relative min-w-0 flex-[1_1_320px]" data-reveal="right">
          <div className="relative rotate-2">
            <span aria-hidden="true" className="absolute top-3 -right-3 -bottom-3 left-3 rounded-sm bg-orange" />
            <Image
              src="/img/fika-i-solen.jpg"
              alt="Klubbmedlemmar fikar på en filt i solen efter ett långpass"
              width={900}
              height={675}
              sizes="(min-width: 768px) 440px, 100vw"
              className="diag-img relative block h-[220px] w-full object-cover md:h-[260px]"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="m-0 text-[19px] font-extrabold">Långpassen 2026</h3>
        <LongRunTrack runs={longRuns2026} today={today} />
      </div>
    </section>
  );
}

async function ThursdayGroup({ today }: { today: string }) {
  const thursdays = (await getEvents()).filter((e) => e.id.startsWith("torsdagsgruppen-") && e.date >= today).slice(0, 3);
  return (
    <section id="torsdagsgruppen" className="scroll-mt-4 bg-white py-16">
      <div className={`${wrap} flex flex-wrap items-center gap-x-14 gap-y-10`}>
        <div
          data-settle
          style={{ "--rest-rotate": "-2deg" } as CSSProperties}
          className="straighten-hover relative flex min-w-0 flex-[1_1_300px] flex-col gap-2 overflow-hidden rounded-md bg-ink p-7 text-white shadow-[0_18px_34px_-12px_rgba(34,30,31,0.55)] md:max-w-[400px]"
        >
          <svg aria-hidden="true" viewBox="0 0 300 220" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
            <g stroke="#EE8915" strokeWidth="2" opacity="0.3">
              <path d="M180 220 L300 50" />
              <path d="M215 220 L300 100" />
              <path d="M250 220 L300 150" />
            </g>
          </svg>
          <span className="relative self-start bg-orange px-2.5 py-0.5 text-[12px] font-extrabold tracking-[1px] text-ink uppercase [rotate:-2deg]">
            60+ eller dagledig
          </span>
          <span className="relative mt-2 text-[56px] leading-none font-extrabold tracking-[-2px]">
            {club.fee} kr
          </span>
          <span className="relative text-[17px] text-mist">för hela årets aktiviteter – medlemskapet ingår.</span>
        </div>

        <div className="flex min-w-0 flex-[2_1_420px] flex-col gap-4">
          <SectionHeading tone="purple">Torsdagsgruppen</SectionHeading>
          <p className="m-0 text-[17px]" data-reveal style={{ "--reveal-i": 1 } as CSSProperties}>
            För dig som är 60+ eller dagledig. Vi ses torsdagar kl. 10:00 vid klubblokalen på {club.address.street}, tar en
            promenad i Bastasjöskogen och fikar sedan tillsammans.
          </p>
          <p className="m-0 text-[15px] text-muted" data-reveal style={{ "--reveal-i": 2 } as CSSProperties}>
            Kontaktperson: <strong className="text-ink">Lotta Johansson</strong> ·{" "}
            <Link href="/fragor#kontakt">Kontakta oss</Link>
          </p>
          {thursdays.length > 0 && (
            <div className="flex flex-col gap-2" data-reveal style={{ "--reveal-i": 3 } as CSSProperties}>
              <span className="text-[13px] font-extrabold tracking-[0.5px] text-muted uppercase">Nästa torsdagar</span>
              <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
                {thursdays.map((e, i) => (
                  <li
                    key={e.id}
                    className="flex items-center gap-2.5 rounded-xl border border-line bg-paper py-1.5 pr-4 pl-1.5"
                    style={{ rotate: i % 2 ? "1deg" : "-1deg" }}
                  >
                    <DateBadge date={e.date} today={today} size={42} />
                    <span className="text-[14px] font-semibold">kl. {e.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Parking() {
  return (
    <section id="parkering" className={`${wrap} flex scroll-mt-4 flex-col gap-6 pt-16 pb-28`}>
      <SectionHeading>Hitta hit & parkering</SectionHeading>
      <div className="flex flex-wrap items-start gap-8">
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4" data-reveal>
          <div className="card flex flex-col gap-3 p-5">
            <span className="flex items-start gap-3">
              <IconMapPin size={24} className="mt-0.5 flex-none text-orange-dark" />
              <span className="flex flex-col">
                <strong className="text-[18px]">Klubblokalen</strong>
                <span>
                  {club.address.street}, {club.address.area}
                </span>
                <span>
                  {club.address.zip} {club.address.city}
                </span>
              </span>
            </span>
            <a
              href={mapsUrl(`${address}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark self-start"
            >
              Öppna i Google Maps <IconExternal size={16} />
              <span className="sr-only">(öppnas i ny flik)</span>
            </a>
          </div>
          <div className="card flex flex-col gap-3 p-5">
            <h3 className="m-0 text-[18px] font-extrabold">Parkering</h3>
            <p className="m-0 text-[17px] font-semibold">
              Gröna ytor går bra att parkera på. Undvik de rödmarkerade ytorna.
            </p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[15px]">
              <li className="flex items-center gap-2.5">
                <span aria-hidden="true" className="h-5 w-8 flex-none rounded border-2 border-green bg-green/20" />
                Grönt – här går det bra att parkera
              </li>
              <li className="flex items-center gap-2.5">
                <span aria-hidden="true" className="h-5 w-8 flex-none rounded border-2 border-[#B3261E] bg-[#B3261E]/15" />
                Rött – undvik, håll fritt
              </li>
            </ul>
          </div>
        </div>

        <figure
          className="m-0 flex min-w-0 flex-[2_1_420px] flex-col gap-2 lg:max-w-[620px]"
          data-settle
          style={{ "--rest-rotate": "1deg" } as CSSProperties}
        >
          <div className="overflow-hidden rounded-xl border border-line bg-white p-2 shadow-[0_12px_28px_-14px_rgba(34,30,31,0.4)]">
            <ParkingSketch />
          </div>
          <figcaption className="text-[14px] text-muted">
            Schematisk skiss, inte skalenlig. [Klubbens riktiga parkeringskarta läggs in här]
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
