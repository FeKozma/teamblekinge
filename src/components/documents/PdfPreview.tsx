import type { CSSProperties } from "react";
import Image from "next/image";
import type { DocKind } from "@/lib/data/documents";
import { kindLabels } from "@/lib/data/documents";
import "./documents.css";

// A fake first page of the PDF: the club letterhead, the title, and grey text
// lines under generic headings. The demo has no real files, so the content is
// deliberately abstract — no invented minutes.

const outlines: Record<DocKind, string[]> = {
  protokoll: [
    "§ 1 Mötets öppnande",
    "§ 2 Val av justerare",
    "§ 3 Föregående protokoll",
    "§ 4 Ekonomi",
    "§ 5 Aktuellt",
    "§ 6 Nästa möte",
  ],
  policy: ["Syfte", "Omfattning", "Så arbetar vi", "Ansvar"],
  stadgar: ["§ 1 Ändamål", "§ 2 Sammansättning", "§ 3 Tillhörighet", "§ 4 Beslutande organ"],
  instruktion: ["Samling", "Din uppgift", "Säkerhet", "Kontakt under loppet"],
  underlag: ["Sammanfattning", "Underlag", "Förslag"],
};

/** Deterministic "random" line widths, so server and client agree. */
function widths(seed: string, n: number) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return Array.from({ length: n }, (_, i) => {
    h = (h * 1103515245 + 12345 + i) >>> 0;
    return 58 + (h % 40);
  });
}

export function PdfPreview({
  title,
  kind,
  pages,
  blurred = false,
  className = "",
}: {
  title: string;
  kind: DocKind;
  pages: number;
  blurred?: boolean;
  className?: string;
}) {
  const sections = outlines[kind];
  const w = widths(title, sections.length * 3);
  return (
    <figure
      className={`pdf-stack relative m-0 w-full max-w-[440px] ${className}`}
      data-settle
      style={{ "--rest-rotate": "-1.5deg" } as CSSProperties}
    >
      <figcaption className="sr-only">
        Förhandsvisning av första sidan av {pages} (demo, inte det riktiga dokumentet)
      </figcaption>
      {pages > 1 && (
        <span
          aria-hidden="true"
          className="pdf-back absolute inset-0 translate-x-2 translate-y-1 rotate-[3.5deg] rounded-[3px] border border-line bg-[#fbfaf9] shadow-[0_10px_24px_-14px_rgba(34,30,31,0.35)]"
        />
      )}
      <div
        aria-hidden="true"
        className="relative flex aspect-[1/1.414] flex-col overflow-hidden rounded-[3px] border border-line bg-white px-[9%] pt-[8%] pb-[6%] shadow-[0_22px_44px_-16px_rgba(34,30,31,0.4)]"
      >
        <div className={`flex min-h-0 flex-1 flex-col ${blurred ? "blur-[3px] select-none" : ""}`}>
          <div className="flex items-center gap-2 border-b border-line pb-2.5">
            <Image src="/img/logo-emblem.png" alt="" width={26} height={28} className="h-7 w-auto" />
            <span className="text-[9px] leading-tight font-extrabold tracking-[1.2px] text-ink uppercase">
              Team Blekinge
              <br />
              <span className="text-orange-dark">Löparförening</span>
            </span>
            <span className="ml-auto text-[9px] text-muted">Sida 1 ({pages})</span>
          </div>

          <span className="mt-[7%] text-[10px] font-bold tracking-[1px] text-muted uppercase">{kindLabels[kind]}</span>
          <span className="mt-1 text-[clamp(15px,4.4vw,19px)] leading-tight font-extrabold tracking-[-0.3px] text-ink">
            {title}
          </span>
          <span className="mt-2 mb-[5%] block h-[5px] w-12 -skew-x-[28deg] bg-orange" />

          <div className="flex min-h-0 flex-1 flex-col gap-[3.5%] overflow-hidden">
            {sections.map((s, i) => (
              <div key={s} className="flex flex-col gap-[5px]">
                <span className="text-[10.5px] font-bold text-ink">{s}</span>
                {[0, 1, 2].slice(0, i % 2 ? 2 : 3).map((j) => (
                  <span
                    key={j}
                    className="block h-[5px] rounded-full bg-[#ebe7e3]"
                    style={{ width: `${w[i * 3 + j]}%` }}
                  />
                ))}
              </div>
            ))}
          </div>

          {kind === "protokoll" && (
            <div className="mt-[4%] grid grid-cols-2 gap-[8%] pt-1">
              {["Ordförande", "Justerare"].map((r) => (
                <span key={r} className="flex flex-col gap-1 text-[8.5px] text-muted">
                  <span className="block h-px bg-ink/40" />
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="pointer-events-none absolute right-0 bottom-0 left-0 h-1.5 bg-[repeating-linear-gradient(-62deg,#ee8915_0_6px,transparent_6px_12px)] opacity-70" />
      </div>
    </figure>
  );
}
