"use client";

import "./feed.css";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { IconChevronRight, IconLock, IconPin } from "@/components/icons";
import { SpeedLines } from "@/components/ui";
import type { ClubEvent } from "@/lib/data/events";
import type { FeedPost } from "@/lib/data/feed";
import { Composer } from "./Composer";
import { NotificationSettings, UpcomingRuns } from "./FeedAside";
import { useMyPosts, type MyPost } from "./feed-store";
import { PostCard } from "./PostCard";

type Filter = "allt" | "lopprunda" | "bild" | "kop-salj" | "mina" | "torsdagsgruppen" | "tranare";

type FilterDef = { id: Filter; label: string; short?: string; group?: string; locked?: boolean };

const show: FilterDef[] = [
  { id: "allt", label: "Allt i flödet", short: "Allt" },
  { id: "lopprunda", label: "Löprundor" },
  { id: "bild", label: "Bilder" },
  { id: "kop-salj", label: "Köp & sälj" },
  { id: "mina", label: "Mina inlägg" },
];
const groups: FilterDef[] = [
  { id: "torsdagsgruppen", label: "Torsdagsgruppen", group: "Torsdagsgruppen" },
  { id: "tranare", label: "Tränare", locked: true },
];
const all = [...show, ...groups];
// Phone chip row, in the drawup's order: the everyday filters first.
const chipOrder: Filter[] = ["allt", "lopprunda", "bild", "torsdagsgruppen", "kop-salj", "mina", "tranare"];

function matches(p: FeedPost, f: Filter, me: string) {
  switch (f) {
    case "allt":
      return true;
    case "lopprunda":
    case "kop-salj":
      return p.kind === f;
    case "bild":
      return p.kind === "bild" || !!p.image;
    case "mina":
      return p.author === me;
    case "torsdagsgruppen":
      return p.group === "Torsdagsgruppen";
    case "tranare":
      return false; // closed group — the demo members aren't in it
  }
}

/**
 * Klubbflödet: filters (left / chip row on phones), composer, the pinned-news
 * banner and the posts, with upcoming löprundor and notification settings on
 * the right. Filtering is client-side; posts you write live in demo state.
 */
export function FeedApp({
  me,
  today,
  posts,
  pinned,
  runs,
}: {
  me: { id: string; firstName: string };
  today: string;
  posts: FeedPost[];
  pinned: { slug: string; title: string }[];
  runs: ClubEvent[];
}) {
  const [myPosts, setMyPosts] = useMyPosts();
  const [filter, setFilter] = useState<Filter>("allt");
  const [fresh, setFresh] = useState<string[]>([]);
  const [announce, setAnnounce] = useState("");
  const active = all.find((f) => f.id === filter)!;
  const mine = myPosts.filter((p) => p.author === me.id);
  const shown = [...mine, ...posts].filter((p) => matches(p, filter, me.id));

  function publish(post: MyPost) {
    setMyPosts((prev) => [post, ...prev]);
    setFresh((f) => [...f, post.id]);
    if (!matches(post, filter, me.id)) setFilter("allt");
    setAnnounce(
      post.kind === "lopprunda"
        ? "Din löprunda är upplagd, och du står först på listan."
        : "Ditt inlägg är publicerat.",
    );
  }

  function remove(id: string) {
    setMyPosts((prev) => prev.filter((p) => p.id !== id));
    setAnnounce("Inlägget är borttaget.");
  }

  return (
    <>
      <h1
        data-reveal
        className="m-0 flex items-center gap-3 bg-white px-4 pt-4 pb-1 text-[24px] font-extrabold tracking-[-0.5px] lg:sr-only"
      >
        <span aria-hidden="true" className="skew-bar bg-orange" />
        Klubbflödet
      </h1>

      {/* Phone: swipeable chip row that sticks while you scroll the feed. */}
      <div
        role="group"
        aria-label="Filtrera flödet"
        className="chip-row sticky top-0 z-30 flex gap-2 overflow-x-auto border-b border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden"
      >
        {chipOrder.map((id) => {
          const f = all.find((x) => x.id === id)!;
          const on = filter === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(id)}
              className={`inline-flex min-h-9 flex-none items-center gap-1.5 rounded-full border-[1.5px] px-3.5 text-[14px] transition-[background-color,color,border-color] duration-300 ${
                on ? "border-ink bg-ink font-bold text-white" : "border-[#CFC8C4] bg-white font-semibold text-ink"
              }`}
            >
              {f.short ?? f.label}
              {f.locked && (
                <>
                  <IconLock size={13} />
                  <span className="sr-only">(endast tränare)</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className="mx-auto grid max-w-[1200px] items-start gap-7 px-3 pt-3 pb-28 sm:px-4 md:px-6 md:pt-5 lg:grid-cols-[190px_minmax(0,1fr)_240px] lg:pt-7 xl:grid-cols-[220px_minmax(0,1fr)_260px]">
        <nav aria-label="Filtrera flödet" className="sticky top-6 hidden flex-col gap-1 lg:flex" data-reveal>
          <FilterList title="Visa" items={show} filter={filter} onPick={setFilter} />
          <FilterList title="Grupper" items={groups} filter={filter} onPick={setFilter} className="mt-4" />
          <p className="mx-3 mt-4 mb-0 text-[13px] text-muted">
            Bara för medlemmar. Inga direktmeddelanden eller chatt – inlägg och kommentarer.
          </p>
        </nav>

        <div className="mx-auto flex w-full max-w-[680px] min-w-0 flex-col gap-3 md:gap-4">
          <div data-reveal="up">
            <Composer me={me} today={today} group={active.group} onPost={publish} />
          </div>
          {pinned.length > 0 && (
            <div data-reveal="up" style={{ "--reveal-i": 1 } as CSSProperties}>
              <PinnedBanner pinned={pinned} />
            </div>
          )}

          <p className="sr-only" role="status" aria-live="polite">
            {announce}
          </p>

          {filter === "tranare" ? (
            <EmptyCard title="Tränare är en sluten grupp" locked>
              Gruppen är bara för klubbens tränare. Är du tränare och saknar den? Hör av dig till styrelsen.
            </EmptyCard>
          ) : shown.length === 0 ? (
            <EmptyCard title={filter === "mina" ? "Du har inte delat något än" : "Inget här än"}>
              {filter === "mina"
                ? "Använd rutan ovan för att lägga upp en löprunda, en bild eller en fråga."
                : "Bli först – använd rutan ovan."}
            </EmptyCard>
          ) : (
            shown.map((p, i) => (
              <div
                key={p.id}
                {...(fresh.includes(p.id)
                  ? { className: "feed-new" }
                  : { "data-reveal": "up", style: { "--reveal-i": Math.min(i, 3) } as CSSProperties })}
              >
                <PostCard
                  post={p}
                  me={me}
                  today={today}
                  onDelete={"createdAt" in p ? () => remove(p.id) : undefined}
                />
              </div>
            ))
          )}
        </div>

        <aside className="sticky top-6 hidden flex-col gap-4 lg:flex">
          <UpcomingRuns events={runs} myPosts={mine} me={me.id} today={today} />
          <NotificationSettings me={me.id} />
        </aside>
      </div>
    </>
  );
}

function FilterList({
  title,
  items,
  filter,
  onPick,
  className = "",
}: {
  title: string;
  items: FilterDef[];
  filter: Filter;
  onPick: (f: Filter) => void;
  className?: string;
}) {
  return (
    <>
      <h2 className={`m-0 mb-1.5 text-[13px] font-bold tracking-[1px] text-muted uppercase ${className}`}>{title}</h2>
      {items.map((f) => {
        const on = filter === f.id;
        return (
          <button
            key={f.id}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(f.id)}
            className={`group relative flex min-h-[42px] items-center justify-between overflow-hidden rounded-lg px-3 text-left text-[16px] transition-[background-color,color,translate] duration-300 ${
              on ? "bg-ink font-bold text-white" : "text-ink hover:translate-x-1 hover:bg-white"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute top-0 -left-1 h-full w-2 -skew-x-[18deg] bg-orange transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                on ? "translate-x-0" : "-translate-x-3"
              }`}
            />
            {f.label}
            {f.locked && (
              <>
                <IconLock size={14} />
                <span className="sr-only">(endast tränare)</span>
              </>
            )}
          </button>
        );
      })}
    </>
  );
}

function PinnedBanner({ pinned }: { pinned: { slug: string; title: string }[] }) {
  const href = pinned.length === 1 ? `/nyheter/${pinned[0].slug}` : "/nyheter";
  return (
    <Link
      href={href}
      className="group lean-hover relative flex items-center gap-2.5 overflow-hidden rounded-[14px] bg-ink px-3.5 py-3 text-white no-underline hover:text-white md:gap-3 md:px-4 md:py-3.5"
    >
      <SpeedLines
        viewBox="0 0 680 80"
        opacity={0.35}
        lines={[
          [500, 80, 548, 0],
          [540, 80, 588, 0],
          [580, 80, 628, 0],
        ]}
      />
      <IconPin size={20} strokeWidth={2.2} className="pin-swing relative flex-none text-orange" />
      <span className="relative flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-extrabold tracking-[0.5px] text-orange uppercase md:text-[12px]">
          Viktigt i Nyheter
          {pinned.length > 1 && <span className="md:hidden"> · {pinned.length}</span>}
        </span>
        <span className="line-clamp-2 text-[14px] leading-snug font-bold md:text-[16px]">
          {pinned.map((p) => p.title).join(" · ")}
        </span>
      </span>
      <IconChevronRight
        size={20}
        strokeWidth={2.4}
        className="relative flex-none transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  );
}

function EmptyCard({ title, locked = false, children }: { title: string; locked?: boolean; children: string }) {
  return (
    <div className="card slide-in flex flex-col items-start gap-2 rounded-[14px] p-5">
      {locked && <IconLock size={22} className="text-purple" />}
      <h2 className="m-0 text-[18px] font-extrabold">{title}</h2>
      <p className="m-0 text-[15px] text-muted">{children}</p>
    </div>
  );
}
