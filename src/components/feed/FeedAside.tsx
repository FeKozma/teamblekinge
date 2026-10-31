"use client";

import Link from "next/link";
import { useId, useState, type CSSProperties } from "react";
import { DateBadge } from "@/components/ui";
import type { ClubEvent } from "@/lib/data/events";
import type { FeedPost } from "@/lib/data/feed";
import { useDemoState } from "@/lib/demo-store";
import { basePost, runEvent, useRunJoiners, type MyPost } from "./feed-store";

/** "Kommande löprundor" — the calendar's löprundor plus any you've posted. */
export function UpcomingRuns({
  events,
  myPosts,
  me,
  today,
}: {
  events: ClubEvent[];
  myPosts: MyPost[];
  me: string;
  today: string;
}) {
  const mine = myPosts
    .map((p) => ({ e: runEvent(p), post: p as FeedPost }))
    .filter((x): x is { e: ClubEvent; post: FeedPost } => !!x.e && x.e.date >= today);
  const items = [...events.map((e) => ({ e, post: e.post ? basePost(e.post) : undefined })), ...mine]
    .sort((a, b) => (a.e.date + a.e.time).localeCompare(b.e.date + b.e.time))
    .slice(0, 4);

  return (
    <section className="card flex flex-col gap-3 p-[18px]" data-reveal="right">
      <h2 className="m-0 text-[17px] font-extrabold">Kommande löprundor</h2>
      {items.length === 0 && <p className="m-0 text-[14px] text-muted">Inga inplanerade just nu – lägg upp en!</p>}
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map(({ e, post }) => (
          <li key={e.id}>
            <Link
              href={post ? `#${post.id}` : `/kalender#dag-${e.date}`}
              className="group flex items-center gap-2.5 text-ink no-underline hover:text-ink"
            >
              <DateBadge date={e.date} size={44} today={today} />
              <span className="flex min-w-0 flex-col">
                <span className="text-[15px] font-bold group-hover:underline">{e.title}</span>
                <span className="text-[13px] text-muted">
                  {e.time} · {post ? <JoinCount post={post} me={me} /> : e.place}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="m-0 text-[13px] text-muted">
        Löprundor från flödet syns också i din{" "}
        <Link href="/kalender" className="font-semibold">
          kalender
        </Link>
        .
      </p>
    </section>
  );
}

function JoinCount({ post, me }: { post: FeedPost; me: string }) {
  const joiners = useRunJoiners(post, me);
  return <>{joiners.length ? `${joiners.length} hänger med` : "ingen anmäld än"}</>;
}

type Level = "direkt" | "veckobrev" | "av";
const levels: { value: Level; label: string }[] = [
  { value: "direkt", label: "Direkt" },
  { value: "veckobrev", label: "Veckobrev" },
  { value: "av", label: "Av" },
];

/** "Aviseringar från flödet" with inline settings (kept in this browser only). */
export function NotificationSettings({ me }: { me: string }) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useDemoState<{ mine: Level; other: Level }>(`flodet:aviseringar:${me}`, {
    mine: "direkt",
    other: "veckobrev",
  });

  return (
    <section
      className="card flex flex-col gap-2 p-[18px]"
      data-reveal="right"
      style={{ "--reveal-i": 1 } as CSSProperties}
    >
      <h2 className="m-0 text-[17px] font-extrabold">Aviseringar från flödet</h2>
      <p className="m-0 text-[14px] text-muted" aria-live="polite">
        Svar på dina inlägg och när någon nämner dig: {prefs.mine}. Allt annat: {prefs.other}
        {prefs.other === "veckobrev" ? ", eller av" : ""}.
      </p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${uid}-panel`}
        onClick={() => setOpen((o) => !o)}
        className="self-start text-[14px] font-bold text-orange-dark underline underline-offset-[3px] hover:text-orange-deep"
      >
        {open ? "Klar" : "Ändra inställningar"}
      </button>
      {open && (
        <div id={`${uid}-panel`} className="slide-in flex flex-col gap-3 pt-1">
          <Choice
            legend="Svar och omnämnanden"
            value={prefs.mine}
            onChange={(mine) => setPrefs((p) => ({ ...p, mine }))}
          />
          <Choice legend="Allt annat" value={prefs.other} onChange={(other) => setPrefs((p) => ({ ...p, other }))} />
          <p className="m-0 text-[12px] text-muted">Demo: sparas bara i den här webbläsaren.</p>
        </div>
      )}
    </section>
  );
}

function Choice({ legend, value, onChange }: { legend: string; value: Level; onChange: (l: Level) => void }) {
  const name = useId();
  return (
    <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
      <legend className="mb-1.5 p-0 text-[13px] font-bold">{legend}</legend>
      <div className="flex rounded-lg bg-paper p-1">
        {levels.map((l) => (
          <label
            key={l.value}
            className={`relative flex min-h-9 flex-1 cursor-pointer items-center justify-center rounded-md text-[13px] font-semibold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-orange ${
              value === l.value ? "bg-ink text-white" : "text-ink hover:bg-white"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={l.value}
              checked={value === l.value}
              onChange={() => onChange(l.value)}
              className="sr-only"
            />
            {l.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
