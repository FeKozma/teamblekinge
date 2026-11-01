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
import { getClub } from "@/lib/content/club";
import { getPageTexts } from "@/lib/content/pages";
import { getRace, getRaces } from "@/lib/content/races";
import type { Race } from "@/lib/data/races";
import { todayISO } from "@/lib/format";
import { isUploadUrl } from "@/lib/uploads";

// No generateStaticParams: races are edited in the admin (and new ones added),
// so each page is rendered from the content store when it's requested.

type Texts = (key: string) => string;

export async function generateMetadata({ params }: PageProps<"/tavla/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const race = await getRace(slug);
  if (!race) return {};
  return {
    title: race.name,
    description: `${race.dateLabel}, ${race.place}. ${race.summary}`,
  };
}

export default async function RacePage({ params }: PageProps<"/tavla/[slug]">) {
  const { slug } = await params;
  const [races, club, t] = await Promise.all([getRaces(), getClub(), getPageTexts("tavla")]);
  const race = races.find((r) => r.slug === slug);
  if (!race) notFound();
  const today = todayISO();
  const upcoming = race.start.slice(0, 10) >= today;
  const ladder = race.feeLadder?.periods.length && race.feeLadder.rows.length ? race.feeLadder : undefined;

  return (
    <Page>
      <RaceHero race={race} upcoming={upcoming} t={t} />
      <Distances race={race} t={t} />
      {ladder && <FeeLadder ladder={ladder} t={t} />}
      <Registration race={race} upcoming={upcoming} raceEmail={club.contact.raceEmail} t={t} />
      <Facts race={race} t={t} />
      <MoreRaces race={race} races={races} today={today} t={t} />
    </Page>
  );
}

function RaceHero({ race, upcoming, t }: { race: Race; upcoming: boolean; t: Texts }) {
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
            <IconArrowLeft size={18} /> {t("race.back")}
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
                {t("race.firstStart")} {firstStart}
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
              {t("race.signupButton")}
            </a>
            <a href="#distanser" className="btn btn-outline-light btn-lg flex-1 sm:flex-none">
              {t("race.distancesButton")}
            </a>
          </div>
        </div>

        <div className="relative order-1 min-w-0 flex-[1_1_380px] md:order-2">
          <HeroImage race={race} />
          <div className="relative z-[1] -mt-8 flex w-fit flex-col gap-2 rounded-md bg-ink-3/95 px-4 py-3 text-white shadow-[0_14px_30px_rgba(0,0,0,0.45)] ring-1 ring-ink-2 backdrop-blur [rotate:2deg] md:absolute md:-bottom-10 md:-left-6 md:mt-0">
            {upcoming ? (
              <>
                <span className="text-[12px] font-extrabold tracking-[1px] text-orange uppercase">
                  {t("race.countdown")}
                </span>
                <Countdown to={race.start} />
              </>
            ) : (
              <span className="flex items-center gap-2 text-[14px] font-bold">
                <IconTrophy size={18} className="text-orange" />
                {t("race.done")} ·{" "}
                <Link href="/tavla#resultat" className="text-orange hover:text-orange">
                  {t("race.resultsLink")}
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
          <Image
            src={race.image}
            alt={race.imageAlt}
            width={600}
            height={580}
            priority
            unoptimized={isUploadUrl(race.image)}
            className="h-full w-auto"
          />
        </div>
      </div>
    );
  }
  if (race.imageFit === "poster") {
    return (
      <div className="parallax relative mx-auto max-w-[400px] rotate-3 pb-6">
        <span aria-hidden="true" className="hero-plate absolute top-5 -right-4 bottom-0 left-5 rounded-sm bg-orange" />
        <Image
          src={race.image}
          alt={race.imageAlt}
          width={900}
          height={900}
          priority
          unoptimized={isUploadUrl(race.image)}
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
        unoptimized={isUploadUrl(race.image)}
        sizes="(min-width: 768px) 560px, 100vw"
        className="hero-photo relative block h-[230px] w-full object-cover sm:h-[320px] md:h-[380px]"
        style={{ clipPath: "polygon(12% 0, 100% 0, 88% 100%, 0 100%)" }}
      />
    </div>
  );
}

function Distances({ race, t }: { race: Race; t: Texts }) {
  const anyNote = race.distances.some((d) => d.note);
  const anyMissingFee = race.distances.some((d) => !d.fee);
  return (
    <section id="distanser" className={`${wrap} flex scroll-mt-4 flex-col gap-5 pt-6 pb-14`}>
      <SectionHeading sub={race.feeNote}>{t("race.distances")}</SectionHeading>
      <div className="card overflow-hidden shadow-[0_12px_28px_-16px_rgba(34,30,31,0.35)]">
        <table className="w-full border-collapse text-left text-[15px] md:text-[16px]">
          <caption className="sr-only">Distanser, starttider och avgifter för {race.name}</caption>
          <thead className="bg-ink text-[12px] tracking-[0.5px] text-mist uppercase md:text-[13px]">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold md:px-5">
                {t("race.colDistance")}
              </th>
              <th scope="col" className="px-2 py-3 font-bold md:px-5">
                {t("race.colStart")}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-bold md:px-5 md:text-left">
                {t("race.colFee")}
              </th>
              {anyNote && (
                <th scope="col" className="hidden px-5 py-3 font-bold md:table-cell">
                  {t("race.colNote")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {race.distances.map((d, i) => (
              <tr
                key={i}
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
                  {d.fee || (
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
        <p className="m-0 text-[14px] text-muted">{t("race.noFee")}</p>
      )}
    </section>
  );
}

function FeeLadder({ ladder, t }: { ladder: NonNullable<Race["feeLadder"]>; t: Texts }) {
  const max = Math.max(...ladder.rows.flatMap((r) => r.fees));
  return (
    <section className={`${wrap} flex flex-col gap-5 pb-14`}>
      <SectionHeading tone="purple" sub={t("race.feesSub")}>
        {t("race.fees")}
      </SectionHeading>
      <div className="card overflow-x-auto" data-reveal="up">
        <table className="w-full min-w-[440px] border-collapse text-left text-[15px]">
          <caption className="sr-only">Anmälningsavgift per distans och anmälningsperiod</caption>
          <thead>
            <tr className="text-[13px] tracking-[0.5px] text-muted uppercase">
              <th scope="col" className="px-4 py-3 font-bold md:px-5">
                {t("race.colDistance")}
              </th>
              {ladder.periods.map((p, i) => (
                <th key={i} scope="col" className="px-3 py-3 font-bold">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ladder.rows.map((row, r) => (
              <tr key={r} className="border-t border-line">
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

function Registration({
  race,
  upcoming,
  raceEmail,
  t,
}: {
  race: Race;
  upcoming: boolean;
  raceEmail: string;
  t: Texts;
}) {
  const { registration: reg } = race;
  return (
    <Band tone="orange" id="anmalan" labelledBy="anmalan-rubrik" className="scroll-mt-4">
      <div className="flex flex-wrap items-center gap-x-12 gap-y-8">
        <div className="flex min-w-0 flex-[2_1_420px] flex-col gap-4">
          <BandHeading id="anmalan-rubrik" bar="ink">
            {t("race.signup")}
          </BandHeading>
          <p className="m-0 max-w-[620px] text-[18px] font-semibold" data-reveal style={{ "--reveal-i": 1 } as CSSProperties}>
            {reg.note}
          </p>
          {reg.tip && upcoming && (
            <p className="m-0 text-[15px]" data-reveal style={{ "--reveal-i": 2 } as CSSProperties}>
              {reg.tip}
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
              <span className="text-[12px] font-extrabold tracking-[1px] text-orange uppercase">
                {t("race.signupLabel")}
              </span>
              <a href={reg.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
                {reg.label} <IconExternal size={18} />
                <span className="sr-only">(öppnas i ny flik)</span>
              </a>
            </>
          ) : (
            <>
              <span className="text-[12px] font-extrabold tracking-[1px] text-orange uppercase">
                {upcoming ? t("race.soon") : t("race.closedLabel")}
              </span>
              <span className="text-[22px] leading-tight font-extrabold">
                {upcoming ? reg.label : t("race.closed")}
              </span>
            </>
          )}
          <a
            href={`mailto:${raceEmail}`}
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-mist no-underline hover:text-orange"
          >
            <IconMail size={18} /> {raceEmail}
          </a>
        </div>
      </div>
    </Band>
  );
}

function Facts({ race, t }: { race: Race; t: Texts }) {
  if (!race.facts.length && !race.records?.length) return null;
  return (
    <section className={`${wrap} flex flex-col gap-6 pt-6 pb-14`}>
      <SectionHeading tone="ink">{t("race.facts")}</SectionHeading>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 p-0">
        {race.facts.map((f, i) => (
          <li
            key={i}
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
            {t("race.records")}
          </h3>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 p-0">
            {race.records.map((rec, i) => (
              <li key={i} className="flex items-baseline gap-4 border-t border-ink-2 pt-3">
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

function MoreRaces({ race, races, today, t }: { race: Race; races: Race[]; today: string; t: Texts }) {
  const others = races.filter((r) => r.slug !== race.slug);
  if (!others.length) return null;
  const links = Object.fromEntries((race.related ?? []).map((l) => [l.slug, l.text]));
  // Related races first.
  others.sort((a, b) => Number(b.slug in links) - Number(a.slug in links));
  return (
    <section className={`${wrap} flex flex-col gap-5 pb-28`}>
      <SectionHeading tone="purple">{t("race.more")}</SectionHeading>
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
                    unoptimized={isUploadUrl(r.image)}
                    className={`diag-img ${r.imageFit === "contain" ? "object-contain p-2" : "object-cover"}`}
                  />
                </span>
                <span className="flex min-w-0 flex-col gap-1 px-4 py-3.5">
                  <span className={`text-[12px] font-bold tracking-[0.5px] uppercase ${r.tone === "purple" ? "text-purple" : "text-orange-dark"}`}>
                    {why ? t("race.related") : (soon ?? r.dateLabel)}
                  </span>
                  <span className="text-[18px] leading-tight font-extrabold">{r.name}</span>
                  <span className="text-[14px] text-muted">{why ?? `${r.dateLabel} · ${r.place}`}</span>
                  <span className="mt-auto pt-1 text-[14px] font-semibold text-orange-dark">
                    {t("race.toRace")}{" "}
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link href="/tavla" className="arrow-link inline-flex items-center gap-1.5 self-start">
        <IconArrowLeft size={18} /> {t("race.back")}
      </Link>
    </section>
  );
}
