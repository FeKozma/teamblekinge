import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { IconList, IconStar, IconTrophy } from "@/components/icons";
import { Band, BandHeading, JumpNav, wrap } from "@/components/public/layout";
import { IconBus, IconTicket } from "@/components/public/icons";
import { RaceCard } from "@/components/public/RaceCard";
import { ArrowLink, DateBadge, Page, PageHero, Pill, SectionHeading } from "@/components/ui";
import { getEvents } from "@/lib/content/events";
import { getPageTexts } from "@/lib/content/pages";
import { getRaces } from "@/lib/content/races";
import { paragraphs } from "@/lib/data/pages";
import { nextRace, type Race } from "@/lib/data/races";
import { dayMonth, longDate, todayISO } from "@/lib/format";

type Texts = (key: string) => string;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getPageTexts("tavla");
  return { title: "Tävla", description: paragraphs(t("hero.intro")).join(" ") };
}

export default async function CompetePage() {
  const today = todayISO();
  const [races, t] = await Promise.all([getRaces(), getPageTexts("tavla")]);
  const next = nextRace(races, today);
  const intro = paragraphs(t("hero.intro"));
  return (
    <Page>
      <PageHero
        kicker={t("hero.kicker")}
        title={t("hero.title")}
        intro={intro.length > 1 ? intro.map((p, i) => (
          <span key={i} className="block [&+&]:mt-3">
            {p}
          </span>
        )) : intro[0]}
      >
        {next && (
          <Link
            href={`/tavla/${next.slug}`}
            className="run-in mt-2 flex flex-col gap-2 self-start rounded-md bg-ink-3/95 px-4 py-3 text-white no-underline shadow-[0_14px_30px_rgba(0,0,0,0.45)] ring-1 ring-ink-2 transition-[rotate,translate] duration-500 [rotate:-1.5deg] hover:-translate-y-1 hover:text-white hover:[rotate:0deg]"
            style={{ "--i": 3 } as CSSProperties}
          >
            <span className="text-[12px] font-extrabold tracking-[1px] text-orange uppercase">
              {next.name} · {t("hero.countdown")}
            </span>
            <Countdown to={next.start} />
          </Link>
        )}
        <JumpNav
          links={[
            { href: "#lopp", label: t("jump.races") },
            { href: "#aka-och-tavla", label: t("jump.travel") },
            { href: "#resultat", label: t("jump.results") },
          ]}
        />
      </PageHero>
      <OurRaces races={races} today={today} t={t} />
      <TravelTogether today={today} t={t} />
      <Results races={races} today={today} t={t} />
    </Page>
  );
}

function OurRaces({ races, today, t }: { races: Race[]; today: string; t: Texts }) {
  const poses = [
    { rotate: "-1.5deg", y: "md:translate-y-0" },
    { rotate: "1.5deg", y: "md:translate-y-12" },
    { rotate: "-0.5deg", y: "md:translate-y-4" },
  ];
  return (
    <section id="lopp" className={`${wrap} flex scroll-mt-4 flex-col gap-8 pt-6 pb-20 md:pb-28`}>
      <SectionHeading size="lg" className="[&_h2]:origin-left [&_h2]:-rotate-2">
        {t("races.heading")}
      </SectionHeading>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-stretch gap-7">
        {races.map((r, i) => (
          <div key={r.slug} className={poses[i % poses.length].y}>
            <RaceCard race={r} today={today} index={i} rest={poses[i % poses.length].rotate} />
          </div>
        ))}
      </div>
    </section>
  );
}

async function TravelTogether({ today, t }: { today: string; t: Texts }) {
  const meeting = (await getEvents()).find((e) => e.id === "aka-och-tavla" && e.date >= today);
  const perks: { Icon: typeof IconBus; title: string; text: string }[] = [
    { Icon: IconTicket, title: t("travel.perk1Title"), text: t("travel.perk1Text") },
    { Icon: IconBus, title: t("travel.perk2Title"), text: t("travel.perk2Text") },
  ];
  return (
    <Band id="aka-och-tavla" labelledBy="aka-rubrik" className="scroll-mt-4">
      <div className="flex flex-col gap-10">
        <BandHeading id="aka-rubrik" sub={t("travel.sub")}>
          {t("travel.heading")}
        </BandHeading>

        <div className="flex flex-wrap items-start gap-6">
          <div className="grid min-w-0 flex-[2_1_480px] grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5">
            {perks.map(({ Icon, title, text }, i) => (
              <article
                key={i}
                data-settle
                style={{ "--rest-rotate": i ? "1.2deg" : "-1.2deg", "--reveal-i": i } as CSSProperties}
                className="straighten-hover flex flex-col gap-2 rounded-md bg-white p-5 text-ink shadow-[0_14px_30px_rgba(0,0,0,0.35)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange text-ink [transform:skewX(-8deg)]">
                  <Icon size={24} />
                </span>
                <h3 className="m-0 text-[19px] font-extrabold">{title}</h3>
                <p className="m-0 text-[15px] text-muted">{text}</p>
              </article>
            ))}
          </div>

          <div className="min-w-0 flex-[1_1_300px]" data-reveal="right">
            {meeting ? (
              <article className="relative flex flex-col gap-3 rounded-md border-2 border-dashed border-orange/70 bg-ink-3 p-5 [rotate:1.5deg]">
                <span className="text-[12px] font-extrabold tracking-[1px] text-orange uppercase">
                  {t("travel.meeting")}
                </span>
                <div className="flex items-center gap-3">
                  <span className="live-dot rounded-lg">
                    <DateBadge date={meeting.date} today={today} highlight />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[18px] font-extrabold">{meeting.title}</span>
                    <span className="text-[14px] text-mist first-letter:uppercase">
                      {longDate(meeting.date)} · {meeting.time} · {meeting.place}
                    </span>
                  </span>
                </div>
                {meeting.note && <p className="m-0 text-[15px] text-mist">{meeting.note}</p>}
                <Link href="/kalender" className="arrow-link self-start text-orange hover:text-orange">
                  {t("travel.calendar")} <span className="arrow">→</span>
                </Link>
              </article>
            ) : (
              <p className="m-0 rounded-md bg-ink-3 p-5 text-mist">{t("travel.noMeeting")}</p>
            )}
          </div>
        </div>

        {/* The club bus drives in along the road and idles there. */}
        <div aria-hidden="true" data-reveal className="relative h-14 overflow-hidden">
          <span className="absolute inset-x-0 top-1/2 border-t-[3px] border-dashed border-white/25" />
          <span className="drive-in absolute top-1/2 right-[12%] flex -translate-y-1/2 items-center gap-1 text-orange">
            <span className="flex flex-col gap-1 opacity-60">
              <span className="h-0.5 w-8 rounded bg-orange" />
              <span className="h-0.5 w-5 self-end rounded bg-orange" />
              <span className="h-0.5 w-10 rounded bg-orange" />
            </span>
            <IconBus size={44} strokeWidth={1.8} className="idle" />
          </span>
        </div>
      </div>
    </Band>
  );
}

function Results({ races, today, t }: { races: Race[]; today: string; t: Texts }) {
  const archive = races
    .filter((r) => r.results?.length)
    .map((race) => {
      const date = race.start.slice(0, 10);
      const upcoming = date >= today;
      return {
        race,
        years: (race.results ?? []).map((y) => {
          if (!y.current) return { label: y.label, text: y.text };
          // This year's race: until race day, say when it's run.
          const lead = upcoming
            ? `${t("results.upcomingBefore")} ${dayMonth(date)} ${t("results.upcomingAfter")}`.trim()
            : y.text
              ? ""
              : t("results.pending");
          return { label: y.label, upcoming, text: [lead, y.text].filter(Boolean).join(" ") };
        }),
      };
    });

  const clubLists = [
    { Icon: IconTrophy, title: t("results.list1Title"), text: t("results.list1Text") },
    { Icon: IconList, title: t("results.list2Title"), text: t("results.list2Text") },
    { Icon: IconStar, title: t("results.list3Title"), text: t("results.list3Text") },
  ];
  const records = races.flatMap((r) => (r.records ?? []).map((rec) => ({ ...rec, race: r.name })));

  return (
    <section id="resultat" className={`${wrap} flex scroll-mt-4 flex-col gap-8 pt-10 pb-28`}>
      <SectionHeading tone="purple" sub={t("results.sub")}>
        {t("results.heading")}
      </SectionHeading>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] items-start gap-5">
        {archive.map(({ race, years }, i) => (
          <article
            key={race.slug}
            data-reveal="up"
            style={{ "--reveal-i": i } as CSSProperties}
            className="card flex flex-col overflow-hidden"
          >
            <header className="flex items-center justify-between gap-2 bg-ink px-5 py-3.5 text-white">
              <h3 className="m-0 text-[18px] font-extrabold">
                <Link href={`/tavla/${race.slug}`} className="text-white no-underline hover:text-orange">
                  {race.name}
                </Link>
              </h3>
              <span aria-hidden="true" className={`skew-bar ${race.tone === "purple" ? "bg-purple" : "bg-orange"}`} />
            </header>
            <ol className="m-0 flex list-none flex-col p-0">
              {years.map((y, j) => (
                <li key={j} className="flex flex-col gap-1 border-t border-line px-5 py-3.5 first:border-t-0">
                  <span className="flex items-center gap-2">
                    <span className="text-[15px] font-extrabold">{y.label}</span>
                    {y.upcoming && <Pill tone="orange">{t("results.upcoming")}</Pill>}
                  </span>
                  <span className="text-[14px] text-muted">{y.text}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>

      {records.length > 0 && (
        <div
          data-settle
          style={{ "--rest-rotate": "-1deg" } as CSSProperties}
          className="relative overflow-hidden rounded-md bg-ink p-5 text-white shadow-[0_18px_34px_-14px_rgba(34,30,31,0.6)] md:p-7"
        >
          <svg aria-hidden="true" viewBox="0 0 600 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
            <path d="M560 0 L600 0 L600 50 Z" fill="#5B2A86" opacity="0.9" />
          </svg>
          <h3 className="relative m-0 flex items-center gap-3 text-[20px] font-extrabold">
            <IconTrophy size={22} className="text-orange" />
            {t("results.records")}
          </h3>
          <table className="relative mt-4 w-full border-collapse text-left">
            <caption className="sr-only">Banrekord på våra lopp</caption>
            <thead>
              <tr className="text-[12px] tracking-[0.5px] text-mist uppercase">
                <th scope="col" className="pb-2 font-bold">{t("results.colTime")}</th>
                <th scope="col" className="pb-2 font-bold">{t("results.colName")}</th>
                <th scope="col" className="hidden pb-2 font-bold sm:table-cell">{t("results.colRace")}</th>
                <th scope="col" className="pb-2 text-right font-bold">{t("results.colYear")}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, i) => (
                <tr
                  key={i}
                  data-reveal
                  style={{ "--reveal-i": i + 1 } as CSSProperties}
                  className="border-t border-ink-2"
                >
                  <td className="py-3 pr-3 align-top text-[24px] leading-none font-extrabold text-orange tabular-nums md:text-[30px]">
                    {rec.time}
                  </td>
                  <td className="py-3 pr-3 align-top">
                    <span className="block font-bold">{rec.name}</span>
                    <span className="block text-[14px] text-mist">
                      {rec.club}
                      <span className="sm:hidden">
                        {" "}
                        · {rec.race} {rec.distance}
                      </span>
                    </span>
                  </td>
                  <td className="hidden py-3 pr-3 align-top text-[15px] text-mist sm:table-cell">
                    {rec.race}, {rec.distance}
                  </td>
                  <td className="py-3 text-right align-top font-bold tabular-nums">{rec.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="m-0 text-[19px] font-extrabold">{t("results.lists")}</h3>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4 p-0">
          {clubLists.map(({ Icon, title, text }, i) => (
            <li
              key={i}
              data-reveal="up"
              style={{ "--reveal-i": i } as CSSProperties}
              className="lean-hover card flex items-start gap-3 p-4"
            >
              <Icon size={22} className="mt-0.5 flex-none text-orange-dark" />
              <span className="flex flex-col">
                <span className="font-bold">{title}</span>
                <span className="text-[14px] text-muted">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <ArrowLink href="/kalender" className="self-start">
        {t("results.calendar")}
      </ArrowLink>
    </section>
  );
}
