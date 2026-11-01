"use client";

import { useDeferredValue, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { fieldClass } from "@/components/admin/form";
import { IconEye, IconFile, IconLock, IconPencil, IconPin } from "@/components/icons";
import { IconSearch } from "@/components/public/icons";
import { DateBadge } from "@/components/ui";
import type { Registration } from "@/lib/data/news";
import { dayMonth, monthsLong } from "@/lib/format";

export type AdminNewsRow = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author?: string;
  membersOnly: boolean;
  /** Set only while the pin is in force. */
  pinnedUntil?: string;
  registration?: { kind: Registration["kind"]; deadline: string };
  protocol: boolean;
};

/** Every news item, newest first, grouped by month; filtered as you type. */
export function NewsTable({
  rows,
  today,
  categories,
}: {
  rows: AdminNewsRow[];
  today: string;
  categories: readonly string[];
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const query = useDeferredValue(q.trim().toLowerCase());

  const shown = rows.filter(
    (r) =>
      (!category || r.category === category) &&
      (!query || `${r.title} ${r.excerpt}`.toLowerCase().includes(query)),
  );
  const months: { key: string; label: string; rows: AdminNewsRow[] }[] = [];
  for (const r of shown) {
    const key = r.date.slice(0, 7);
    let m = months.at(-1);
    if (m?.key !== key) {
      const [y, mm] = key.split("-").map(Number);
      const name = monthsLong[mm - 1];
      m = { key, label: `${name.charAt(0).toUpperCase()}${name.slice(1)} ${y}`, rows: [] };
      months.push(m);
    }
    m.rows.push(r);
  }
  const filtered = !!(query || category);

  return (
    <div className="flex flex-col gap-5">
      <div role="search" className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-[2_1_260px] flex-col gap-1">
          <span className="text-[14px] font-semibold">Sök</span>
          <span className="relative">
            <IconSearch size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rubrik eller ingress"
              className={`${fieldClass} pl-9`}
            />
          </span>
        </label>
        <label className="flex min-w-0 flex-[1_1_200px] flex-col gap-1">
          <span className="text-[14px] font-semibold">Kategori</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${fieldClass} cursor-pointer`}>
            <option value="">Alla kategorier</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      <p role="status" className="m-0 -mt-2 text-[14px] text-muted">
        {filtered ? `${shown.length} av ${rows.length} nyheter` : `${rows.length} nyheter`}
      </p>

      {months.map((m, i) => (
        <section
          key={m.key}
          aria-labelledby={`m-${m.key}`}
          data-reveal="up"
          style={{ "--reveal-i": Math.min(i, 3) } as CSSProperties}
          className="flex flex-col gap-2"
        >
          <h2 id={`m-${m.key}`} className="m-0 text-[13px] font-bold tracking-[1px] text-muted uppercase">
            {m.label}
          </h2>
          <ul className="card m-0 list-none divide-y divide-line overflow-hidden p-0">
            {m.rows.map((r) => (
              <Row key={r.slug} r={r} today={today} />
            ))}
          </ul>
        </section>
      ))}

      {shown.length === 0 && (
        <div className="card flex flex-col items-start gap-3 p-6">
          <p className="m-0 text-[17px] font-bold">
            {rows.length ? "Ingen nyhet matchar sökningen." : "Inga nyheter ännu."}
          </p>
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setCategory("");
              }}
              className="btn btn-outline"
            >
              Visa alla nyheter
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-bold ${className}`}>
      {children}
    </span>
  );
}

const regLabel = { extern: "Anmälan", stafett: "Anmälan", funktionar: "Funktionärspass" } as const;

function Row({ r, today }: { r: AdminNewsRow; today: string }) {
  const edit = `/admin/nyheter/${r.slug}`;
  const reg = r.registration;
  return (
    <li className="group relative flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-paper/70 sm:gap-4 sm:px-5">
      <span className="transition-transform duration-300 ease-sprint group-hover:-rotate-3">
        <DateBadge date={r.date} today={today} highlight={!!r.pinnedUntil} size={46} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={edit}
          className="leading-snug font-bold text-ink no-underline after:absolute after:inset-0 hover:text-ink group-hover:underline"
        >
          {r.title}
        </Link>
        <span className="text-[13px] text-muted">
          <span className="font-semibold text-purple">{r.category}</span>
          {r.author && <> · {r.author}</>}
        </span>
        {(r.membersOnly || r.pinnedUntil || reg || r.protocol) && (
          <span className="flex flex-wrap gap-1.5">
            {r.membersOnly && (
              <Badge className="bg-purple-soft text-purple">
                <IconLock size={12} strokeWidth={2.4} /> Bara medlemmar
              </Badge>
            )}
            {r.pinnedUntil && (
              <Badge className="bg-orange text-ink">
                <IconPin size={12} strokeWidth={2.4} /> Fäst till {dayMonth(r.pinnedUntil)}
              </Badge>
            )}
            {reg && (
              <Badge className={reg.deadline >= today ? "bg-ink text-white" : "bg-line text-muted"}>
                {regLabel[reg.kind]} ·{" "}
                {reg.deadline >= today ? `sista ${dayMonth(reg.deadline)}` : "stängd"}
              </Badge>
            )}
            {r.protocol && (
              <Badge className="border border-line bg-paper text-ink">
                <IconFile size={12} strokeWidth={2.4} /> Protokoll
              </Badge>
            )}
          </span>
        )}
      </div>
      <div className="relative z-10 flex flex-none items-center gap-1">
        <Link
          href={edit}
          aria-label={`Ändra: ${r.title}`}
          className="btn btn-outline min-h-10 bg-white px-3 text-[14px]"
        >
          <IconPencil size={16} />
          <span className="hidden sm:inline">Ändra</span>
        </Link>
        <Link
          href={`/nyheter/${r.slug}`}
          target="_blank"
          aria-label={`Visa på webbplatsen: ${r.title} (öppnas i ny flik)`}
          title="Visa på webbplatsen"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-white hover:text-ink"
        >
          <IconEye size={18} />
        </Link>
      </div>
    </li>
  );
}
