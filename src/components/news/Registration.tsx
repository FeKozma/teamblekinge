"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { IconCheck, IconChevronDown, IconPlus, IconRunner } from "@/components/icons";
import type { Registration } from "@/lib/data/news";
import { useDemoState } from "@/lib/demo-store";
import { IconExternal, IconMinus } from "./icons";
import {
  legLabel,
  legOptions,
  signupCount,
  storeKeys,
  useSignup,
  type FunktionarSignup,
  type StafettSignup,
} from "./store";

// The sign-up box under a news item, one variant per `registration.kind`.
// DEMO: sign-ups are saved with useDemoState (this browser only) and add one to
// the counts; the real site stores them on the member.

type BoxProps = { slug: string; reg: Registration; today: string; followedByMe: boolean; me?: string };

export function RegistrationBox(props: BoxProps) {
  return (
    <section
      id="anmalan"
      aria-label="Anmälan"
      className="flex scroll-mt-24 flex-col gap-3 rounded-xl bg-paper p-4 md:p-5"
    >
      {props.reg.kind === "stafett" ? (
        <StafettBox {...props} />
      ) : props.reg.kind === "funktionar" ? (
        <FunktionarBox {...props} />
      ) : (
        <ExternBox {...props} />
      )}
    </section>
  );
}

function InfoGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-x-4 gap-y-2.5 text-[13px]">
      {items.map((it) => (
        <div key={it.label}>
          <dt className="text-muted">{it.label}</dt>
          <dd className="m-0 text-[15px] font-bold">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Deadline({ reg, today }: { reg: Registration; today: string }) {
  if (reg.deadline !== today) return <>{reg.deadlineLabel}</>;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {reg.deadlineLabel}
      <span className="live-dot rounded-full bg-orange px-1.5 text-[11px] font-extrabold text-ink uppercase">i dag</span>
    </span>
  );
}

/** Sign-up progress with a little runner on the leading edge. */
function SignupBar({ count, capacity }: { count: number; capacity: number }) {
  const pct = Math.min(100, Math.round((count / capacity) * 100));
  return (
    <div aria-hidden="true" className="relative my-1.5 h-2 rounded bg-line">
      <div className="nw-bar-fill stripes-drift h-full rounded bg-orange" style={{ width: `${pct}%` }} />
      <span
        className="nw-bar-runner absolute top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-orange shadow-[0_2px_6px_rgb(34_30_31/0.3)]"
        style={{ left: `${pct}%` }}
      >
        <IconRunner size={15} strokeWidth={2.4} />
      </span>
    </div>
  );
}

function Closed({ reg }: { reg: Registration }) {
  return <p className="m-0 rounded-lg bg-white px-4 py-3 text-center font-bold">Anmälan stängde {reg.deadlineLabel}.</p>;
}

function Done({
  title,
  children,
  actions,
  focus,
}: {
  title: string;
  children: ReactNode;
  actions: ReactNode;
  /** Take focus on mount — after a sign-up the form it replaces is gone. */
  focus: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focus) ref.current?.focus();
  }, [focus]);
  return (
    <div
      ref={ref}
      tabIndex={-1}
      className="nw-unfold flex flex-col gap-3 rounded-xl border-2 border-orange bg-white p-4 outline-none"
    >
      <div className="flex items-start gap-3">
        <span className="nw-pop flex h-10 w-10 flex-none items-center justify-center rounded-full bg-orange text-ink">
          <IconCheck size={22} strokeWidth={3} />
        </span>
        <div className="flex min-w-0 flex-col">
          <p className="m-0 text-[17px] font-extrabold">{title}</p>
          <div className="text-[14px] text-muted">{children}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
  );
}

const chip =
  "inline-flex min-h-10 cursor-pointer items-center rounded-full border-[1.5px] border-[#cfc8c4] bg-white px-3.5 text-[14px] font-semibold transition-colors has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange";
const input = "w-full rounded-[10px] border-[1.5px] border-[#cfc8c4] bg-white px-3 py-2.5 text-[15px] text-ink";

function StafettBox({ slug, reg, today, followedByMe, me }: BoxProps) {
  const [signup, setSignup] = useSignup<StafettSignup>(slug, me);
  const [, setFollowing] = useDemoState<boolean>(storeKeys.follow(slug, me ?? "guest"), followedByMe);
  const [open, setOpen] = useState(false);
  const [leg, setLeg] = useState("valfri");
  const [pace, setPace] = useState("");
  const [seats, setSeats] = useState(0);
  const [status, setStatus] = useState("");
  const formId = useId();
  const firstField = useRef<HTMLInputElement>(null);
  const mainButton = useRef<HTMLButtonElement>(null);

  const count = signupCount(reg, !!signup);
  const capacity = reg.capacity ?? count;
  const closed = today > reg.deadline;

  useEffect(() => {
    if (open) firstField.current?.focus();
  }, [open]);

  const startForm = (from: StafettSignup | null) => {
    setLeg(from?.leg ?? "valfri");
    setPace(from?.pace ?? "");
    setSeats(from?.seats ?? 0);
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignup({ leg, pace: pace.trim(), seats });
    // Signing up follows the thread, so the team announcement reaches you.
    setFollowing(true);
    setOpen(false);
    setStatus(signup ? "Anmälan är ändrad." : "Du är anmäld till stafetten.");
  };

  const undo = () => {
    setSignup(null);
    setStatus("Anmälan är ångrad.");
    requestAnimationFrame(() => mainButton.current?.focus());
  };

  return (
    <>
      <InfoGrid
        items={[
          { label: "Datum", value: reg.dateLabel },
          { label: "Sista anmälan", value: <Deadline reg={reg} today={today} /> },
          ...(reg.extra ?? []),
          { label: "Anmälda", value: `${count} av ${capacity}` },
        ]}
      />
      <SignupBar count={count} capacity={capacity} />

      {closed ? (
        <Closed reg={reg} />
      ) : signup && !open ? (
        <Done
          title="Du är anmäld!"
          focus={!!status}
          actions={
            <>
              <button type="button" className="btn btn-outline" onClick={() => startForm(signup)}>
                Ändra anmälan
              </button>
              <button type="button" className="btn btn-outline" onClick={undo}>
                Ångra anmälan
              </button>
            </>
          }
        >
          <p className="m-0">
            {legLabel(signup.leg)} sträcka{signup.pace && ` · ${signup.pace} min/km`} ·{" "}
            {signup.seats ? `${signup.seats} ${signup.seats === 1 ? "plats" : "platser"} i bil` : "åker med någon"}
          </p>
          <p className="m-0 mt-1 text-ink">
            Lagen sätts efter {reg.deadlineLabel} – då får du besked om lag, sträcka, starttid och samlingsplats.
          </p>
        </Done>
      ) : (
        <>
          <button
            ref={mainButton}
            type="button"
            aria-expanded={open}
            aria-controls={formId}
            onClick={() => (open ? setOpen(false) : startForm(signup))}
            className="btn btn-dark btn-lg w-full font-extrabold"
          >
            {signup ? "Ändra anmälan" : reg.cta}
            <IconChevronDown
              size={20}
              className={`transition-transform duration-500 ease-sprint ${open ? "rotate-180" : ""}`}
            />
          </button>
          {open ? (
            <form
              id={formId}
              onSubmit={submit}
              className="nw-unfold flex flex-col gap-4 rounded-xl border border-line bg-white p-4"
            >
              <fieldset className="m-0 border-0 p-0">
                <legend className="mb-2 p-0 text-[14px] font-bold">Önskad sträcka</legend>
                <div className="flex flex-wrap gap-2">
                  {legOptions.map((o, i) => (
                    <label key={o.id} className={chip}>
                      <input
                        ref={i === 0 ? firstField : undefined}
                        type="radio"
                        name="leg"
                        value={o.id}
                        checked={leg === o.id}
                        onChange={() => setLeg(o.id)}
                        className="sr-only"
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] font-bold">
                  Ungefärlig fart <span className="font-normal text-muted">(min/km)</span>
                </span>
                <input
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                  inputMode="decimal"
                  placeholder="t.ex. 5:30"
                  pattern="\d{1,2}[:.,]\d{2}"
                  title="Minuter och sekunder per kilometer, t.ex. 5:30"
                  className={`${input} max-w-[160px]`}
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <span id={`${formId}-seats`} className="text-[14px] font-bold">
                  Platser i bil
                </span>
                <div className="flex items-center gap-3">
                  <div role="group" aria-labelledby={`${formId}-seats`} className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="En plats färre"
                      disabled={seats === 0}
                      onClick={() => setSeats((s) => Math.max(0, s - 1))}
                      className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#cfc8c4] bg-white disabled:opacity-40"
                    >
                      <IconMinus size={18} />
                    </button>
                    <output aria-live="polite" className="w-10 text-center text-[20px] font-extrabold">
                      {seats}
                    </output>
                    <button
                      type="button"
                      aria-label="En plats till"
                      disabled={seats === 8}
                      onClick={() => setSeats((s) => Math.min(8, s + 1))}
                      className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#cfc8c4] bg-white disabled:opacity-40"
                    >
                      <IconPlus size={18} />
                    </button>
                  </div>
                  <span className="text-[13px] text-muted">Lediga platser om du kör – 0 om du åker med någon.</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="submit" className="btn btn-primary flex-1 font-extrabold">
                  {signup ? "Spara ändringen" : "Skicka anmälan"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>
                  Avbryt
                </button>
              </div>
            </form>
          ) : (
            reg.hint && <p className="m-0 text-center text-[13px] text-muted">{reg.hint}</p>
          )}
        </>
      )}
      <p role="status" className="sr-only">
        {status}
      </p>
    </>
  );
}

function FunktionarBox({ slug, reg, today, followedByMe, me }: BoxProps) {
  const [signup, setSignup] = useSignup<FunktionarSignup>(slug, me);
  const [, setFollowing] = useDemoState<boolean>(storeKeys.follow(slug, me ?? "guest"), followedByMe);
  const [choosing, setChoosing] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const chooseButton = useRef<HTMLButtonElement>(null);

  const slots = (reg.slots ?? []).map((s) => {
    const taken = s.taken + (signup?.slot === s.id ? 1 : 0);
    return { ...s, taken, left: Math.max(0, s.capacity - taken) };
  });
  const count = signupCount(reg, !!signup);
  const capacity = reg.capacity ?? count;
  const closed = today > reg.deadline;
  const mine = slots.find((s) => s.id === signup?.slot);
  const selected = pick ?? signup?.slot ?? slots.find((s) => s.left > 0)?.id ?? "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const slot = slots.find((s) => s.id === selected);
    if (!slot) return;
    setSignup({ slot: slot.id });
    setFollowing(true);
    setChoosing(false);
    setPick(null);
    setStatus(`Du är anmäld som funktionär: ${slot.label}.`);
  };

  const undo = () => {
    setSignup(null);
    setStatus("Anmälan är ångrad.");
    requestAnimationFrame(() => chooseButton.current?.focus());
  };

  const showChoices = !closed && (!signup || choosing);

  return (
    <>
      <InfoGrid
        items={[
          { label: "Datum", value: reg.dateLabel },
          { label: "Sista anmälan", value: <Deadline reg={reg} today={today} /> },
          { label: "Pass kvar", value: `${Math.max(0, capacity - count)} av ${capacity}` },
        ]}
      />
      <SignupBar count={count} capacity={capacity} />

      {closed ? (
        <Closed reg={reg} />
      ) : signup && mine && !choosing ? (
        <Done
          title={`Du är anmäld som ${mine.label.toLowerCase()}`}
          focus={!!status}
          actions={
            <>
              <button type="button" className="btn btn-outline" onClick={() => setChoosing(true)}>
                Byt pass
              </button>
              <button type="button" className="btn btn-outline" onClick={undo}>
                Ångra anmälan
              </button>
            </>
          }
        >
          <p className="m-0">{reg.dateLabel} · Alla funktionärer bjuds på lunch efter loppet.</p>
        </Done>
      ) : null}

      {showChoices && (
        <form onSubmit={submit} className={`flex flex-col gap-3 ${choosing ? "nw-unfold" : ""}`}>
          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2 p-0 text-[14px] font-bold">{signup ? "Byt till ett annat pass" : "Välj pass"}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {slots.map((s) => {
                const full = s.left === 0 && s.id !== signup?.slot;
                return (
                  <label
                    key={s.id}
                    className={`flex items-start gap-3 rounded-xl border-[1.5px] bg-white p-3 transition-[border-color,translate] duration-300 ${
                      full
                        ? "cursor-not-allowed border-line opacity-60"
                        : "cursor-pointer border-line hover:-translate-y-0.5 has-[:checked]:border-ink"
                    }`}
                  >
                    <input
                      type="radio"
                      name="slot"
                      value={s.id}
                      disabled={full}
                      checked={selected === s.id}
                      onChange={() => setPick(s.id)}
                      className="mt-1 h-4 w-4 flex-none accent-[#a85400]"
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="font-bold">{s.label}</span>
                      <span className={`text-[13px] ${s.left <= 2 ? "font-bold text-orange-dark" : "text-muted"}`}>
                        {full ? "Fullt" : `${s.left} ${s.left === 1 ? "plats" : "platser"} kvar`}
                      </span>
                      <span aria-hidden="true" className="h-1.5 overflow-hidden rounded bg-line">
                        <span
                          className="nw-bar-fill block h-full rounded bg-orange"
                          style={{ width: `${Math.round((s.taken / s.capacity) * 100)}%` }}
                        />
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button ref={chooseButton} type="submit" className="btn btn-dark btn-lg flex-1 font-extrabold">
              {signup ? "Byt pass" : "Anmäl mig som funktionär"}
            </button>
            {choosing && (
              <button type="button" className="btn btn-outline btn-lg" onClick={() => setChoosing(false)}>
                Avbryt
              </button>
            )}
          </div>
        </form>
      )}
      <p role="status" className="sr-only">
        {status}
      </p>
    </>
  );
}

function ExternBox({ reg, today }: BoxProps) {
  const closed = today > reg.deadline;
  const host = reg.url ? new URL(reg.url).hostname.replace(/^www\./, "") : null;
  return (
    <>
      <InfoGrid
        items={[
          { label: "Datum", value: reg.dateLabel },
          { label: "Sista anmälan", value: <Deadline reg={reg} today={today} /> },
          ...(reg.extra ?? []),
        ]}
      />
      {closed ? (
        <Closed reg={reg} />
      ) : (
        reg.url && (
          <a
            href={reg.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group btn btn-dark btn-lg w-full font-extrabold"
          >
            {reg.cta} på {host}
            <IconExternal
              size={18}
              className="transition-transform duration-300 ease-sprint group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
            <span className="sr-only">(öppnas i en ny flik)</span>
          </a>
        )
      )}
      {reg.hint && <p className="m-0 text-center text-[13px] text-muted">{reg.hint}</p>}
    </>
  );
}
