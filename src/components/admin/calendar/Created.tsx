import type { ReactNode } from "react";
import Link from "next/link";
import { IconCheck, IconEye, IconPlus } from "@/components/icons";

/** "Klart!" after something new is put in the calendar, with the way to see it there. */
export function Created({
  title,
  children,
  viewHref,
  againHref,
}: {
  title: string;
  /** When and where, in a sentence. */
  children: ReactNode;
  viewHref: string;
  againHref: string;
}) {
  return (
    <section
      data-reveal="up"
      role="status"
      className="relative overflow-hidden rounded-xl bg-ink px-5 py-5 text-white shadow-[0_18px_34px_-16px_rgba(34,30,31,0.6)] md:px-6"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <g stroke="#EE8915" strokeWidth="2" opacity="0.3">
          <path d="M260 160 L400 10" />
          <path d="M300 160 L400 55" />
          <path d="M340 160 L400 100" />
        </g>
      </svg>
      <div className="relative flex flex-col gap-3">
        <h2 className="m-0 flex items-center gap-3 text-[20px] font-extrabold">
          <span className="tilt-pop flex h-8 w-8 flex-none -skew-x-[12deg] items-center justify-center rounded-md bg-orange text-ink">
            <IconCheck size={18} strokeWidth={3} />
          </span>
          Klart! {title} ligger i kalendern.
        </h2>
        <p className="m-0 max-w-[620px] text-mist">{children}</p>
        <div className="flex flex-wrap gap-2">
          <Link href={viewHref} target="_blank" className="btn btn-primary">
            <IconEye size={18} /> Visa i kalendern
            <span className="sr-only">(öppnas i ny flik)</span>
          </Link>
          <Link href={againHref} className="btn btn-outline-light">
            <IconPlus size={18} /> Lägg in en till
          </Link>
          <Link href="/admin/kalender" className="btn btn-outline-light">
            Till kalenderlistan
          </Link>
        </div>
      </div>
    </section>
  );
}
