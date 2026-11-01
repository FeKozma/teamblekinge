import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireBoard } from "@/components/admin/access";
import { ResetContentButton } from "@/components/admin/ResetContentButton";
import { adminGroups, adminSections } from "@/components/admin/sections";
import { IconCalendar, IconChevronRight, IconInfo, IconNews, IconPencil, IconUpload } from "@/components/icons";
import { Page } from "@/components/ui";

export const metadata: Metadata = { title: "Översikt" };

const quick = [
  { href: "/admin/nyheter/ny", label: "Skriv en nyhet", hint: "Till alla eller bara medlemmar", Icon: IconNews, tone: "bg-orange text-ink" },
  { href: "/admin/kalender/ny", label: "Lägg in i kalendern", hint: "Möte, lopp, resa eller träning", Icon: IconCalendar, tone: "bg-purple text-white" },
  { href: "/admin/dokument", label: "Ladda upp ett dokument", hint: "Protokoll, policy eller annan PDF", Icon: IconUpload, tone: "bg-ink text-white" },
  { href: "/admin/sidor", label: "Ändra en text på sidan", hint: "Rubriker och texter på fasta sidor", Icon: IconPencil, tone: "bg-orange text-ink" },
];

/** The admin's start page: the four everyday errands first, then everything else. */
export default async function AdminHome() {
  const user = await requireBoard();
  if (!user) return null;

  return (
    <Page className="min-w-0 flex-1 pb-12!">
      <div className="flex max-w-[960px] flex-col gap-8 px-4 pt-6 md:px-6 md:pt-8">
        <div className="flex flex-col gap-1.5" data-reveal>
          <h1 className="m-0 flex items-center gap-3.5 text-[28px] leading-tight font-extrabold tracking-[-0.5px] md:text-[32px]">
            <span aria-hidden="true" className="skew-bar bg-orange" />
            Hej {user.firstName}! Vad vill du göra?
          </h1>
          <p className="m-0 max-w-[640px] text-[16px] text-muted">
            Allt du ändrar här syns direkt på webbplatsen. Du behöver inte kunna något tekniskt – fyll i, tryck Spara.
          </p>
        </div>

        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
          {quick.map((q, i) => (
            <li key={q.href}>
              <Link
                href={q.href}
                data-settle
                style={{ "--rest-rotate": i % 2 ? "0.6deg" : "-0.6deg", "--reveal-i": i } as CSSProperties}
                className="straighten-hover card group flex items-center gap-4 p-5 text-ink no-underline shadow-[0_6px_14px_rgba(34,30,31,0.08)] hover:text-ink"
              >
                <span
                  className={`flex h-12 w-12 flex-none -rotate-3 items-center justify-center rounded-xl transition-transform duration-500 group-hover:rotate-0 ${q.tone}`}
                >
                  <q.Icon size={24} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[18px] leading-tight font-extrabold">{q.label}</span>
                  <span className="text-[14px] text-muted">{q.hint}</span>
                </span>
                <IconChevronRight
                  size={20}
                  className="flex-none text-orange-dark transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </li>
          ))}
        </ul>

        {adminGroups.map((g) => (
          <section key={g} className="flex flex-col gap-3" aria-labelledby={`g-${g}`}>
            <h2 id={`g-${g}`} className="m-0 text-[13px] font-bold tracking-[1px] text-muted uppercase">
              {g}
            </h2>
            <ul className="card m-0 list-none divide-y divide-line overflow-hidden p-0">
              {adminSections
                .filter((s) => s.group === g)
                .map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/admin/${s.slug}`}
                      className="group flex items-center gap-4 px-5 py-4 text-ink no-underline transition-colors hover:bg-paper/70 hover:text-ink"
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex items-center gap-2 font-bold">
                          {s.label}
                          {s.planned && (
                            <span className="rounded-full bg-line px-1.5 py-px text-[10px] font-bold tracking-[0.5px] text-muted uppercase">
                              Snart
                            </span>
                          )}
                        </span>
                        <span className="text-[14px] text-muted">{s.about}</span>
                      </span>
                      <IconChevronRight
                        size={18}
                        className="flex-none text-muted transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}

        <section className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-purple/40 bg-purple-soft p-4 md:p-5">
          <IconInfo size={22} className="flex-none text-purple" />
          <p className="m-0 min-w-[220px] flex-1 text-[14px]">
            <strong>Demo:</strong> ändringarna sparas på servern och syns för alla som tittar på demon. Har det blivit
            rörigt kan du återställa allt till hur det såg ut från början.
          </p>
          <ResetContentButton />
        </section>
      </div>
    </Page>
  );
}
