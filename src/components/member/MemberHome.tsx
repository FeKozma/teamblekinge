import "@/components/news/news.css";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconChevronRight, IconPin, IconPlus } from "@/components/icons";
import { CommentCount } from "@/components/news/LiveCounts";
import { PdfIcon } from "@/components/news/PdfIcon";
import { dayMonthLong, newsDate, pinnedNews } from "@/components/news/util";
import { ArrowLink, DateBadge, Pill, SectionHeading, SpeedLines } from "@/components/ui";
import { upcomingEvents } from "@/lib/content/events";
import { listNews } from "@/lib/content/news";
import { getTermPlan, getTrainingGroups } from "@/lib/content/training";
import type { TermPlan, TrainingGroup } from "@/lib/data/club";
import type { ClubEvent } from "@/lib/data/events";
import { feed, feedKindLabel } from "@/lib/data/feed";
import { commentCount, type NewsItem } from "@/lib/data/news";
import { people, type DemoUser } from "@/lib/data/users";
import { longDate, nextTuesday, relativeDay } from "@/lib/format";
import { isUploadUrl } from "@/lib/uploads";
import { FreshCount, FreshList, type FreshItem } from "./FreshList";
import { MySignups, type SignupSource } from "./MySignups";

// Medlemshem — what a logged-in member sees on "/" (drawup 03, phone). On wide
// screens the same blocks spread into a main column and a side column.

export async function MemberHome({ user, today }: { user: DemoUser; today: string }) {
  const [visible, events, termPlan, groups] = await Promise.all([
    listNews({ members: true }),
    upcomingEvents(today, { members: true }),
    getTermPlan(),
    getTrainingGroups(),
  ]);
  const [featured] = pinnedNews(visible, today);
  const protocol = visible.find((n) => n.category === "Styrelsen" && n.document);
  const fresh = freshItems(visible, featured, today);
  const signups: SignupSource[] = visible
    .filter((n) => n.registration?.kind === "stafett" || n.registration?.kind === "funktionar")
    .map((n) => ({ slug: n.slug, title: n.title, reg: n.registration! }));
  const kicker = longDate(today);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pt-5 pb-12 md:gap-9 md:px-6 md:pt-10 md:pb-16">
      <div className="flex flex-col gap-1.5">
        <span className="run-in self-start bg-orange px-2.5 py-0.5 text-[12px] font-extrabold tracking-[1px] text-ink uppercase [rotate:-2deg]">
          {kicker.charAt(0).toUpperCase() + kicker.slice(1)}
        </span>
        <h1
          className="run-in m-0 text-[26px] leading-tight font-extrabold tracking-[-0.5px] md:text-[40px] md:tracking-[-1px]"
          style={{ "--i": 1 } as CSSProperties}
        >
          Hej {user.firstName}!
        </h1>
        <p className="run-in m-0 text-[14px] text-muted md:text-[16px]" style={{ "--i": 2 } as CSSProperties}>
          <FreshCount ids={fresh.filter((f) => f.unread).map((f) => f.id)} me={user.id} />
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-x-8 gap-y-8">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-8">
          {(featured || protocol) && (
            <section aria-labelledby="viktigt" className="flex flex-col gap-3">
              <h2
                id="viktigt"
                className="m-0 flex items-center gap-1.5 text-[14px] font-extrabold tracking-[1px] text-muted uppercase"
              >
                <IconPin size={16} strokeWidth={2.2} className="text-orange-dark" />
                Viktigt nu
              </h2>
              {featured && <FeaturedCard n={featured} today={today} />}
              {protocol && <ProtocolCard n={protocol} />}
            </section>
          )}

          <section aria-labelledby="nytt" className="flex flex-col gap-3">
            <SectionHeading
              size="md"
              action={
                <Link href="/flodet" className="text-[14px] font-semibold underline underline-offset-3">
                  Till flödet
                </Link>
              }
            >
              <span id="nytt">Nytt sedan sist</span>
            </SectionHeading>
            <FreshList items={fresh} me={user.id} />
            <Link
              href="/flodet#nytt-inlagg"
              className="group flex min-h-12 items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-[#cfc8c4] font-semibold text-ink no-underline transition-colors hover:border-orange hover:bg-white hover:text-ink"
            >
              <IconPlus
                size={18}
                strokeWidth={2.2}
                className="transition-transform duration-500 ease-sprint group-hover:rotate-90"
              />
              Nytt inlägg i flödet
            </Link>
          </section>
        </div>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-8 md:gap-6">
          <section aria-labelledby="mina" className="flex flex-col gap-3">
            <SectionHeading tone="purple">
              <span id="mina">Mina anmälningar</span>
            </SectionHeading>
            <div data-reveal="right">
              <MySignups items={signups} today={today} me={user.id} />
            </div>
          </section>
          <Upcoming today={today} events={events} />
          <WeekTraining today={today} termPlan={termPlan} trainingGroups={groups} />
        </aside>
      </div>
    </div>
  );
}

/**
 * DEMO: "new since your last visit" = feed posts and news flagged unread, plus
 * open members-only sign-ups. The real site keeps read markers per member.
 */
function freshItems(visible: NewsItem[], featured: NewsItem | undefined, today: string): FreshItem[] {
  const posts: FreshItem[] = feed
    .filter((p) => p.unread)
    .map((p) => ({
      id: `flode:${p.id}`,
      href: `/flodet#${p.id}`,
      kicker: `Flödet · ${feedKindLabel[p.kind]}`,
      title: p.title ?? (p.run ? `${p.run.headline} – hänger någon med?` : p.text),
      meta: [people[p.author]?.name, p.when].filter(Boolean).join(" · "),
      unread: true,
      runPostId: p.run ? p.id : undefined,
    }));
  const items: FreshItem[] = visible
    .filter(
      (n) =>
        n !== featured &&
        (n.unread || (n.membersOnly && n.registration && n.registration.deadline >= today)),
    )
    .map((n) => {
      const reg = n.registration;
      return {
        id: `nyhet:${n.slug}`,
        href: `/nyheter/${n.slug}`,
        kicker: `Nyheter · ${n.category}`,
        title: n.title,
        meta: [n.pinnedUntil && n.pinnedUntil >= today ? "Fäst" : null, newsDate(n, today)]
          .filter(Boolean)
          .join(" · "),
        unread: !!n.unread,
        count:
          reg?.capacity != null
            ? { slug: n.slug, reg, format: reg.kind === "funktionar" ? ("left" as const) : ("joined" as const) }
            : undefined,
      };
    });
  return [...posts, ...items];
}

function FeaturedCard({ n, today }: { n: NewsItem; today: string }) {
  const reg = n.registration;
  const lastDay = reg?.deadline === today;
  const tiles = reg
    ? [{ label: "Sista anmälan", value: dayMonthLong(reg.deadline) }, reg.extra?.[0] ?? { label: "Datum", value: reg.dateLabel }]
    : [];
  const external = reg?.kind === "extern" && reg.url;
  const action = "flex min-h-12 items-center justify-center rounded-[10px] font-bold no-underline";

  return (
    <article
      data-reveal="up"
      className="group flex flex-col overflow-hidden rounded-[14px] border-2 border-orange bg-white transition-shadow duration-500 hover:shadow-[0_16px_30px_-14px_rgb(168_84_0/0.45)] md:flex-row"
    >
      <div className="relative h-[130px] flex-none overflow-hidden sm:h-[190px] md:h-auto md:min-h-[300px] md:w-[40%]">
        {n.image ? (
          <Image
            src={n.image}
            alt={n.imageAlt ?? ""}
            fill
            priority
            sizes="(min-width: 768px) 360px, 100vw"
            unoptimized={isUploadUrl(n.image)}
            className="object-cover transition-[clip-path,scale] duration-700 ease-sprint [clip-path:polygon(0_0,100%_0,100%_78%,0_100%)] group-hover:scale-105 md:[clip-path:polygon(0_0,100%_0,86%_100%,0_100%)] md:group-hover:[clip-path:polygon(0_0,100%_0,96%_100%,0_100%)]"
            style={{ objectPosition: n.imagePosition ?? "50% 20%" }}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center bg-ink">
            <SpeedLines
              viewBox="0 0 400 200"
              opacity={0.35}
              lines={[
                [240, 200, 340, 0],
                [280, 200, 380, 0],
                [320, 200, 420, 0],
              ]}
            />
            <Image src="/img/logo-emblem.png" alt="" width={100} height={108} className="relative h-[96px] w-auto" />
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-4 md:gap-3 md:p-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-orange px-2.5 py-0.5 text-[12px] font-extrabold text-ink">{n.category}</span>
          {n.pinnedUntil && (
            <span className="text-[12px] text-muted">Fäst till {dayMonthLong(n.pinnedUntil)}</span>
          )}
        </div>
        <h3 className="m-0 text-[19px] leading-[1.25] font-extrabold md:text-[24px] md:leading-[1.15]">
          <Link href={`/nyheter/${n.slug}`} className="text-ink no-underline hover:text-ink hover:underline">
            {n.title}
          </Link>
        </h3>
        <p className="m-0 text-[14px] text-muted md:text-[15px]">{n.excerpt}</p>
        {tiles.length > 0 && (
          <dl className="m-0 grid grid-cols-2 gap-2 text-[13px]">
            {tiles.map((t, i) => (
              <div key={t.label} className="rounded-lg bg-paper px-2.5 py-2">
                <dt className="text-muted">{t.label}</dt>
                <dd className="m-0 flex flex-wrap items-center gap-1.5 text-[15px] font-bold">
                  {t.value}
                  {i === 0 && lastDay && (
                    <span className="live-dot rounded-full bg-orange px-1.5 text-[11px] font-extrabold uppercase">
                      i dag
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {external ? (
            <a
              href={reg.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${action} btn-dark flex-[1_1_auto] px-4 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5`}
            >
              Till anmälan<span className="sr-only"> (öppnas på mittlopp.se i en ny flik)</span>
            </a>
          ) : (
            <Link
              href={`/nyheter/${n.slug}${reg ? "#anmalan" : ""}`}
              className={`${action} btn-dark flex-[1_1_auto] px-4 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5`}
            >
              {reg ? "Till anmälan" : "Läs mer"}
            </Link>
          )}
          <Link
            href={`/nyheter/${n.slug}#kommentarer`}
            className={`${action} flex-none border-[1.5px] border-[#cfc8c4] px-3.5 text-[14px] font-semibold text-ink transition-colors hover:border-ink hover:text-ink`}
          >
            <CommentCount slug={n.slug} base={commentCount(n)} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProtocolCard({ n }: { n: NewsItem }) {
  const doc = n.document!;
  return (
    <article
      data-reveal="up"
      style={{ "--reveal-i": 1 } as CSSProperties}
      className="flex flex-col gap-2.5 rounded-[14px] border border-line bg-white p-4 md:p-5"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-ink px-2.5 py-0.5 text-[12px] font-extrabold text-white">{n.category}</span>
        <span className="text-[12px] text-muted">
          {n.dateLabel}
          {n.membersOnly && " · Endast medlemmar"}
        </span>
      </div>
      <h3 className="m-0 text-[18px] leading-[1.25] font-extrabold">
        <Link href={`/nyheter/${n.slug}`} className="text-ink no-underline hover:text-ink hover:underline">
          {n.title}
        </Link>
      </h3>
      <Link
        href={doc.href}
        className="group flex min-h-11 items-center gap-3 rounded-[10px] bg-paper px-3 py-2.5 text-ink no-underline hover:text-ink"
      >
        <PdfIcon size="sm" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[14px] font-bold group-hover:underline">{doc.title}</span>
          <span className="text-[12px] text-muted">{doc.path}</span>
        </span>
        <IconChevronRight
          size={18}
          className="flex-none text-muted transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>
    </article>
  );
}

/** Coming up for members — one-off events; the weekly sessions have their own card. */
function Upcoming({ today, events }: { today: string; events: ClubEvent[] }) {
  const items = events.filter((e) => e.kind !== "traning").slice(0, 5);
  return (
    <section className="card flex flex-col gap-3.5 p-5" data-reveal="right" style={{ "--reveal-i": 1 } as CSSProperties}>
      <h2 className="m-0 text-[19px] font-extrabold">Kommande</h2>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map((e) => {
          const isToday = relativeDay(e.date, today) === "I dag";
          return (
            <li key={e.id} className="flex items-center gap-3">
              <span className={`rounded-lg ${isToday ? "live-dot" : ""}`}>
                <DateBadge date={e.date} today={today} highlight={e.kind === "lopp"} size={44} />
              </span>
              <span className="flex min-w-0 flex-col">
                <Link href={e.href ?? "/kalender"} className="font-semibold text-ink no-underline hover:underline">
                  {e.title}
                </Link>
                <span className="text-[13px] text-muted">
                  {e.time} · {e.place}
                  {e.note && e.source === "flode" && ` · ${e.note}`}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <ArrowLink href="/kalender" className="border-t border-line pt-3 text-[14px]">
        Hela kalendern
      </ArrowLink>
    </section>
  );
}

function WeekTraining({
  today,
  termPlan,
  trainingGroups,
}: {
  today: string;
  termPlan: TermPlan;
  trainingGroups: TrainingGroup[];
}) {
  const date = nextTuesday(today);
  const plan = termPlan[date];
  const when = relativeDay(date, today) === "I dag" ? "I kväll" : longDate(date);
  return (
    <section className="card flex flex-col gap-3 p-5" data-reveal="right" style={{ "--reveal-i": 2 } as CSSProperties}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="m-0 text-[19px] font-extrabold">Veckans träning</h2>
        <span className="text-[13px] font-semibold text-orange-dark">
          {when.charAt(0).toUpperCase() + when.slice(1)}
        </span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {trainingGroups.map((g) => (
          <li key={g.id} className="flex items-start gap-3">
            <Pill tone={g.tone} className="mt-px w-[108px] flex-none justify-center">
              {g.short}
            </Pill>
            <span className="text-[14px] font-semibold">{plan?.[g.id] ?? "[Pass enligt terminsplanen]"}</span>
          </li>
        ))}
      </ul>
      <p className="m-0 text-[13px] text-muted">
        Samling 18:00 vid klubblokalen, Tennvägen 11 A – Hälsagruppen 17:45.
      </p>
      <ArrowLink href="/trana-med-oss#terminsplan" className="text-[14px]">
        Hela terminsplanen
      </ArrowLink>
    </section>
  );
}
