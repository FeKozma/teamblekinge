"use client";

import Image from "next/image";
import { useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { IconClose, IconImage, IconList, IconRunner } from "@/components/icons";
import { Avatar } from "@/components/ui";
import type { FeedKind } from "@/lib/data/feed";
import { addDays, weekday } from "@/lib/format";
import type { MyPost } from "./feed-store";

type Mode = Exclude<FeedKind, "meddelande">;

const placeholders: Record<Mode, string> = {
  lopprunda: "Berätta om rundan – fart, distans, fika efteråt?",
  bild: "Skriv en rubrik till bilden",
  fraga: "Vad undrar du, eller vad vill du tipsa om?",
  "kop-salj": "Vad säljer eller söker du?",
};

const field =
  "min-h-11 w-full rounded-lg border-[1.5px] border-line bg-white px-3 text-[15px] text-ink transition-colors focus:border-ink";

/**
 * "Vad vill du dela med klubben?" — a one-line prompt that opens up into a
 * small form. The quick types (löprunda, bild, fråga) switch what the post
 * becomes; a löprunda gets its own fields and starts with you as first joiner.
 */
export function Composer({
  me,
  today,
  group,
  onPost,
}: {
  me: { id: string; firstName: string };
  today: string;
  /** Post into this group (when the feed is filtered to one). */
  group?: string;
  onPost: (post: MyPost) => void;
}) {
  const uid = useId();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [text, setText] = useState("");
  const [run, setRun] = useState({ date: addDays(today, 1), time: "09:00", place: "", detail: "" });
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const expanded = open || mode !== null || text !== "";
  const valid =
    mode === "lopprunda"
      ? !!(run.date && run.time && run.place.trim())
      : mode === "bild"
        ? !!image
        : text.trim() !== "";

  function pick(next: Mode) {
    const off = mode === next;
    setOpen(true);
    setMode(off ? null : next);
    if (!off && next === "bild" && !image) fileRef.current?.click();
    // Let the löprunda fields render first, then move focus to them.
    requestAnimationFrame(() =>
      (next === "lopprunda" ? document.getElementById(`${uid}-date`) : textRef.current)?.focus(),
    );
  }

  function reset() {
    setOpen(false);
    setMode(null);
    setText("");
    setImage(null);
    setRun({ date: addDays(today, 1), time: "09:00", place: "", detail: "" });
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      setImage(await shrink(file));
      setMode("bild");
    } catch {
      setImage(null);
    } finally {
      setBusy(false);
    }
  }

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!valid) return;
    const body = text.trim();
    const day = weekday(run.date);
    onPost({
      id: `my-${Date.now().toString(36)}`,
      author: me.id,
      group,
      when: "",
      createdAt: Date.now(),
      kind: mode ?? "meddelande",
      title: mode === "bild" ? body || undefined : undefined,
      text: mode === "bild" ? "" : body,
      image:
        mode === "bild" && image ? { src: image, alt: body || `Bild från ${me.firstName}` } : undefined,
      run:
        mode === "lopprunda"
          ? {
              date: run.date,
              time: run.time,
              place: run.place.trim(),
              headline: `${day.charAt(0).toUpperCase()}${day.slice(1)} ${run.time} · ${run.place.trim()}`,
              detail: run.detail.trim(),
              joiners: [me.id],
            }
          : undefined,
      likes: 0,
      comments: [],
    });
    reset();
  }

  return (
    <section id="nytt-inlagg" aria-label="Skapa inlägg" className="card scroll-mt-24 rounded-[14px] p-3 md:p-4">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="flex items-start gap-2.5 md:gap-3">
          <Avatar person={me.id} size={40} className="mt-[3px]" />
          <div className="relative min-w-0 flex-1">
            <label htmlFor={`${uid}-text`} className="sr-only">
              {mode ? placeholders[mode] : "Skriv ett inlägg"}
            </label>
            <textarea
              id={`${uid}-text`}
              ref={textRef}
              rows={expanded ? 3 : 1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
                if (e.key === "Escape" && !text) reset();
              }}
              className={`block w-full resize-none bg-paper px-4 py-[11px] text-[15px] leading-6 text-ink transition-[border-radius] duration-300 ${
                expanded ? "rounded-xl" : "rounded-[23px]"
              }`}
            />
            {!text && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-4 top-[11px] truncate text-[15px] leading-6 text-muted"
              >
                {mode ? (
                  placeholders[mode]
                ) : (
                  <>
                    Vad vill du dela<span className="hidden sm:inline"> med klubben, {me.firstName}</span>?
                  </>
                )}
              </span>
            )}
          </div>
          {!expanded && (
            <button
              type="button"
              onClick={() => pick("lopprunda")}
              aria-label="Ny löprunda"
              className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] bg-orange-soft text-orange-dark transition-transform hover:-translate-y-0.5 md:hidden"
              style={{ marginTop: 3 }}
            >
              <IconRunner size={20} />
            </button>
          )}
        </div>

        {mode === "lopprunda" && (
          <fieldset className="m-0 grid grid-cols-2 gap-x-3 gap-y-2.5 rounded-xl border-2 border-orange p-3 sm:grid-cols-[1.1fr_0.8fr_1.6fr]">
            <legend className="px-1.5 text-[13px] font-extrabold tracking-[0.5px] text-orange-dark uppercase">
              Löprundan
            </legend>
            <Field label="Dag" id={`${uid}-date`} i={0}>
              <input
                id={`${uid}-date`}
                type="date"
                required
                min={today}
                value={run.date}
                onChange={(e) => setRun((r) => ({ ...r, date: e.target.value }))}
                className={field}
              />
            </Field>
            <Field label="Tid" id={`${uid}-time`} i={1}>
              <input
                id={`${uid}-time`}
                type="time"
                required
                step={300}
                value={run.time}
                onChange={(e) => setRun((r) => ({ ...r, time: e.target.value }))}
                className={field}
              />
            </Field>
            <Field label="Plats" id={`${uid}-place`} i={2} className="col-span-2 sm:col-span-1">
              <input
                id={`${uid}-place`}
                type="text"
                required
                placeholder="t.ex. Klubblokalen"
                value={run.place}
                onChange={(e) => setRun((r) => ({ ...r, place: e.target.value }))}
                className={field}
              />
            </Field>
            <Field label="Beskrivning" id={`${uid}-detail`} i={3} className="col-span-2 sm:col-span-3">
              <input
                id={`${uid}-detail`}
                type="text"
                placeholder="Distans, fart, vägen – t.ex. 10 km, fart efter kamrat"
                value={run.detail}
                onChange={(e) => setRun((r) => ({ ...r, detail: e.target.value }))}
                className={field}
              />
            </Field>
            <p className="slide-in col-span-2 m-0 text-[13px] text-muted sm:col-span-3" style={{ "--i": 4 } as CSSProperties}>
              Du står först på listan. Rundan syns också i medlemmarnas kalender.
            </p>
          </fieldset>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            void onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {mode === "bild" && (
          <div className="slide-in flex flex-wrap items-center gap-3">
            {image ? (
              <div className="relative h-[180px] w-full overflow-hidden rounded-xl bg-paper sm:w-[320px]">
                <Image src={image} alt="Förhandsvisning av bilden" fill unoptimized className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  aria-label="Ta bort bilden"
                  className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-ink/80 text-white"
                >
                  <IconClose size={18} />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-outline" disabled={busy}>
                <IconImage size={18} />
                {busy ? "Läser in bilden…" : "Välj en bild"}
              </button>
            )}
          </div>
        )}

        <div
          className={`flex-wrap gap-2 border-t border-line pt-3 ${expanded ? "flex" : "hidden md:flex"}`}
          role="group"
          aria-label="Typ av inlägg"
        >
          <QuickType
            pressed={mode === "lopprunda"}
            onClick={() => pick("lopprunda")}
            icon={<IconRunner size={18} className="text-orange-dark" />}
            warm
          >
            Löprunda – hänger någon med?
          </QuickType>
          <QuickType pressed={mode === "bild"} onClick={() => pick("bild")} icon={<IconImage size={18} />}>
            Bild eller video
          </QuickType>
          <QuickType pressed={mode === "fraga"} onClick={() => pick("fraga")} icon={<IconList size={18} />}>
            Fråga eller tips
          </QuickType>
          {expanded && (
            <QuickType pressed={mode === "kop-salj"} onClick={() => pick("kop-salj")} icon={<span aria-hidden="true">kr</span>}>
              Köp &amp; sälj
            </QuickType>
          )}
        </div>

        {expanded && (
          <div className="slide-in flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-[13px] text-muted">
              {group ? (
                <>
                  Syns i <strong className="text-ink">{group}</strong>
                </>
              ) : (
                "Syns för alla medlemmar – inte utanför klubben."
              )}
            </p>
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={reset} className="btn btn-outline min-h-10 px-3.5 text-[14px]">
                Avbryt
              </button>
              <button
                type="submit"
                disabled={!valid}
                className="btn btn-primary min-h-10 px-5 text-[14px] disabled:pointer-events-none disabled:opacity-45"
              >
                {mode === "lopprunda" ? "Lägg upp rundan" : "Dela"}
              </button>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}

function QuickType({
  pressed,
  onClick,
  icon,
  warm = false,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  icon: ReactNode;
  warm?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-[10px] px-3.5 text-[14px] font-bold transition-[background-color,color,translate,box-shadow] duration-300 hover:-translate-y-0.5 ${
        pressed
          ? "bg-ink text-white shadow-[0_6px_14px_-6px_rgba(34,30,31,0.6)] [&_svg]:text-orange"
          : warm
            ? "bg-orange-soft text-ink"
            : "bg-paper text-ink"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Field({
  label,
  id,
  i,
  className = "",
  children,
}: {
  label: string;
  id: string;
  i: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`slide-in flex min-w-0 flex-col gap-1 ${className}`} style={{ "--i": i } as CSSProperties}>
      <label htmlFor={id} className="text-[13px] font-bold">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Downscale a chosen photo to a small JPEG data URL so it fits in localStorage. */
async function shrink(file: File, max = 1000) {
  const url = URL.createObjectURL(file);
  try {
    const img = new window.Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  } finally {
    URL.revokeObjectURL(url);
  }
}
