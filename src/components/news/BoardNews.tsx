"use client";

import Image from "next/image";
import { useId, useRef, useState, type CSSProperties } from "react";
import { IconClose, IconLock, IconPlus } from "@/components/icons";
import { newsCategories } from "@/lib/data/news";
import { useDemoState } from "@/lib/demo-store";
import { commentTime, storeKeys } from "./store";

// "+ Nyhet" for board members. DEMO: the draft is kept in this browser and
// shown at the top of "Senaste"; the real site saves it, notifies followers of
// the category and gives it its own page.

type Draft = {
  id: string;
  title: string;
  category: string;
  text: string;
  membersOnly: boolean;
  at: number;
};

function useDrafts() {
  return useDemoState<Draft[]>(storeKeys.drafts, []);
}

export function NewNewsButton() {
  const ref = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [, setDrafts] = useDrafts();
  const titleId = useId();

  const close = () => {
    formRef.current?.reset();
    ref.current?.close();
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const draft: Draft = {
      id: `d-${Date.now()}`,
      title: String(data.get("title")).trim(),
      category: String(data.get("category")),
      text: String(data.get("text")).trim(),
      membersOnly: data.get("membersOnly") === "on",
      at: Date.now(),
    };
    setDrafts((prev) => [draft, ...prev]);
    close();
    document.getElementById("senaste")?.scrollIntoView({ block: "start" });
  };

  const field =
    "w-full rounded-[10px] border-[1.5px] border-[#cfc8c4] bg-white px-3 py-2.5 text-[15px] text-ink";

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="btn rounded-[10px] bg-orange font-extrabold text-ink hover:shadow-[0_8px_18px_-6px_rgb(238_137_21/0.7)]"
      >
        <IconPlus size={18} strokeWidth={2.4} />
        Nyhet
      </button>

      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClose={() => formRef.current?.reset()}
        className="nw-dialog m-auto max-h-[calc(100dvh-32px)] w-[min(600px,calc(100vw-24px))] overflow-hidden rounded-2xl border-0 bg-white p-0 text-ink shadow-2xl"
      >
        <form ref={formRef} onSubmit={onSubmit} className="flex max-h-[calc(100dvh-32px)] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 id={titleId} className="m-0 flex items-center gap-3 text-[20px] font-extrabold">
              <span aria-hidden="true" className="skew-bar bg-orange" />
              Ny nyhet
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Stäng"
              className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-paper"
            >
              <IconClose size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] font-bold">Rubrik</span>
              <input name="title" required maxLength={120} className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] font-bold">Kategori</span>
              <select name="category" className={field} defaultValue={newsCategories[0]}>
                {newsCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] font-bold">Text</span>
              <textarea name="text" required rows={5} className={`${field} resize-y`} />
            </label>
            <label className="flex items-center gap-2.5 text-[15px]">
              <input type="checkbox" name="membersOnly" defaultChecked className="h-5 w-5 accent-[#5b2a86]" />
              <span>
                <strong>Endast för medlemmar</strong>
                <span className="block text-[13px] text-muted">Syns bara för inloggade.</span>
              </span>
            </label>
            <p className="m-0 rounded-lg bg-purple-soft px-3 py-2 text-[13px] text-purple">
              Demo: nyheten sparas bara i den här webbläsaren. På riktigt publiceras den för alla och de som följer
              kategorin får en avisering.
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
            <button type="button" onClick={close} className="btn btn-outline">
              Avbryt
            </button>
            <button type="submit" className="btn btn-primary font-extrabold">
              Publicera
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

/** Drafts written with "+ Nyhet", on top of "Senaste". */
export function LocalNews({ members, category }: { members: boolean; category?: string }) {
  const [drafts, setDrafts] = useDrafts();
  const [removing, setRemoving] = useState<string | null>(null);
  const shown = drafts.filter((d) => (members || !d.membersOnly) && (!category || d.category === category));
  if (!shown.length) return null;
  return (
    <>
      {shown.map((d, i) => (
        <article
          key={d.id}
          data-reveal="up"
          style={{ "--reveal-i": i } as CSSProperties}
          className={`relative flex flex-wrap overflow-hidden rounded-xl border-2 border-dashed border-orange bg-white transition-[opacity,translate] duration-300 ${
            removing === d.id ? "translate-x-6 opacity-0" : ""
          }`}
        >
          <span className="relative min-h-[110px] flex-[1_1_180px] overflow-hidden sm:max-h-[180px] sm:min-h-[150px] sm:w-[180px]">
            <span className="diag-img absolute inset-0 flex items-center justify-center bg-ink">
              <Image src="/img/logo-emblem.png" alt="" width={84} height={91} />
            </span>
          </span>
          <div className="flex min-w-0 flex-[999_1_300px] flex-col gap-1.5 px-5 py-[18px]">
            <span className="text-[13px] text-muted">
              <span className="font-bold text-purple">{d.category}</span> · {commentTime(d.at)}
              {d.membersOnly && (
                <>
                  {" "}
                  ·{" "}
                  <span className="inline-flex items-center gap-1 align-[-2px] font-bold text-purple">
                    <IconLock size={13} strokeWidth={2.4} />
                    Medlemmar
                  </span>
                </>
              )}
            </span>
            <h3 className="m-0 text-[19px] leading-[1.25] font-extrabold">{d.title}</h3>
            <p className="m-0 line-clamp-3 text-[15px] whitespace-pre-line text-muted">{d.text}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[13px]">
              <span className="rounded-full bg-orange-soft px-2.5 py-0.5 font-bold text-orange-deep">
                Demo · bara i din webbläsare
              </span>
              <button
                type="button"
                onClick={() => {
                  setRemoving(d.id);
                  setTimeout(() => {
                    setDrafts((prev) => prev.filter((x) => x.id !== d.id));
                    setRemoving(null);
                  }, 280);
                }}
                className="min-h-8 font-bold text-muted underline hover:text-ink"
              >
                Ta bort<span className="sr-only"> {d.title}</span>
              </button>
            </div>
          </div>
        </article>
      ))}
    </>
  );
}
