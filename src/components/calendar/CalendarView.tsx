"use client";

import "./calendar.css";
import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { basePost, runEvent, useMyPosts, useRunJoiners } from "@/components/feed/feed-store";
import { IconLock, IconMapPin } from "@/components/icons";
import { DateBadge, Pill, SectionHeading } from "@/components/ui";
import { eventKindLabel, type ClubEvent, type EventKind } from "@/lib/data/events";
import type { FeedPost } from "@/lib/data/feed";
import type { Tone } from "@/lib/data/users";
import { addDays, dayMonth, dayNum, longDate, monthsLong, weekday } from "@/lib/format";

const kinds: EventKind[] = ["traning", "lopp", "lopprunda", "mote", "resa"];

// One colour per kind, shared by the strip's dots, the chips and the pills.
const kindStyle: Record<EventKind, { dot: string; pill: Tone | "soft" }> = {
  traning: { dot: "bg-ink", pill: "ink" },
  lopp: { dot: "bg-orange", pill: "orange" },
  lopprunda: { dot: "bg-purple", pill: "purple" },
  mote: { dot: "bg-muted", pill: "soft" },
  resa: { dot: "bg-green", pill: "soft" },
};

const STRIP_DAYS = 14;
const PAGE_DAYS = 10;

const isLocked = (e: ClubEvent) => !!e.membersOnly || e.source === "flode";

/**
 * Two-week strip, kind filters and the agenda (grouped by month and day).
 * Filtering is client-side. Members also see löprundor they've posted in
 * Klubbflödet (demo state), merged in with the club's own events.
 */
export function CalendarView({
  events,
  today,
  member,
  me,
  aside,
}: {
  /** Upcoming events this visitor may see. */
  events: ClubEvent[];
  today: string;
  member: boolean;
  me: string | null;
  aside: ReactNode;
}) {
  const [myPosts] = useMyPosts();
  const [picked, setPicked] = useState<EventKind[]>([]);
  const [limit, setLimit] = useState(PAGE_DAYS);
  // After the first filter change, new dots pop at once instead of waiting
  // for the strip's entrance.
  const [touched, setTouched] = useState(false);

  const mine = member && me ? myPosts.filter((p) => p.author === me) : [];
  const all = [...events, ...mine.map(runEvent).filter((e): e is ClubEvent => !!e && e.date >= today)].sort(
    (a, b) => (a.date + a.time).localeCompare(b.date + b.time),
  );
  const visible = picked.length ? all.filter((e) => picked.includes(e.kind)) : all;

  const byDay = new Map<string, ClubEvent[]>();
  for (const e of visible) byDay.set(e.date, [...(byDay.get(e.date) ?? []), e]);
  const dayKeys = [...byDay.keys()];
  const stripEnd = addDays(today, STRIP_DAYS - 1);
  // Always render every day the strip links to, then page through the rest.
  const shownDays = dayKeys.slice(0, Math.max(limit, dayKeys.filter((d) => d <= stripEnd).length));
  const hiddenCount = dayKeys.slice(shownDays.length).reduce((n, d) => n + byDay.get(d)!.length, 0);

  const months: { key: string; days: string[] }[] = [];
  for (const d of shownDays) {
    const key = d.slice(0, 7);
    if (months.at(-1)?.key !== key) months.push({ key, days: [] });
    months.at(-1)!.days.push(d);
  }

  const counts = Object.fromEntries(kinds.map((k) => [k, all.filter((e) => e.kind === k).length])) as Record<
    EventKind,
    number
  >;
  const findPost = (id: string): FeedPost | undefined => basePost(id) ?? mine.find((p) => p.id === id);

  function pick(next: (p: EventKind[]) => EventKind[]) {
    setPicked(next);
    setTouched(true);
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 md:px-6">
      <section
        aria-labelledby="cal-strip-title"
        className="relative z-10 -mt-12 rounded-2xl border border-line bg-white shadow-[0_18px_40px_-18px_rgba(34,30,31,0.35)] md:-mt-16"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 px-4 pt-3.5 md:px-5">
          <h2 id="cal-strip-title" className="m-0 text-[15px] font-extrabold">
            Två veckor framåt
          </h2>
          <span className="text-[13px] text-muted">
            {dayMonth(today)} – {dayMonth(stripEnd)}
          </span>
        </div>
        {/* One week per row until there's room for both side by side. */}
        <ol className="m-0 grid list-none grid-cols-7 gap-1 p-3 pt-2.5 sm:gap-1.5 md:gap-2 md:px-4 md:pb-4 lg:grid-cols-14">
          {Array.from({ length: STRIP_DAYS }, (_, i) => {
            const date = addDays(today, i);
            return (
              <StripDay key={date} date={date} i={i} today={today} items={byDay.get(date) ?? []} quick={touched} />
            );
          })}
        </ol>
      </section>

      <div className="flex flex-wrap items-start gap-x-10 gap-y-8 pt-6 pb-28 md:pt-8">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
          {/* Sticky only from md: wrapped onto phones it would take half the screen. */}
          <div className="flex flex-col gap-2.5 py-3 md:sticky md:top-0 md:z-20 md:bg-paper/95 md:backdrop-blur">
            <div role="group" aria-label="Visa typ av aktivitet" className="flex flex-wrap gap-2">
              <Chip on={picked.length === 0} onClick={() => pick(() => [])}>
                Alla
              </Chip>
              {kinds.map((k) => (
                <Chip
                  key={k}
                  on={picked.includes(k)}
                  onClick={() => pick((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))}
                  dot={kindStyle[k].dot}
                  count={counts[k]}
                  locked={!member && k === "lopprunda"}
                >
                  {eventKindLabel[k]}
                </Chip>
              ))}
            </div>
            {!member && (
              <p className="m-0 flex items-center gap-2 text-[14px] text-muted">
                <IconLock size={15} className="flex-none text-purple" />
                <span>
                  <Link href="/logga-in?next=/kalender" className="font-bold text-purple hover:text-purple">
                    Logga in
                  </Link>{" "}
                  för att se medlemmarnas löprundor.
                </span>
              </p>
            )}
          </div>

          {visible.length === 0 ? (
            <div className="card flex flex-col gap-2 p-5">
              <h2 className="m-0 text-[18px] font-extrabold">Inget inplanerat här just nu</h2>
              <p className="m-0 text-[15px] text-muted">
                {!member && picked.includes("lopprunda")
                  ? "Löprundorna från Klubbflödet syns bara för medlemmar."
                  : "Prova en annan typ, eller visa allt."}
              </p>
              <button type="button" onClick={() => pick(() => [])} className="btn btn-outline mt-1 self-start">
                Visa allt
              </button>
            </div>
          ) : (
            months.map((m) => {
              const [y, mo] = m.key.split("-").map(Number);
              const name = monthsLong[mo - 1];
              return (
                <section key={m.key} className="flex flex-col gap-4">
                  <SectionHeading>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                    <span className="text-[0.7em] font-bold text-muted">{y}</span>
                  </SectionHeading>
                  <ol className="m-0 flex list-none flex-col gap-5 p-0">
                    {m.days.map((d, i) => (
                      <AgendaDay
                        key={d}
                        date={d}
                        i={i}
                        today={today}
                        items={byDay.get(d)!}
                        me={me}
                        findPost={findPost}
                      />
                    ))}
                  </ol>
                </section>
              );
            })
          )}

          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setLimit(shownDays.length + PAGE_DAYS)}
              className="btn btn-outline self-center"
            >
              Visa fler · {hiddenCount} till
            </button>
          )}
        </div>

        <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-5 md:sticky md:top-6">{aside}</aside>
      </div>
    </div>
  );
}

function StripDay({
  date,
  i,
  today,
  items,
  quick,
}: {
  date: string;
  i: number;
  today: string;
  items: ClubEvent[];
  quick: boolean;
}) {
  const isToday = date === today;
  const dow = weekday(date);
  const weekend = dow === "lördag" || dow === "söndag";
  const label = `${longDate(date)}${isToday ? ", i dag" : ""}: ${
    items.length ? `${items.length} ${items.length === 1 ? "aktivitet" : "aktiviteter"}` : "inget inplanerat"
  }`;
  const inner = (
    <>
      <span aria-hidden="true" className="flex flex-col items-center gap-0.5">
        <span
          className={`text-[11px] font-extrabold tracking-[0.5px] whitespace-nowrap uppercase ${
            isToday ? "text-orange" : weekend ? "text-orange-dark" : "text-muted"
          }`}
        >
          {isToday ? "I dag" : dow.slice(0, 3)}
        </span>
        <span className="text-[22px] leading-none font-extrabold">{dayNum(date)}</span>
        <span className={`text-[10px] font-bold uppercase ${isToday ? "text-mist" : "text-muted"}`}>
          {dayMonth(date).split(" ")[1]}
        </span>
        <span className="mt-1 flex h-2 items-center gap-[3px]">
          {items.slice(0, 3).map((e, j) => (
            <span
              key={e.id}
              className={`cal-dot h-[7px] w-[7px] rounded-full ${quick ? "cal-dot-now" : ""} ${
                isToday && e.kind === "traning" ? "bg-white" : kindStyle[e.kind].dot
              }`}
              style={{ "--i": i + j * 0.5 } as CSSProperties}
            />
          ))}
          {items.length > 3 && <span className="text-[10px] leading-none font-bold">+</span>}
        </span>
      </span>
      <span className="sr-only">{label}</span>
    </>
  );
  const cls = `cal-day flex min-w-0 flex-1 flex-col items-center rounded-xl py-2.5 no-underline md:px-1.5 ${
    isToday ? "live-dot bg-ink text-white" : "bg-paper text-ink"
  }`;
  return (
    <li className="flex min-w-0" style={{ "--i": i } as CSSProperties}>
      {items.length ? (
        <a
          href={`#dag-${date}`}
          className={`${cls} transition-[translate,box-shadow,background-color] duration-300 hover:-translate-y-1 hover:shadow-[0_10px_18px_-10px_rgba(34,30,31,0.5)] ${
            isToday ? "hover:text-white" : "hover:bg-orange-soft hover:text-ink"
          }`}
        >
          {inner}
        </a>
      ) : (
        <span className={`${cls} opacity-55`}>{inner}</span>
      )}
    </li>
  );
}

function Chip({
  on,
  onClick,
  dot,
  count,
  locked = false,
  children,
}: {
  on: boolean;
  onClick: () => void;
  dot?: string;
  count?: number;
  locked?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`cal-chip inline-flex min-h-10 flex-none items-center gap-2 rounded-full border-[1.5px] px-3.5 text-[14px] transition-[background-color,color,border-color] duration-300 ${
        on ? "border-ink bg-ink font-bold text-white" : "border-[#CFC8C4] bg-white font-semibold text-ink hover:border-ink"
      }`}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 rounded-full ${dot} ${on && dot === "bg-ink" ? "ring-2 ring-white" : ""}`}
        />
      )}
      {children}
      {locked ? (
        <>
          <IconLock size={13} />
          <span className="sr-only">(för medlemmar)</span>
        </>
      ) : (
        count !== undefined && (
          <span className={`text-[12px] font-bold ${on ? "text-mist" : "text-muted"}`}>
            {count}
            <span className="sr-only"> st</span>
          </span>
        )
      )}
    </button>
  );
}

function AgendaDay({
  date,
  i,
  today,
  items,
  me,
  findPost,
}: {
  date: string;
  i: number;
  today: string;
  items: ClubEvent[];
  me: string | null;
  findPost: (id: string) => FeedPost | undefined;
}) {
  const isToday = date === today;
  const dow = weekday(date);
  return (
    <li
      id={`dag-${date}`}
      data-reveal
      style={{ "--reveal-i": Math.min(i, 3) } as CSSProperties}
      className="scroll-mt-4 md:grid md:scroll-mt-28 md:grid-cols-[170px_minmax(0,1fr)] md:gap-5"
    >
      <div className="mb-2.5 flex items-center gap-3 md:sticky md:top-24 md:mb-0 md:self-start md:pt-1">
        <span className={`flex-none rounded-lg ${isToday ? "live-dot" : ""}`}>
          <DateBadge date={date} today={today} highlight={items.some((e) => e.kind === "lopp")} />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-bold">{dow.charAt(0).toUpperCase() + dow.slice(1)}</span>
          <span className="text-[14px] text-muted">{longDate(date).split(" ").slice(1).join(" ")}</span>
        </span>
      </div>
      <ul className="card m-0 list-none divide-y divide-line overflow-hidden p-0">
        {items.map((e) => (
          <EventRow key={e.id} e={e} me={me} post={e.post ? findPost(e.post) : undefined} />
        ))}
      </ul>
    </li>
  );
}

function EventRow({ e, me, post }: { e: ClubEvent; me: string | null; post?: FeedPost }) {
  const s = kindStyle[e.kind];
  const pill = (className: string) => (
    <Pill tone={s.pill} className={className}>
      {s.pill === "soft" && <span aria-hidden="true" className={`h-2 w-2 rounded-full ${s.dot}`} />}
      {eventKindLabel[e.kind]}
    </Pill>
  );
  const note = e.note && e.note !== eventKindLabel[e.kind] ? e.note : null;
  return (
    <li className="group relative flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-paper/70 md:gap-4 md:px-5">
      <span className="w-[46px] flex-none pt-px text-[15px] font-extrabold tabular-nums">{e.time}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <h3 className="m-0 text-[16px] leading-snug font-bold md:text-[17px]">
            {e.href ? (
              <Link
                href={e.href}
                className="text-ink no-underline after:absolute after:inset-0 after:content-[''] hover:text-ink group-hover:underline"
              >
                {e.title}
              </Link>
            ) : (
              e.title
            )}
          </h3>
          {isLocked(e) && (
            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-purple">
              <IconLock size={13} />
              Medlemmar
            </span>
          )}
        </span>
        <span className="flex items-center gap-1 text-[14px] text-muted">
          <IconMapPin size={14} className="flex-none" />
          {e.place}
        </span>
        {post?.run && me ? (
          <RunNote post={post} me={me} />
        ) : (
          note && <span className="text-[14px] text-muted">{note}</span>
        )}
        {pill("mt-1.5 md:hidden")}
      </span>
      {/* A variant, not plain `hidden`: Pill's own inline-flex would win over that. */}
      {pill("flex-none max-md:hidden")}
      {e.href && (
        <span
          aria-hidden="true"
          className="hidden self-center text-orange-dark transition-transform duration-300 group-hover:translate-x-1 md:inline"
        >
          →
        </span>
      )}
    </li>
  );
}

/** "Tillbaka via Rödeby · 4 hänger med" — live from Klubbflödet. */
function RunNote({ post, me }: { post: FeedPost; me: string }) {
  const joiners = useRunJoiners(post, me);
  const joined = joiners.includes(me);
  return (
    <span className="text-[14px] text-muted">
      {post.run?.detail && <>{post.run.detail} · </>}
      <span className={joined ? "font-bold text-purple" : ""}>
        {joiners.length} hänger med{joined && " – du också"}
      </span>
    </span>
  );
}
