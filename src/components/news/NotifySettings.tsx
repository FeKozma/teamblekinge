"use client";

import { useId, useRef, useState } from "react";
import { IconBell, IconCheck, IconClose } from "@/components/icons";
import Link from "next/link";
import { newsFreqs as freqs, useNotify, type NewsFreq as Freq } from "@/components/member/prefs";
import { newsCategories } from "@/lib/data/news";

// "Mina aviseringar": how often news arrive by e-mail, per category. DEMO: saved
// in this browser only; the real site stores it on the member and sends mail.
// The same settings are on /installningar.

export function NotifySettingsButton({
  me,
  variant = "outline",
  label = "Mina aviseringar",
}: {
  me: string;
  variant?: "outline" | "primary";
  label?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [saved, setSaved] = useNotify(me);
  const [flash, setFlash] = useState(false);
  const titleId = useId();

  const close = () => {
    formRef.current?.reset();
    ref.current?.close();
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSaved({ freq: (data.get("freq") as Freq) ?? "dag", cats: data.getAll("cat").map(String) });
    ref.current?.close();
    setFlash(true);
    setTimeout(() => setFlash(false), 2400);
  };

  return (
    <>
      <span className="relative inline-flex">
        <button
          type="button"
          onClick={() => ref.current?.showModal()}
          className={
            variant === "primary"
              ? "btn btn-primary self-start font-extrabold"
              : "btn btn-outline rounded-[10px] border-[#cfc8c4]"
          }
        >
          {variant === "outline" && <IconBell size={18} />}
          {label}
        </button>
        <span
          role="status"
          className={`pointer-events-none absolute top-full left-0 z-10 mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-ink px-2.5 py-1 text-[13px] font-semibold whitespace-nowrap text-white transition-[opacity,translate] duration-300 ${
            flash ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
          }`}
        >
          {flash && (
            <>
              <IconCheck size={14} strokeWidth={3} className="text-orange" /> Sparat
            </>
          )}
        </span>
      </span>

      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClose={() => formRef.current?.reset()}
        className="nw-dialog m-auto max-h-[calc(100dvh-32px)] w-[min(520px,calc(100vw-24px))] overflow-hidden rounded-2xl border-0 bg-white p-0 text-ink shadow-2xl"
      >
        {/* Re-mount on save so the defaults follow the stored settings. */}
        <form ref={formRef} key={JSON.stringify(saved)} onSubmit={onSubmit} className="flex max-h-[calc(100dvh-32px)] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 id={titleId} className="m-0 flex items-center gap-3 text-[20px] font-extrabold">
              <span aria-hidden="true" className="skew-bar bg-orange" />
              Mina aviseringar
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

          <div className="flex flex-col gap-6 overflow-y-auto px-5 py-5">
            <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
              <legend className="mb-2 p-0 text-[15px] font-bold">Hur vill du få nyheter per mejl?</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {freqs.map((f) => (
                  <label
                    key={f.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border-[1.5px] border-line p-3 transition-colors has-[:checked]:border-ink has-[:checked]:bg-paper"
                  >
                    <input
                      type="radio"
                      name="freq"
                      value={f.id}
                      defaultChecked={saved.freq === f.id}
                      className="mt-1 h-4 w-4 flex-none accent-[#a85400]"
                    />
                    <span className="flex flex-col leading-tight">
                      <span className="font-bold">{f.label}</span>
                      <span className="text-[13px] text-muted">{f.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="m-0 flex flex-col border-0 p-0">
              <legend className="mb-1 p-0 text-[15px] font-bold">Kategorier</legend>
              <p className="m-0 mb-3 text-[13px] text-muted">Välj vilka nyheter du vill ha. Fästa nyheter får du alltid.</p>
              <div className="flex flex-wrap gap-2">
                {newsCategories.map((c) => (
                  <label
                    key={c}
                    className="group inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-[#cfc8c4] bg-white px-3.5 text-[14px] font-semibold transition-colors has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange has-[:focus-visible]:outline-solid"
                  >
                    <input
                      type="checkbox"
                      name="cat"
                      value={c}
                      defaultChecked={saved.cats.includes(c)}
                      className="sr-only"
                    />
                    <IconCheck size={14} strokeWidth={3} className="hidden text-orange group-has-[:checked]:block" />
                    {c}
                  </label>
                ))}
              </div>
            </fieldset>

            <p className="m-0 rounded-lg bg-purple-soft px-3 py-2 text-[13px] text-purple">
              Fler mejlinställningar, e-post och telefon finns under{" "}
              <Link href="/installningar" className="font-semibold text-purple">
                Inställningar
              </Link>
              . Demo: sparas bara i den här webbläsaren – inga mejl skickas.
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
            <button type="button" onClick={close} className="btn btn-outline">
              Avbryt
            </button>
            <button type="submit" className="btn btn-primary font-extrabold">
              Spara
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
