import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import {
  IconCheck,
  IconChevronRight,
  IconHelp,
  IconInstagram,
  IconTrophy,
} from "@/components/icons";
import {
  ArrowLink,
  DateBadge,
  Pill,
  SectionHeading,
  SpeedLines,
} from "@/components/ui";
import { around, withLinks } from "@/components/public/text";
import { getAnnouncement } from "@/lib/content/announcement";
import { getClub, getFaqs, getPartners } from "@/lib/content/club";
import { upcomingEvents } from "@/lib/content/events";
import { listNews } from "@/lib/content/news";
import { getPageTexts } from "@/lib/content/pages";
import { getRaces } from "@/lib/content/races";
import { getTermPlan, getTrainingGroups } from "@/lib/content/training";
import { isAnnouncementOn, type Announcement } from "@/lib/data/announcement";
import type { Club, Faq, Partner } from "@/lib/data/club";
import type { ClubEvent } from "@/lib/data/events";
import { commentCount, type NewsItem } from "@/lib/data/news";
import { nextRace, type Race } from "@/lib/data/races";
import { mainTime, type TermPlan, type TrainingGroup } from "@/lib/data/training";
import { longDate, nextTuesday, relativeDay } from "@/lib/format";
import { isUploadUrl } from "@/lib/uploads";

type Texts = (key: string) => string;

const toneTop = { ink: "bg-ink", orange: "bg-orange", purple: "bg-purple" } as const;

export async function Landing({ today }: { today: string }) {
  const [club, faqs, partners, termPlan, groups, races, news, upcoming, announcement, t] = await Promise.all([
    getClub(),
    getFaqs(),
    getPartners(),
    getTermPlan(),
    getTrainingGroups(),
    getRaces(),
    listNews(),
    upcomingEvents(today, { limit: 5 }),
    getAnnouncement(),
    getPageTexts("startsida"),
  ]);
  return (
    <>
      {isAnnouncementOn(announcement, today) && <AktuelltBand a={announcement} />}
      <Hero next={nextRace(races, today)} club={club} t={t} />
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-8 px-4 pt-10 pb-16 md:px-6">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-10">
          <WeeklyTraining today={today} termPlan={termPlan} trainingGroups={groups} club={club} t={t} />
          <QuickLinks t={t} />
          <LatestNews items={news.slice(0, 3)} t={t} />
        </div>
        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
          <Upcoming today={today} items={upcoming} t={t} />
          <JoinCard club={club} t={t} />
          <FollowUs club={club} t={t} />
        </aside>
      </div>
      {races.length > 0 && <OurRaces races={races} t={t} />}
      <FaqTeaser faqs={faqs} t={t} />
      {partners.length > 0 && <Partners partners={partners} t={t} />}
    </>
  );
}

function AktuelltBand({ a }: { a: Announcement }) {
  const content = (
    <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3 text-[15px] md:px-6">
      {a.label && (
        <span className="rounded-full bg-ink px-2.5 py-[3px] text-[12px] font-extrabold tracking-[0.5px] text-white uppercase">
          {a.label}
        </span>
      )}
      <span className="font-bold">{a.title}</span>
      {a.text && <span className="hidden sm:inline">{a.text}</span>}
      {a.href && a.linkText && (
        <span className="ml-auto font-bold">
          {a.linkText}{" "}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </span>
      )}
    </div>
  );
  const className = "group stripes-drift relative z-10 block bg-orange text-ink no-underline hover:text-ink";
  return a.href ? (
    <Link href={a.href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function Hero({ next, club, t }: { next?: Race; club: Club; t: Texts }) {
  const words = t("hero.titleStart").split(/\s+/).filter(Boolean);
  const accent = t("hero.titleAccent");
  const end = t("hero.titleEnd");
  return (
    <section
      className="relative overflow-hidden bg-ink text-white"
      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 90px), 0 100%)" }}
    >
      <SpeedLines
        lines={[
          [560, 640, 980, 0],
          [620, 640, 1040, 0],
          [680, 640, 1100, 0],
          [740, 640, 1160, 0],
          [800, 640, 1220, 0],
          [-200, 640, 220, 0],
        ]}
      />
      <div className="relative mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-14 gap-y-8 px-4 pt-6 pb-32 md:px-6 md:pt-[72px] md:pb-[140px]">
        <div className="order-2 flex min-w-0 flex-[1_1_440px] flex-col gap-5 md:order-1">
          <span className="run-in self-start bg-orange px-3 py-1 text-[13px] font-extrabold tracking-[1px] text-ink uppercase [rotate:-2deg]">
            {around(t("hero.kickerBefore"), club.foundedYear, t("hero.kickerAfter"))}
          </span>
          <h1 className="m-0 text-[38px] leading-[1.05] font-extrabold tracking-[-1.5px] sm:text-[48px] lg:text-[56px]">
            {words.map((w, i) => (
              <span key={i} className="run-in" style={{ "--i": i } as CSSProperties}>
                {w}
                {" "}
              </span>
            ))}
            {accent && (
              <>
                <span className="tilt-pop inline-block translate-y-1 -rotate-3 text-orange">{accent}</span>{" "}
              </>
            )}
            {end && (
              <span className="run-in" style={{ "--i": 6 } as CSSProperties}>
                {end}
              </span>
            )}
          </h1>
          <p
            className="run-in m-0 max-w-[560px] text-[17px] text-mist md:text-[18px]"
            style={{ "--i": 7 } as CSSProperties}
          >
            {around(t("hero.introBefore"), `${club.address.street} i ${club.address.area}`, t("hero.introAfter"))}
          </p>
          <div className="run-in mt-1 flex flex-wrap gap-3" style={{ "--i": 8 } as CSSProperties}>
            <Link href="/trana-med-oss#prova-pa" className="btn btn-primary btn-lg flex-1 sm:flex-none">
              {t("hero.primary")}
            </Link>
            <Link href="/bli-medlem" className="btn btn-outline-light btn-lg flex-1 sm:flex-none">
              {t("hero.secondary")}
            </Link>
          </div>
          {t("hero.check") && (
            <p
              className="run-in m-0 flex items-center gap-2.5 text-[15px] text-mist"
              style={{ "--i": 9 } as CSSProperties}
            >
              <IconCheck size={20} strokeWidth={2.4} className="flex-none text-orange" />
              {t("hero.check")}
            </p>
          )}
        </div>

        <div className="relative order-1 min-w-0 flex-[1_1_380px] md:order-2">
          <div className="parallax relative -rotate-3">
            <span
              aria-hidden="true"
              className="hero-plate absolute top-[22px] -right-[18px] -bottom-[22px] left-[18px] bg-orange"
              style={{ clipPath: "polygon(12% 0, 100% 0, 88% 100%, 0 100%)" }}
            />
            <Image
              src="/img/kustmaran-start.jpg"
              alt="Löpare i starten på Kustmaran i Kristianopel"
              width={1000}
              height={599}
              priority
              sizes="(min-width: 768px) 560px, 100vw"
              className="hero-photo relative block h-[230px] w-full object-cover sm:h-[320px] md:h-[400px]"
              style={{ clipPath: "polygon(12% 0, 100% 0, 88% 100%, 0 100%)" }}
            />
          </div>
          {next && (
            <Link
              href={`/tavla/${next.slug}`}
              className="group absolute -bottom-6 left-0 hidden rotate-2 flex-col gap-2 rounded-md bg-ink-3/95 px-4 py-3 text-white no-underline shadow-[0_14px_30px_rgba(0,0,0,0.45)] ring-1 ring-ink-2 backdrop-blur transition-[rotate,translate] duration-500 hover:-translate-y-1 hover:rotate-0 hover:text-white sm:flex md:-bottom-10 md:-left-6"
            >
              <span className="text-[12px] font-extrabold tracking-[1px] text-orange uppercase">
                {next.name} · {t("hero.countdown")}
              </span>
              <Countdown to={next.start} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function WeeklyTraining({
  today,
  termPlan,
  trainingGroups,
  club,
  t,
}: {
  today: string;
  termPlan: TermPlan;
  trainingGroups: TrainingGroup[];
  club: Club;
  t: Texts;
}) {
  const date = nextTuesday(today);
  const plan = termPlan[date];
  const isTonight = relativeDay(date, today) === "I dag";
  const when = `${isTonight ? `${t("week.tonight")}, ` : ""}${longDate(date)}`;
  const time = mainTime(trainingGroups);
  const place = `${t("week.place")}, ${club.address.street}, ${club.address.area}`;
  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        sub={`${when.charAt(0).toUpperCase()}${when.slice(1)} · ${time} · ${place}`}
        action={<ArrowLink href="/trana-med-oss#terminsplan">{t("week.all")}</ArrowLink>}
      >
        {t("week.heading")}
      </SectionHeading>

      {/* Desktop: three cards */}
      <div className="hidden grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 md:grid">
        {trainingGroups.map((g, i) => (
          <Link
            key={g.id}
            href={`/trana-med-oss#${g.id === "halsa" ? "halsagruppen" : "grupper"}`}
            data-reveal="up"
            style={{ "--reveal-i": i } as CSSProperties}
            className="lean-hover relative flex flex-col gap-2 overflow-hidden rounded-[4px_4px_12px_12px] border border-line bg-white p-5 pt-[26px] text-ink no-underline shadow-[0_6px_14px_rgba(34,30,31,0.08)] hover:text-ink"
          >
            <span
              aria-hidden="true"
              className={`group-bar absolute inset-x-0 top-0 h-1.5 origin-left ${toneTop[g.tone]}`}
            />
            <Pill tone={g.tone}>{g.name}</Pill>
            <h3 className="m-0 text-[18px] font-bold">
              {plan?.[g.id] || t("week.missing")}
            </h3>
            <p className="m-0 text-[14px] text-muted">
              {g.description} {g.requirement}
            </p>
            {g.time !== time && (
              <p className="m-0 text-[13px] font-semibold text-purple">
                {t("week.meet")} {g.time}
              </p>
            )}
          </Link>
        ))}
      </div>

      {/* Phone: compact rows, as in the mobile drawup */}
      <ul className="card divide-y divide-line overflow-hidden md:hidden" data-reveal>
        {trainingGroups.map((g) => (
          <li key={g.id}>
            <Link
              href={`/trana-med-oss#${g.id === "halsa" ? "halsagruppen" : "grupper"}`}
              className="flex min-h-[72px] items-center gap-3 px-4 text-ink no-underline"
            >
              <span className="flex-none">
                <Pill tone={g.tone}>{g.short}</Pill>
              </span>
              <span className="flex-1 text-[15px] font-semibold">{plan?.[g.id] || t("week.missingShort")}</span>
              <IconChevronRight size={18} className="text-muted" />
            </Link>
          </li>
        ))}
      </ul>

      {t("week.newText") && (
        <p className="m-0 text-[15px] text-muted">
          {withLinks(t("week.newText"), [
            { words: t("week.newLinkTry"), href: "/trana-med-oss#prova-pa", className: "font-semibold" },
            { words: t("week.newLinkParking"), href: "/trana-med-oss#parkering", className: "font-semibold" },
          ])}
        </p>
      )}
    </section>
  );
}

function QuickLinks({ t }: { t: Texts }) {
  const links = [
    { href: "/tavla#resultat", label: t("quick.results"), Icon: IconTrophy },
    { href: "/fragor", label: t("quick.faq"), Icon: IconHelp },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:hidden">
      {links.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className="lean-hover card flex flex-col gap-2 p-4 font-bold text-ink no-underline"
        >
          <Icon size={22} className="text-orange-dark" />
          {label}
        </Link>
      ))}
    </div>
  );
}

function LatestNews({ items, t }: { items: NewsItem[]; t: Texts }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeading tone="purple" action={<ArrowLink href="/nyheter">{t("news.all")}</ArrowLink>}>
        {t("news.heading")}
      </SectionHeading>
      <div className="flex flex-col gap-3.5">
        {items.map((n, i) => {
          const comments = commentCount(n);
          return (
            <Link
              key={n.slug}
              href={`/nyheter/${n.slug}`}
              data-reveal
              style={{ "--reveal-i": i } as CSSProperties}
              className="group lean-hover flex flex-wrap overflow-hidden rounded-xl border border-line bg-white text-ink no-underline hover:text-ink"
            >
              <span className="relative min-h-[150px] flex-[1_1_200px] overflow-hidden sm:max-h-[190px] sm:w-[200px]">
                {n.image ? (
                  <Image
                    src={n.image}
                    alt={n.imageAlt ?? ""}
                    fill
                    sizes="(min-width: 640px) 240px, 100vw"
                    unoptimized={isUploadUrl(n.image)}
                    className="diag-img object-cover group-hover:scale-105"
                    style={{ objectPosition: n.imagePosition }}
                  />
                ) : (
                  <span className="diag-img absolute inset-0 flex items-center justify-center bg-ink">
                    <Image src="/img/logo-emblem.png" alt="" width={96} height={104} />
                  </span>
                )}
              </span>
              <span className="flex min-w-0 flex-[999_1_300px] flex-col gap-1.5 px-5 py-[18px]">
                <span className="text-[13px] text-muted">
                  <span className="font-bold text-purple">{n.category}</span> · {n.dateLabel} ·{" "}
                  {comments === 1 ? "1 kommentar" : `${comments} kommentarer`}
                </span>
                <span className="text-[19px] leading-[1.25] font-extrabold">{n.title}</span>
                <span className="text-[15px] text-muted">{n.excerpt}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Upcoming({ today, items, t }: { today: string; items: ClubEvent[]; t: Texts }) {
  return (
    <section className="card flex flex-col gap-3.5 p-5" data-reveal="right">
      <h2 className="m-0 text-[19px] font-extrabold">{t("upcoming.heading")}</h2>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map((e) => {
          const isToday = relativeDay(e.date, today) === "I dag";
          return (
            <li key={e.id} className="flex items-center gap-3">
              <span className={`rounded-lg ${isToday ? "live-dot" : ""}`}>
                <DateBadge date={e.date} today={today} highlight={e.kind === "lopp"} />
              </span>
              <span className="flex min-w-0 flex-col">
                <Link href={e.href ?? "/kalender"} className="font-semibold text-ink no-underline hover:underline">
                  {e.title}
                </Link>
                <span className="text-[13px] text-muted">
                  {e.time} · {e.kind === "lopp" ? `${e.place} · ${t("upcoming.own")}` : e.place}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-3 text-[14px]">
        <ArrowLink href="/kalender">{t("upcoming.all")}</ArrowLink>
        <a href="/kalender.ics" className="font-semibold">
          {t("upcoming.subscribe")}
        </a>
      </div>
    </section>
  );
}

function JoinCard({ club, t }: { club: Club; t: Texts }) {
  return (
    <section
      data-reveal="right"
      style={{ "--reveal-i": 1 } as CSSProperties}
      className="straighten-hover stripes-drift relative my-2 flex rotate-2 flex-col gap-2.5 overflow-hidden rounded bg-orange px-[22px] py-[26px] text-ink shadow-[0_10px_22px_rgba(168,84,0,0.25)]"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 300 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <g stroke="#221E1F" strokeWidth="2" opacity="0.18">
          <path d="M190 200 L300 40" />
          <path d="M220 200 L300 84" />
          <path d="M250 200 L300 128" />
        </g>
      </svg>
      <h2 className="relative m-0 text-[20px] font-extrabold">{t("join.heading")}</h2>
      <p className="relative m-0 text-[15px]">
        {club.fee} kr för hela {club.feeYear}, {t("join.text")}
      </p>
      <Link href="/bli-medlem" className="btn btn-dark relative self-start">
        {t("join.button")}
      </Link>
    </section>
  );
}

function FollowUs({ club, t }: { club: Club; t: Texts }) {
  return (
    <section className="card flex flex-col gap-2.5 p-5" data-reveal="right" style={{ "--reveal-i": 2 } as CSSProperties}>
      <h2 className="m-0 text-[19px] font-extrabold">{t("follow.heading")}</h2>
      <a
        href={club.instagram}
        className="flex min-h-11 items-center gap-2.5 font-semibold text-ink no-underline hover:text-orange-dark"
      >
        <IconInstagram size={22} />
        {t("follow.instagram")}
      </a>
      {t("follow.text") && (
        <p className="m-0 text-[13px] text-muted">
          {withLinks(t("follow.text"), [{ words: t("follow.textLink"), href: "/logga-in" }])}
        </p>
      )}
    </section>
  );
}

function OurRaces({ races, t }: { races: Race[]; t: Texts }) {
  // Scattered like cards dropped on a table; each settles into place on scroll
  // and straightens up on hover.
  const poses = [
    { rotate: "-1.5deg", y: "md:translate-y-0" },
    { rotate: "1.5deg", y: "md:translate-y-14" },
    { rotate: "-0.5deg", y: "md:translate-y-[18px]" },
  ];
  return (
    <section
      className="relative bg-ink text-white"
      style={{ clipPath: "polygon(0 80px, 100% 0, 100% calc(100% - 80px), 0 100%)" }}
    >
      <SpeedLines
        viewBox="0 0 1440 900"
        opacity={0.3}
        lines={[
          [-100, 900, 500, 0],
          [-40, 900, 560, 0],
          [20, 900, 620, 0],
          [80, 900, 680, 0],
        ]}
      >
        <path d="M1300 0 L1440 0 L1440 220 Z" fill="#5B2A86" opacity="0.8" />
      </SpeedLines>
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-8 px-4 pt-[136px] pb-[150px] md:px-6 md:pb-[176px]">
        <div className="flex flex-wrap items-baseline justify-between gap-2" data-reveal>
          <h2 className="m-0 flex -rotate-2 items-center gap-4 text-[36px] font-extrabold tracking-[-1px] md:text-[44px]">
            <span aria-hidden="true" className="skew-bar !h-5 !w-10 bg-orange" />
            {t("races.heading")}
          </h2>
          <Link href="/tavla#resultat" className="arrow-link text-orange hover:text-orange">
            {t("races.results")} <span className="arrow">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-start gap-7 text-ink">
          {races.map((r, i) => (
            <div key={r.slug} className={poses[i % poses.length].y}>
              <article
                data-settle
                className="straighten-hover flex flex-col overflow-hidden rounded-md bg-white shadow-[0_14px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_24px_40px_rgba(0,0,0,0.45)]"
                style={{ "--rest-rotate": poses[i % poses.length].rotate, "--reveal-i": i } as CSSProperties}
              >
                {r.imageFit === "contain" ? (
                  <div className="flex h-[220px] items-center justify-center border-b border-line bg-white">
                    <Image
                      src={r.image}
                      alt={r.imageAlt}
                      width={600}
                      height={580}
                      unoptimized={isUploadUrl(r.image)}
                      className="h-[190px] w-auto"
                    />
                  </div>
                ) : (
                  <Image
                    src={r.image}
                    alt={r.imageAlt}
                    width={1000}
                    height={600}
                    sizes="(min-width: 768px) 380px, 100vw"
                    unoptimized={isUploadUrl(r.image)}
                    className="h-[220px] w-full object-cover"
                    style={{
                      // Posters carry their title at the top; keep it in the crop.
                      objectPosition: r.imageFit === "poster" ? "50% 20%" : undefined,
                      clipPath: i % 2 ? "polygon(0 0, 100% 0, 100% 100%, 0 82%)" : "polygon(0 0, 100% 0, 100% 82%, 0 100%)",
                    }}
                  />
                )}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <span
                    className={`text-[13px] font-bold tracking-[0.5px] uppercase ${
                      r.tone === "purple" ? "text-purple" : "text-orange-dark"
                    }`}
                  >
                    {r.kicker}
                  </span>
                  <h3 className="m-0 text-[21px] font-extrabold">{r.name}</h3>
                  <p className="m-0 text-[15px] text-muted">{r.summary}</p>
                  <Link href={`/tavla/${r.slug}`} className="btn btn-dark mt-auto self-start">
                    {r.cta}
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqTeaser({ faqs, t }: { faqs: Faq[]; t: Texts }) {
  return (
    <section className="mx-auto flex max-w-[1200px] flex-wrap gap-10 px-4 py-14 md:px-6">
      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-3">
        <SectionHeading>{t("faq.heading")}</SectionHeading>
        <p className="m-0 text-muted">{t("faq.text")}</p>
        <ArrowLink href="/fragor">{t("faq.all")}</ArrowLink>
      </div>
      <div className="flex min-w-0 flex-[2_1_480px] flex-col gap-2.5">
        {faqs.slice(0, 4).map((f, i) => (
          <details
            key={f.q}
            className="faq card rounded-[10px] px-5 py-4"
            open={i === 0}
            data-reveal="up"
            style={{ "--reveal-i": i } as CSSProperties}
          >
            <summary className="flex items-center gap-2 text-[17px] font-bold">
              <IconChevronRight size={18} className="chev flex-none text-orange-dark" />
              {f.q}
            </summary>
            <p className="m-0 pt-2.5 pl-[26px] text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Partners({ partners, t }: { partners: Partner[]; t: Texts }) {
  const row = [...partners, ...partners];
  const tile =
    "flex h-[88px] w-[160px] items-center justify-center rounded-lg border border-line p-2.5 grayscale transition-[filter] duration-300 hover:grayscale-0";
  return (
    <section aria-label={t("partners.heading")} className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 pt-10 pb-[104px] md:px-6">
        <h2 className="m-0 text-[15px] font-bold tracking-[1px] text-muted uppercase">{t("partners.heading")}</h2>
        <div className="marquee overflow-hidden">
          <ul className="marquee-track m-0 list-none gap-4 p-0">
            {row.map((p, i) => {
              const copy = i >= partners.length;
              const logo = (
                <Image
                  src={p.logo}
                  alt={copy ? "" : p.name}
                  width={300}
                  height={160}
                  unoptimized={isUploadUrl(p.logo)}
                  className="max-h-full w-auto max-w-full object-contain"
                />
              );
              return (
                <li key={i} aria-hidden={copy}>
                  {p.url ? (
                    // The second copy only completes the loop: keep it out of the tab order.
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={copy ? -1 : undefined}
                      className={`${tile} hover:border-ink`}
                    >
                      {logo}
                      {!copy && <span className="sr-only">(öppnas i ny flik)</span>}
                    </a>
                  ) : (
                    <span className={tile}>{logo}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
