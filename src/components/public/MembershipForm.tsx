"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconCheck } from "@/components/icons";
import { club } from "@/lib/data/club";
import { DemoNote } from "./DemoNote";

const groups = [
  { id: "langa", label: "Långa gruppen", hint: "Tisdagar 18:00, ca 10 km" },
  { id: "korta", label: "Korta gruppen", hint: "Tisdagar 18:00, ca 5 km" },
  { id: "halsa", label: "Hälsagruppen", hint: "Tisdagar 17:45, inga krav" },
  { id: "torsdag", label: "Torsdagsgruppen", hint: "Torsdagar 10:00, 60+ eller dagledig" },
  { id: "vet-ej", label: "Vet inte än", hint: "Vi hjälper dig att välja" },
];

export const inputClass =
  "h-[52px] w-full rounded-xl border border-line bg-white px-4 text-[17px] font-normal outline-none transition-shadow focus:border-orange focus:ring-4 focus:ring-orange/25";

/**
 * DEMO of the membership application. Nothing is sent or stored: submitting
 * only swaps in a thank-you state. Deliberately no personnummer — the real
 * form decides what the club actually needs.
 */
export function MembershipForm() {
  const [sent, setSent] = useState<{ firstName: string; group: string } | null>(null);
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
        <DemoNote>Det här är en demo – ingen ansökan har skickats och inget har sparats.</DemoNote>
        <p className="m-0 text-[16px]">
          På riktigt går ansökan till föreningen. När den är godkänd betalar du {club.fee} kr med Swish {club.swish}{" "}
          eller bankgiro {club.bankgiro}
          {sent.group === "Torsdagsgruppen" ? " – i Torsdagsgruppen ingår medlemskapet i årets avgift." : "."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/trana-med-oss#terminsplan" className="btn btn-primary">
            Se terminsplanen
          </Link>
          <button type="button" onClick={() => setSent(null)} className="btn btn-outline">
            Fyll i igen
          </button>
        </div>
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
        const group = groups.find((g) => g.id === data.get("group"))?.label ?? "";
        setSent({ firstName: name.split(/\s+/)[0] ?? "", group });
      }}
    >
      <DemoNote>Inget skickas – formuläret visar bara hur ansökan kommer att fungera.</DemoNote>
      <label className="flex flex-col gap-2 font-semibold">
        Namn
        <input name="name" required autoComplete="name" className={inputClass} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 font-semibold">
          E-post
          <input name="email" type="email" required autoComplete="email" placeholder="namn@exempel.se" className={inputClass} />
        </label>
        <label className="flex flex-col gap-2 font-semibold">
          <span>
            Telefon <span className="font-normal text-muted">(valfritt)</span>
          </span>
          <input name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </label>
      </div>
      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-2 p-0 font-semibold">Vilken grupp vill du träna i?</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {groups.map((g, i) => (
            <label
              key={g.id}
              className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-2.5 transition-[border-color,background-color,rotate] duration-300 has-[:checked]:border-orange has-[:checked]:bg-orange-soft has-[:checked]:[rotate:-1deg] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-orange/40"
            >
              <input
                type="radio"
                name="group"
                value={g.id}
                defaultChecked={i === groups.length - 1}
                className="h-5 w-5 flex-none accent-orange-dark"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-bold">{g.label}</span>
                <span className="text-[13px] text-muted">{g.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="btn btn-primary btn-lg self-start">
        Skicka ansökan
      </button>
    </form>
  );
}
