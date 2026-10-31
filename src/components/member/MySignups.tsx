"use client";

import Link from "next/link";
import { IconChevronRight } from "@/components/icons";
import {
  legLabel,
  useSignup,
  type FunktionarSignup,
  type StafettSignup,
} from "@/components/news/store";
import { DateBadge } from "@/components/ui";
import type { Registration } from "@/lib/data/news";
import { dayMonth } from "@/lib/format";

// "Mina anmälningar": whatever the member signed up for in the news items
// (DEMO: read from the same demo store the sign-up boxes write to).

export type SignupSource = { slug: string; title: string; reg: Registration };

export function MySignups({ items, today, me }: { items: SignupSource[]; today: string; me: string }) {
  return (
    <div className="card px-4 py-1 md:px-5">
      {/* Rows render nothing when not signed up; the hint shows when the list is empty. */}
      <ul className="peer m-0 list-none divide-y divide-line p-0">
        {items.map((it) => (
          <SignupRow key={it.slug} item={it} today={today} me={me} />
        ))}
      </ul>
      <p className="m-0 hidden py-3 text-[14px] text-muted peer-empty:block">
        Inga anmälningar just nu. Stafetter och funktionärspass hittar du bland{" "}
        <Link href="/nyheter" className="font-semibold underline">
          nyheterna
        </Link>
        .
      </p>
    </div>
  );
}

function SignupRow({ item, today, me }: { item: SignupSource; today: string; me: string }) {
  const [signup] = useSignup<StafettSignup & FunktionarSignup>(item.slug, me);
  const { reg } = item;
  if (!signup || !reg.date) return null;
  const detail =
    reg.kind === "funktionar"
      ? (reg.slots?.find((s) => s.id === signup.slot)?.label ?? "Funktionär")
      : `${legLabel(signup.leg)} sträcka · lagen sätts efter ${dayMonth(reg.deadline)}`;
  return (
    <li className="nw-unfold">
      <Link
        href={`/nyheter/${item.slug}#anmalan`}
        className="group flex items-center gap-3 py-2.5 text-ink no-underline hover:text-ink"
      >
        <DateBadge date={reg.date} today={today} size={44} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-semibold group-hover:underline">{reg.signupTitle ?? item.title}</span>
          <span className="text-[13px] text-muted">
            {dayMonth(reg.date)} · {detail}
          </span>
        </span>
        <IconChevronRight
          size={18}
          className="flex-none text-muted transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>
    </li>
  );
}
