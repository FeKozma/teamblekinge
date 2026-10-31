"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck } from "@/components/icons";
import { club } from "@/lib/data/club";
import { DemoNote } from "./DemoNote";
import { inputClass } from "./MembershipForm";

const subjects = ["Medlemskap", "Träning", "Våra lopp", "Annat"];

/** DEMO contact form: submitting only shows a thank-you state, nothing is sent. */
export function ContactForm() {
  const [sent, setSent] = useState<{ firstName: string; subject: string } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (sent) headingRef.current?.focus();
  }, [sent]);

  if (sent) {
    return (
      <div className="flex flex-col gap-4" aria-live="polite">
        <span className="check-pop flex h-16 w-16 items-center justify-center rounded-2xl bg-orange text-ink">
          <IconCheck size={34} strokeWidth={3} />
        </span>
        <h3 ref={headingRef} tabIndex={-1} className="m-0 text-[24px] font-extrabold outline-none">
          Tack{sent.firstName ? `, ${sent.firstName}` : ""}!
        </h3>
        <DemoNote>Det här är en demo – meddelandet har inte skickats någonstans.</DemoNote>
        {sent.subject === "Våra lopp" && (
          <p className="m-0">
            Frågor om loppen går till <a href={`mailto:${club.contact.raceEmail}`}>{club.contact.raceEmail}</a>.
          </p>
        )}
        <button type="button" onClick={() => setSent(null)} className="btn btn-outline self-start">
          Skriv ett nytt meddelande
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const name = String(data.get("name") ?? "").trim();
        setSent({ firstName: name.split(/\s+/)[0] ?? "", subject: String(data.get("subject") ?? "") });
      }}
    >
      <DemoNote>Inget skickas – formuläret visar bara hur kontakten kommer att fungera.</DemoNote>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 font-semibold">
          Namn
          <input name="name" required autoComplete="name" className={inputClass} />
        </label>
        <label className="flex flex-col gap-2 font-semibold">
          E-post
          <input name="email" type="email" required autoComplete="email" placeholder="namn@exempel.se" className={inputClass} />
        </label>
      </div>
      <label className="flex flex-col gap-2 font-semibold">
        Vad gäller det?
        <select name="subject" defaultValue={subjects[0]} className={`${inputClass} appearance-auto`}>
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 font-semibold">
        Meddelande
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[17px] font-normal outline-none transition-shadow focus:border-orange focus:ring-4 focus:ring-orange/25"
        />
      </label>
      <button type="submit" className="btn btn-primary btn-lg self-start">
        Skicka meddelande
      </button>
    </form>
  );
}
