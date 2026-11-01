"use client";

import { useId, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { toast } from "@/components/documents/Toaster";
import { IconBell, IconCheck, IconMail, IconPhone } from "@/components/icons";
import { newsCategories } from "@/lib/data/news";
import {
  emailTopics,
  newsFreqs,
  useEmailPrefs,
  useNotify,
  useProfile,
  type EmailPrefs,
  type NewsFreq,
} from "./prefs";

const field =
  "min-h-12 w-full rounded-lg border-[1.5px] border-[#cfc8c4] bg-white pr-3 pl-11 text-[16px] text-ink transition-colors hover:border-muted focus:border-ink aria-[invalid=true]:border-[#b3261e]";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isPhone = (s: string) => /^\+?[\d\s-]{7,}$/.test(s);

function Card({ title, icon, children, i }: { title: string; icon: ReactNode; children: ReactNode; i: number }) {
  return (
    <section className="card flex flex-col gap-5 p-5 md:p-7" data-reveal="up" style={{ "--reveal-i": i } as CSSProperties}>
      <h2 className="m-0 flex items-center gap-3 text-[21px] font-extrabold">
        <span className="flex h-10 w-10 flex-none -rotate-3 items-center justify-center rounded-lg bg-orange-soft text-orange-dark">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * /installningar: e-mail, phone and which e-mails the member wants. DEMO: kept
 * in this browser; the header menu and "Mina aviseringar" read the same values.
 */
export function SettingsForm({ user }: { user: { id: string; firstName: string; email: string } }) {
  const id = useId();
  const [profile, setProfile] = useProfile(user.id, { email: user.email, phone: "" });
  const [notify, setNotify] = useNotify(user.id);
  const [prefs, setPrefs] = useEmailPrefs(user.id);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const errs: typeof errors = {};
    if (!isEmail(email)) errs.email = "Skriv en e-postadress, t.ex. namn@exempel.se.";
    if (phone && !isPhone(phone)) errs.phone = "Skriv numret med siffror, t.ex. 070-123 45 67.";
    setErrors(errs);
    if (errs.email || errs.phone) {
      document.getElementById(`${id}-${errs.email ? "email" : "phone"}`)?.focus();
      return;
    }
    setProfile({ email, phone });
    setNotify({ freq: (data.get("freq") as NewsFreq) ?? "dag", cats: data.getAll("cat").map(String) });
    setPrefs(Object.fromEntries(emailTopics.map((t) => [t.id, data.get(t.id) === "on"])) as EmailPrefs);
    toast("Inställningarna är sparade.");
  }

  return (
    // Re-mount when the stored values arrive (after hydration) or change.
    <form
      key={JSON.stringify([profile, notify, prefs])}
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-6"
    >
      <Card title="Kontaktuppgifter" icon={<IconMail size={20} />} i={0}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-email`} className="font-bold">
              E-postadress
            </label>
            <div className="relative">
              <IconMail size={19} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
              <input
                id={`${id}-email`}
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={profile.email}
                aria-invalid={!!errors.email || undefined}
                aria-describedby={`${id}-email-hint${errors.email ? ` ${id}-email-err` : ""}`}
                className={field}
              />
            </div>
            {errors.email && (
              <span id={`${id}-email-err`} className="text-[14px] font-semibold text-[#b3261e]">
                {errors.email}
              </span>
            )}
            <span id={`${id}-email-hint`} className="text-[14px] text-muted">
              Hit skickar vi inloggningslänkar och mejl från föreningen.
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-phone`} className="font-bold">
              Mobilnummer <span className="font-normal text-muted">(valfritt)</span>
            </label>
            <div className="relative">
              <IconPhone size={19} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
              <input
                id={`${id}-phone`}
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                defaultValue={profile.phone}
                placeholder="070-123 45 67"
                aria-invalid={!!errors.phone || undefined}
                aria-describedby={`${id}-phone-hint${errors.phone ? ` ${id}-phone-err` : ""}`}
                className={field}
              />
            </div>
            {errors.phone && (
              <span id={`${id}-phone-err`} className="text-[14px] font-semibold text-[#b3261e]">
                {errors.phone}
              </span>
            )}
            <span id={`${id}-phone-hint`} className="text-[14px] text-muted">
              Om styrelsen eller en arrangör behöver nå dig, till exempel inför ett lopp.
            </span>
          </div>
        </div>
      </Card>

      <Card title="Nyheter per mejl" icon={<IconBell size={20} />} i={1}>
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-2 p-0 font-bold">Hur ofta?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {newsFreqs.map((f) => (
              <label
                key={f.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border-[1.5px] border-line p-3.5 transition-colors has-[:checked]:border-ink has-[:checked]:bg-paper"
              >
                <input
                  type="radio"
                  name="freq"
                  value={f.id}
                  defaultChecked={notify.freq === f.id}
                  className="mt-1 h-4 w-4 flex-none accent-[#a85400]"
                />
                <span className="flex flex-col leading-tight">
                  <span className="font-bold">{f.label}</span>
                  <span className="text-[14px] text-muted">{f.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="m-0 flex flex-col border-0 p-0">
          <legend className="mb-1 p-0 font-bold">Vilka nyheter?</legend>
          <p className="m-0 mb-3 text-[14px] text-muted">Fästa nyheter (”Viktigt nu”) får du alltid.</p>
          <div className="flex flex-wrap gap-2">
            {newsCategories.map((c) => (
              <label
                key={c}
                className="group inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-[#cfc8c4] bg-white px-4 text-[15px] font-semibold transition-colors has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange has-[:focus-visible]:outline-solid"
              >
                <input type="checkbox" name="cat" value={c} defaultChecked={notify.cats.includes(c)} className="sr-only" />
                <IconCheck size={14} strokeWidth={3} className="hidden text-orange group-has-[:checked]:block" />
                {c}
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card title="Andra mejl" icon={<IconMail size={20} />} i={2}>
        <ul className="m-0 flex list-none flex-col divide-y divide-line p-0">
          {emailTopics.map((t) => (
            <li key={t.id}>
              <label className="flex cursor-pointer items-center gap-4 py-3.5">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-bold">{t.label}</span>
                  <span className="text-[14px] text-muted">{t.hint}</span>
                </span>
                <input type="checkbox" name={t.id} defaultChecked={prefs[t.id]} className="peer sr-only" />
                <span
                  aria-hidden="true"
                  className="relative h-7 w-12 flex-none rounded-full bg-[#cfc8c4] transition-colors duration-300 peer-checked:bg-orange peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-orange peer-focus-visible:outline-solid after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] peer-checked:after:translate-x-5 peer-checked:after:-skew-x-[10deg]"
                />
              </label>
            </li>
          ))}
        </ul>
      </Card>

      <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+72px)] z-10 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-line bg-white/95 p-3 shadow-[0_10px_30px_-12px_rgba(34,30,31,0.35)] backdrop-blur md:bottom-4">
        <p className="m-0 mr-auto text-[13px] text-muted">Demo: sparas bara i den här webbläsaren – inga mejl skickas.</p>
        <button type="submit" className="btn btn-primary btn-lg font-extrabold">
          Spara inställningarna
        </button>
      </div>
    </form>
  );
}
