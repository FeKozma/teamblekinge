import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/Countdown";
import { IconCalendar, IconCheck, IconClock, IconMail, IconMapPin, IconTrophy } from "@/components/icons";
import { Band, BandHeading, wrap } from "@/components/public/layout";
import { IconArrowLeft, IconExternal } from "@/components/public/icons";
import { raceCountdownLabel } from "@/components/public/RaceCard";
import { Page, SectionHeading, SpeedLines } from "@/components/ui";
import { club } from "@/lib/data/club";
import { getRace, races, type Race } from "@/lib/data/races";
import { todayISO } from "@/lib/format";

export function generateStaticParams() {
  return races.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tavla/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const race = getRace(slug);
  if (!race) return {};
  return {
    title: race.name,
    description: `${race.dateLabel}, ${race.place}. ${race.summary}`,
  };
}

// How the races hang together, for the cross-links at the bottom.
const related: Record<string, Record<string, string>> = {
  jamjohalvan: {
    "veteran-sm": "Veteran-SM i halvmaraton avgörs i Jämjöhalvan – kryssa i ”Delta i VSM” när du anmäler dig.",
  },
  "veteran-sm": {
    jamjohalvan: "VSM springs i Jämjöhalvans halvmaraton – samma arena, start kl. 11:00. Anmälan görs via Jämjöhalvan.",
    kustmaran: "Veteran-SM i maraton planeras på Kustmaran 2027.",
  },
  kustmaran: {
    "veteran-sm": "Veteran-SM i maraton planeras här 2027.",
  },
};

// Square posters are shown whole instead of cropped to a landscape frame.
const posters = new Set(["/img/jamjohalvan-affisch.jpg"]);

export default async function RacePage({ params }: PageProps<"/tavla/[slug]">) {
  const { slug } = await params;
  const race = getRace(slug);
  if (!race) notFound();
  const today = todayISO();
  const upcoming = race.start.slice(0, 10) >= today;

  return (
    <Page>
      <RaceHero race={race} upcoming={upcoming} />
      <Distances race={race} />
      {race.feeLadder && <FeeLadder ladder={race.feeLadder} />}
      <Registration race={race} upcoming={upcoming} />
      <Facts race={race} />
      <MoreRaces race={race} today={today} />
    </Page>
  );
}

function RaceHero({ race, upcoming }: { race: Race; upcoming: boolean }) {
  const firstStart = race.distances[0]?.start;
  const kickerBg = race.tone === "purple" ? "bg-purple text-white" : "bg-orange text-ink";
  return (
    <section
      className="relative overflow-hidden bg-ink text-white"
      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 80px), 0 100%)" }}
    >
      <SpeedLines
        lines={[
          [560, 640, 980, 0],
          [620, 640, 1040, 0],
          [680, 640, 1100, 0],
          [740, 640, 1160, 0],
          [-200, 640, 220, 0],
        ]}
      >
        {race.tone === "purple" && <path d="M1300 0 L1440 0 L1440 200 Z" fill="#5B2A86" opacity="0.9" />}
      </SpeedLines>
      <div className={`${wrap} relative flex flex-wrap items-center gap-x-14 gap-y-10 pt-6 pb-32 md:pt-12 md:pb-[140px]`}>
        <div className="order-2 flex min-w-0 flex-[1_1_440px] flex-col gap-4 md:order-1">
          <Link
            href="/tavla"
            className="run-in inline-flex items-center gap-1.5 self-start text-[15px] font-semibold text-mist no-underline hover:text-orange"
          >
            <IconArrowLeft size={18} /> Alla lopp
          </Link>
          <span
            className={`run-in self-start px-3 py-1 text-[13px] font-extrabold tracking-[1px] uppercase [rotate:-2deg] ${kickerBg}`}
            style={{ "--i": 1 } as CSSProperties}
          >
            {race.kicker}
          </span>
          <h1
            className="run-in m-0 text-[40px] leading-[1.02] font-extrabold tracking-[-1.5px] sm:text-[50px] lg:text-[60px]"
            style={{ "--i": 2 } as CSSProperties}
          >
            {race.name}
          </h1>
          <ul
            className="run-in m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-[16px] font-semibold"
            style={{ "--i": 3 } as CSSProperties}
          >
            <li className="flex items-center gap-2">
              <IconCalendar size={18} className="text-orange" />
              {race.dateLabel}
            </li>
            {firstStart && (
              <li className="flex items-center gap-2">
                <IconClock size={18} className="text-orange" />
                Första start {firstStart}
              </li>
            )}
            <li className="flex items-center gap-2">
              <IconMapPin size={18} className="text-orange" />
              {race.place}
            </li>
          </ul>
          <p className="run-in m-0 max-w-[560px] text-[17px] text-mist md:text-[18px]" style={{ "--i": 4 } as CSSProperties}>
            {race.summary}
          </p>
          <div className="run-in mt-1 flex flex-wrap gap-3" style={{ "--i": 5 } as CSSProperties}>
            <a href="#anmalan" className="btn btn-primary btn-lg flex-1 sm:flex-none">
              Anmälan
            </a>
            <a href="#distanser" className="btn btn-outline-light btn-lg flex-1 sm:flex-none">
              Distanser & starttider
            </a>
          </div>
        </div>

        <div className="relative order-1 min-w-0 flex-[1_1_380px] md:order-2">
          <HeroImage race={race} />
          <div className="relative z-[1] -mt-8 flex w-fit flex-col gap-2 rounded-md bg-ink-3/95 px-4 py-3 text-white shadow-[0_14px_30px_rgba(0,0,0,0.45)] ring-1 ring-ink-2 backdrop-blur [rotate:2deg] md:absolute md:-bottom-10 md:-left-6 md:mt-0">
            {upcoming ? (
              <>
                <span className="text-[12px] font-extrabold tracking-[1px] text-orange uppercase">Start om</span>
                <Countdown to={race.start} />
              </>
            ) : (
              <span className="flex items-center gap-2 text-[14px] font-bold">
                <IconTrophy size={18} className="text-orange" />
                Loppet är avgjort ·{" "}
                <Link href="/tavla#resultat" className="text-orange hover:text-orange">
                  Resultat
                </Link>
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroImage({ race }: { race: Race }) {
  if (race.imageFit === "contain") {
    return (
      <div className="parallax relative mx-auto max-w-[460px] -rotate-3 pb-6">
        <span aria-hidden="true" className="hero-plate absolute top-5 -right-4 -bottom-0 left-5 rounded-md bg-purple" />
        <div className="tilt-pop relative flex h-[230px] items-center justify-center rounded-md bg-white p-6 sm:h-[300px]">
          <Image src={race.image} alt={race.imageAlt} width={600} height={580} priority className="h-full w-auto" />
        </div>
      </div>
    );
  }
  if (posters.has(race.image)) {
    return (
      <div className="parallax relative mx-auto max-w-[400px] rotate-3 pb-6">
        <span aria-hidden="true" className="hero-plate absolute top-5 -right-4 bottom-0 left-5 rounded-sm bg-orange" />
        <Image
          src={race.image}
          alt={race.imageAlt}
          width={900}
          height={900}
          priority
          sizes="(min-width: 768px) 400px, 90vw"
          className="tilt-pop relative block aspect-square w-full rounded-sm object-cover shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
        />
      </div>
    );
  }
  return (
    <div className="parallax relative -rotate-3">
      <span
        aria-hidden="true"
        className="hero-plate absolute top-[22px] -right-[18px] -bottom-[22px] left-[18px] bg-orange"
        style={{ clipPath: "polygon(12% 0, 100% 0, 88% 100%, 0 100%)" }}
      />
      <Image
        src={race.image}
        alt={race.imageAlt}
        width={1000}
        height={599}
        priority
        sizes="(min-width: 768px) 560px, 100vw"
        className="hero-photo relative block h-[230px] w-full object-cover sm:h-[320px] md:h-[380px]"
        style={{ clipPath: "polygon(12% 0, 100% 0, 88% 100%, 0 100%)" }}
      />
    </div>
  );
}

function Distances({ race }: { race: Race }) {
  const anyNote = race.distances.some((d) => d.note);
  const anyMissingFee = race.distances.some((d) => !d.fee);
  return (
    <section id="distanser" className={`${wrap} flex scroll-mt-4 flex-col gap-5 pt-6 pb-14`}>
      <SectionHeading sub={race.feeNote}>Distanser & starttider</SectionHeading>
      <div className="card overflow-hidden shadow-[0_12px_28px_-16px_rgba(34,30,31,0.35)]">
        <table className="w-full border-collapse text-left text-[15px] md:text-[16px]">
          <caption className="sr-only">Distanser, starttider och avgifter för {race.name}</caption>
          <thead className="bg-ink text-[12px] tracking-[0.5px] text-mist uppercase md:text-[13px]">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold md:px-5">
                Distans
              </th>
              <th scope="col" className="px-2 py-3 font-bold md:px-5">
                Start
              </th>
              <th scope="col" className="px-4 py-3 text-right font-bold md:px-5 md:text-left">
                Avgift
              </th>
              {anyNote && (
                <th scope="col" className="hidden px-5 py-3 font-bold md:table-cell">
                  Notering
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {race.distances.map((d, i) => (
              <tr
                key={d.name}
                data-reveal
                style={{ "--reveal-i": i } as CSSProperties}
                className="border-t border-line transition-colors hover:bg-paper"
              >
                <th scope="row" className="px-4 py-3.5 align-top font-bold md:px-5">
                  {d.name}
                  {d.note && <span className="block text-[13px] font-normal text-muted md:hidden">{d.note}</span>}
                </th>
                <td className="px-2 py-3 align-top md:px-5">
                  <time className="inline-block rounded bg-ink px-2 py-0.5 font-extrabold text-orange tabular-nums [transform:skewX(-8deg)]">
                    {d.start}
                  </time>
                </td>
                <td className="px-4 py-3.5 text-right align-top whitespace-nowrap md:px-5 md:text-left">
                  {d.fee ?? (
                    <span className="text-muted">
                      –<span className="sr-only">ingen avgift publicerad</span>
                    </span>
                  )}
                </td>
                {anyNote && <td className="hidden px-5 py-3.5 align-top text-muted md:table-cell">{d.note}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {anyMissingFee && (
        <p className="m-0 text-[14px] text-muted">– betyder att ingen avgift är publicerad för distansen.</p>
      )}
    </section>
  );
}

function FeeLadder({ ladder }: { ladder: NonNullable<Race["feeLadder"]> }) {
  const max = Math.max(...ladder.rows.flatMap((r) => r.fees));
  return (
    <section className={`${wrap} flex flex-col gap-5 pb-14`}>
      <SectionHeading tone="purple" sub="Ju tidigare du anmäler dig, desto lägre avgift.">
        Avgifter
      </SectionHeading>
      <div className="card overflow-x-auto" data-reveal="up">
        <table className="w-full min-w-[440px] border-collapse text-left text-[15px]">
          <caption className="sr-only">Anmälningsavgift per distans och anmälningsperiod</caption>
          <thead>
            <tr className="text-[13px] tracking-[0.5px] text-muted uppercase">
              <th scope="col" className="px-4 py-3 font-bold md:px-5">
                Distans
              </th>
              {ladder.periods.map((p) => (
                <th key={p} scope="col" className="px-3 py-3 font-bold">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ladder.rows.map((row) => (
              <tr key={row.name} className="border-t border-line">
                <th scope="row" className="px-4 py-3 font-bold md:px-5">
                  {row.name}
                </th>
                {row.fees.map((fee, i) => (
                  <td key={i} className="px-3 py-3">
                    <span className="flex flex-col gap-1">
                      <span className="font-semibold tabular-nums">{fee} kr</span>
                      <span aria-hidden="true" className="block h-1.5 rounded-full bg-paper">
                        <span
                          className={`grow-x block h-full rounded-full ${i === 0 ? "bg-orange" : i === 1 ? "bg-orange-dark" : "bg-purple"}`}
                          style={{ width: `${(fee / max) * 100}%` }}
                        />
                      </span>
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Registration({ race, upcoming }: { race: Race; upcoming: boolean }) {
  const { registration: reg } = race;
  return (
    <Band tone="orange" id="anmalan" labelledBy="anmalan-rubrik" className="scroll-mt-4">
      <div className="flex flex-wrap items-center gap-x-12 gap-y-8">
        <div className="flex min-w-0 flex-[2_1_420px] flex-col gap-4">
          <BandHeading id="anmalan-rubrik" bar="ink">
            Anmälan
          </BandHeading>
          <p className="m-0 max-w-[620px] text-[18px] font-semibold" data-reveal style={{ "--reveal-i": 1 } as CSSProperties}>
            {reg.note}
          </p>
          {race.slug === "jamjohalvan" && upcoming && (
            <p className="m-0 text-[15px]" data-reveal style={{ "--reveal-i": 2 } as CSSProperties}>
              Vill du springa Veteran-SM? Kryssa i ”Delta i VSM” när du anmäler dig.
            </p>
          )}
        </div>
        <div
          data-settle
          style={{ "--rest-rotate": "2deg" } as CSSProperties}
          className="straighten-hover flex min-w-0 flex-[1_1_280px] flex-col gap-3 rounded-md bg-ink p-6 text-white shadow-[0_18px_34px_-12px_rgba(34,30,31,0.6)]"
        >
          {reg.url && upcoming ? (
            <>
              <span className="text-[12px] font-extrabold tracking-[1px] text-orange uppercase">Anmäl dig</span>
              <a href={reg.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
                {reg.label} <IconExternal size={18} />
                <span className="sr-only">(öppnas i ny flik)</span>
              </a>
            </>
          ) : (
            <>
              <span className="text-[12px] font-extrabold tracking-[1px] text-orange uppercase">
                {upcoming ? "Snart" : "Avgjort"}
              </span>
              <span className="text-[22px] leading-tight font-extrabold">
                {upcoming ? reg.label : "Anmälan är stängd"}
              </span>
            </>
          )}
          <a
            href={`mailto:${club.contact.raceEmail}`}
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-mist no-underline hover:text-orange"
          >
            <IconMail size={18} /> {club.contact.raceEmail}
          </a>
        </div>
      </div>
    </Band>
  );
}

function Facts({ race }: { race: Race }) {
  return (
    <section className={`${wrap} flex flex-col gap-6 pt-6 pb-14`}>
      <SectionHeading tone="ink">Bra att veta</SectionHeading>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 p-0">
        {race.facts.map((f, i) => (
          <li
            key={f}
            data-reveal="up"
            style={{ "--reveal-i": i, rotate: i % 2 ? "0.6deg" : "-0.6deg" } as CSSProperties}
            className="card flex gap-3 p-4 text-[16px]"
          >
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-orange text-ink">
              <IconCheck size={16} strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>

      {race.records && race.records.length > 0 && (
        <div
          data-settle
          style={{ "--rest-rotate": "-1deg" } as CSSProperties}
          className="flex flex-col gap-3 rounded-md bg-ink p-5 text-white md:p-6"
        >
          <h3 className="m-0 flex items-center gap-2.5 text-[19px] font-extrabold">
            <IconTrophy size={22} className="text-orange" />
            Banrekord
          </h3>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 p-0">
            {race.records.map((rec) => (
              <li key={rec.name} className="flex items-baseline gap-4 border-t border-ink-2 pt-3">
                <span className="text-[30px] leading-none font-extrabold text-orange tabular-nums">{rec.time}</span>
                <span className="flex flex-col">
                  <span className="font-bold">{rec.name}</span>
                  <span className="text-[14px] text-mist">
                    {rec.club} · {rec.distance} · {rec.year}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function MoreRaces({ race, today }: { race: Race; today: string }) {
  const others = races.filter((r) => r.slug !== race.slug);
  const links = related[race.slug] ?? {};
  // Related races first.
  others.sort((a, b) => Number(b.slug in links) - Number(a.slug in links));
  return (
    <section className={`${wrap} flex flex-col gap-5 pb-28`}>
      <SectionHeading tone="purple">Fler lopp</SectionHeading>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 p-0">
        {others.map((r, i) => {
          const why = links[r.slug];
          const soon = raceCountdownLabel(r, today);
          return (
            <li key={r.slug} data-reveal="up" style={{ "--reveal-i": i } as CSSProperties}>
              <Link
                href={`/tavla/${r.slug}`}
                className="group lean-hover flex h-full overflow-hidden rounded-xl border border-line bg-white text-ink no-underline hover:text-ink"
              >
                <span className="relative w-[110px] flex-none overflow-hidden bg-white sm:w-[140px]">
                  <Image
                    src={r.image}
                    alt=""
                    fill
                    sizes="140px"
                    className={`diag-img ${r.imageFit === "contain" ? "object-contain p-2" : "object-cover"}`}
                  />
                </span>
                <span className="flex min-w-0 flex-col gap-1 px-4 py-3.5">
                  <span className={`text-[12px] font-bold tracking-[0.5px] uppercase ${r.tone === "purple" ? "text-purple" : "text-orange-dark"}`}>
                    {why ? "Hänger ihop" : soon ?? r.dateLabel}
                  </span>
                  <span className="text-[18px] leading-tight font-extrabold">{r.name}</span>
                  <span className="text-[14px] text-muted">{why ?? `${r.dateLabel} · ${r.place}`}</span>
                  <span className="mt-auto pt-1 text-[14px] font-semibold text-orange-dark">
                    Till loppet <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link href="/tavla" className="arrow-link inline-flex items-center gap-1.5 self-start">
        <IconArrowLeft size={18} /> Alla lopp
      </Link>
    </section>
  );
}
