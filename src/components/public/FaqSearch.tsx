"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { IconChevronRight } from "@/components/icons";
import type { Faq } from "@/lib/data/club";
import { IconSearch } from "./icons";

const topics: { id: Faq["topic"]; label: string }[] = [
  { id: "medlem", label: "Medlemskap" },
  { id: "traning", label: "Träning" },
  { id: "lopp", label: "Våra lopp" },
];

/** Wrap every case-insensitive occurrence of `q` in <mark>. */
function highlight(text: string, q: string): ReactNode {
  if (!q) return text;
  const lower = text.toLowerCase();
  const out: ReactNode[] = [];
  let from = 0;
  for (let at = lower.indexOf(q); at !== -1; at = lower.indexOf(q, from)) {
    if (at > from) out.push(text.slice(from, at));
    out.push(
      <mark key={at} className="rounded-sm bg-orange/35 text-ink">
        {text.slice(at, at + q.length)}
      </mark>,
    );
    from = at + q.length;
  }
  out.push(text.slice(from));
  return out;
}

/**
 * All FAQs grouped by topic, with a search box and topic filter. While
 * searching, every matching answer is opened so the hit is visible.
 */
export function FaqSearch({ faqs }: { faqs: Faq[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<Faq["topic"] | "alla">("alla");
  const inputId = useId();
  const q = query.trim().toLowerCase();

  const matches = faqs.filter(
    (f) => (topic === "alla" || f.topic === topic) && (!q || `${f.q} ${f.a}`.toLowerCase().includes(q)),
  );
  const groups = topics.map((t) => ({ ...t, items: matches.filter((f) => f.topic === t.id) })).filter((g) => g.items.length);

  return (
    <div className="flex flex-wrap items-start gap-x-10 gap-y-6">
      <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-4 md:sticky md:top-4" data-reveal>
        <label htmlFor={inputId} className="text-[15px] font-bold">
          Sök bland frågorna
        </label>
        <div className="relative">
          <IconSearch size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="T.ex. parkering, avgift, medalj"
            autoComplete="off"
            className="h-[52px] w-full rounded-xl border border-line bg-white pr-4 pl-12 text-[17px] outline-none transition-shadow focus:border-orange focus:ring-4 focus:ring-orange/25"
          />
        </div>
        <div role="group" aria-label="Visa ämne" className="flex flex-wrap gap-2">
          {[{ id: "alla" as const, label: "Alla" }, ...topics].map((t, i) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={topic === t.id}
              onClick={() => setTopic(t.id)}
              style={{ "--r": i % 2 ? "1deg" : "-1deg" } as CSSProperties}
              className="min-h-10 rounded-full border border-line bg-white px-3.5 text-[14px] font-semibold text-ink transition-[background-color,color,rotate] duration-300 hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-white aria-pressed:[rotate:var(--r)]"
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="m-0 text-[14px] text-muted" aria-live="polite">
          {q || topic !== "alla" ? `${matches.length} av ${faqs.length} frågor` : `${faqs.length} frågor`}
        </p>
      </div>

      <div className="flex min-w-0 flex-[3_1_480px] flex-col gap-8">
        {groups.length === 0 && (
          <div className="card flex flex-col gap-2 p-5" data-reveal="up">
            <p className="m-0 text-[17px] font-bold">Ingen fråga matchar ”{query.trim()}”.</p>
            <p className="m-0 text-muted">
              Prova ett annat ord – eller <a href="#kontakt">hör av dig</a>, så svarar vi.
            </p>
          </div>
        )}
        {groups.map((g, gi) => (
          <section key={g.id} aria-labelledby={`faq-${g.id}`} className="flex flex-col gap-2.5">
            <h2 id={`faq-${g.id}`} className="m-0 mb-1 flex items-center gap-3 text-[22px] font-extrabold" data-reveal>
              <span aria-hidden="true" className={`skew-bar ${gi % 3 === 1 ? "bg-purple" : gi % 3 === 2 ? "bg-ink" : "bg-orange"}`} />
              {g.label}
              <span className="text-[15px] font-semibold text-muted">{g.items.length}</span>
            </h2>
            {g.items.map((f, i) => (
              <details
                // Remount when a search starts or ends so `open` follows it.
                key={`${f.q}-${q ? "hit" : "all"}`}
                open={!!q || (gi === 0 && i === 0)}
                className="faq card rounded-[10px] px-5 py-4"
                data-reveal="up"
                style={{ "--reveal-i": i } as CSSProperties}
              >
                <summary className="flex items-center gap-2 text-[17px] font-bold">
                  <IconChevronRight size={18} className="chev flex-none text-orange-dark" />
                  <span>{highlight(f.q, q)}</span>
                </summary>
                <p className={`m-0 pt-2.5 pl-[26px] text-muted ${f.a.startsWith("[") ? "italic" : ""}`}>
                  {highlight(f.a, q)}
                </p>
              </details>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
