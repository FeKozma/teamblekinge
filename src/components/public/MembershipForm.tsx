"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconCheck } from "@/components/icons";
import { DemoNote } from "./DemoNote";

const groupIds = ["langa", "korta", "halsa", "torsdag", "vet-ej"] as const;

/** The form's texts, edited by the board under Sidtexter › Bli medlem. */
export type MembershipFormTexts = {
  name: string;
  email: string;
  emailExample: string;
  phone: string;
  optional: string;
  groupQuestion: string;
  groups: Record<(typeof groupIds)[number], { label: string; hint: string }>;
  submit: string;
  thanks: string;
  thanksBeforeFee: string;
  thanksBeforeSwish: string;
  thanksBeforeBankgiro: string;
  /** Added for Torsdagsgruppen; "" to end the sentence there. */
  thanksThursday: string;
  planButton: string;
  again: string;
};

export const inputClass =
  "h-[52px] w-full rounded-xl border border-line bg-white px-4 text-[17px] font-normal outline-none transition-shadow focus:border-orange focus:ring-4 focus:ring-orange/25";

/**
 * DEMO of the membership application. Nothing is sent or stored: submitting
 * only swaps in a thank-you state. Deliberately no personnummer — the real
 * form decides what the club actually needs.
 */
export function MembershipForm({
  fee,
  swish,
  bankgiro,
  texts: tx,
}: {
  fee: number;
  swish: string;
  bankgiro: string;
  texts: MembershipFormTexts;
}) {
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
          {tx.thanks}
          {sent.firstName ? `, ${sent.firstName}` : ""}!
        </h3>
        <DemoNote>Det här är en demo – ingen ansökan har skickats och inget har sparats.</DemoNote>
        <p className="m-0 text-[16px]">
          {tx.thanksBeforeFee} {fee} kr {tx.thanksBeforeSwish} {swish} {tx.thanksBeforeBankgiro} {bankgiro}
          {sent.group === "torsdag" && tx.thanksThursday ? ` ${tx.thanksThursday}` : "."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/trana-med-oss#terminsplan" className="btn btn-primary">
            {tx.planButton}
          </Link>
          <button type="button" onClick={() => setSent(null)} className="btn btn-outline">
            {tx.again}
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
        setSent({ firstName: name.split(/\s+/)[0] ?? "", group: String(data.get("group") ?? "") });
      }}
    >
      <DemoNote>Inget skickas – formuläret visar bara hur ansökan kommer att fungera.</DemoNote>
      <label className="flex flex-col gap-2 font-semibold">
        {tx.name}
        <input name="name" required autoComplete="name" className={inputClass} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 font-semibold">
          {tx.email}
          <input name="email" type="email" required autoComplete="email" placeholder={tx.emailExample} className={inputClass} />
        </label>
        <label className="flex flex-col gap-2 font-semibold">
          <span>
            {tx.phone} <span className="font-normal text-muted">{tx.optional}</span>
          </span>
          <input name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </label>
      </div>
      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-2 p-0 font-semibold">{tx.groupQuestion}</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {groupIds.map((id, i) => (
            <label
              key={id}
              className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-2.5 transition-[border-color,background-color,rotate] duration-300 has-[:checked]:border-orange has-[:checked]:bg-orange-soft has-[:checked]:[rotate:-1deg] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-orange/40"
            >
              <input
                type="radio"
                name="group"
                value={id}
                defaultChecked={i === groupIds.length - 1}
                className="h-5 w-5 flex-none accent-orange-dark"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-bold">{tx.groups[id].label}</span>
                <span className="text-[13px] text-muted">{tx.groups[id].hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="btn btn-primary btn-lg self-start">
        {tx.submit}
      </button>
    </form>
  );
}
