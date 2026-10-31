import type { SVGProps } from "react";
import Link from "next/link";
import { IconLock } from "@/components/icons";
import { visibilityLabels, type Crumb, type Visibility } from "@/lib/data/documents";

// Small pieces shared by the public document pages and the admin.

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function LocalSvg({ size = 20, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconGlobe = (p: IconProps) => (
  <LocalSvg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
  </LocalSvg>
);
export const IconDownload = (p: IconProps) => (
  <LocalSvg {...p}>
    <path d="M12 4v12M7 11l5 5 5-5M4 20h16" />
  </LocalSvg>
);
export const IconShield = (p: IconProps) => (
  <LocalSvg {...p}>
    <path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </LocalSvg>
);

const badgeTone: Record<Visibility, string> = {
  alla: "border border-line bg-white text-ink",
  medlemmar: "bg-purple-soft text-purple",
  styrelsen: "bg-ink text-white",
};

/** "Medlemmar" with a lock, as next to the folder title in the admin drawup. */
export function VisibilityBadge({
  visibility,
  className = "",
}: {
  visibility: Visibility;
  className?: string;
}) {
  const Icon = visibility === "alla" ? IconGlobe : visibility === "styrelsen" ? IconShield : IconLock;
  return (
    <span
      className={`inline-flex flex-none items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] leading-none font-bold whitespace-nowrap ${badgeTone[visibility]} ${className}`}
    >
      <Icon size={14} strokeWidth={2.2} />
      <span>
        <span className="sr-only">Synlig för: </span>
        {visibilityLabels[visibility]}
      </span>
    </span>
  );
}

/** A little paper sheet with a folded corner and the file type ("PDF"). */
export function FileGlyph({ ext = "PDF", size = 44 }: { ext?: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="relative flex flex-none items-end justify-center overflow-hidden rounded-[4px] border border-[#cfc8c4] bg-white pb-1 font-extrabold text-orange-dark"
      style={{ width: Math.round(size * 0.82), height: size, fontSize: Math.max(8, Math.round(size / 5)) }}
    >
      <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-bl-[3px] border-b border-l border-[#cfc8c4] bg-paper" />
      {ext.toUpperCase().slice(0, 4)}
    </span>
  );
}

/** File extension from a name, for the glyph. */
export function extOf(fileName: string) {
  const m = /\.([a-z0-9]{2,4})$/i.exec(fileName);
  return m ? m[1] : "PDF";
}

export function Breadcrumbs({ crumbs, current }: { crumbs: Crumb[]; current?: string }) {
  return (
    <nav aria-label="Sökväg" className="text-[14px] text-muted">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0">
        {crumbs.map((c, i) => {
          const last = !current && i === crumbs.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">›</span>}
              {last ? (
                <span aria-current="page" className="font-semibold text-ink">
                  {c.title}
                </span>
              ) : (
                <Link href={c.href}>{c.title}</Link>
              )}
            </li>
          );
        })}
        {current && (
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true">›</span>
            <span aria-current="page" className="font-semibold text-ink">
              {current}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}
