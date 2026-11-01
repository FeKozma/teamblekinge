"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { resetDemoState } from "@/lib/demo-store";
import { adminGroups as groups, adminSections, type AdminSection } from "./sections";

function isCurrent(pathname: string, s: AdminSection) {
  const href = `/admin/${s.slug}`;
  return pathname === href || pathname.startsWith(href + "/");
}

function SoonTag({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`ml-auto flex-none rounded-full px-1.5 py-px text-[10px] font-bold tracking-[0.5px] uppercase ${
        dark ? "bg-ink-2 text-mist" : "bg-line text-muted"
      }`}
    >
      Snart
    </span>
  );
}

/**
 * Admin navigation. A sidebar from lg up (as drawn); on phones and tablets a
 * horizontal strip that scrolls, with the current section brought into view.
 */
export function AdminSidebar() {
  const pathname = usePathname();
  const strip = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const ul = strip.current;
    const active = ul?.querySelector<HTMLElement>("[aria-current=page]");
    if (!ul || !active) return;
    // Centre the current item without scrolling the page itself.
    ul.scrollLeft = active.offsetLeft - ul.clientWidth / 2 + active.offsetWidth / 2;
  }, [pathname]);

  return (
    <>
      <nav
        aria-label="Administration"
        className="sticky top-0 hidden w-[248px] flex-none flex-col gap-0.5 self-start px-3 py-5 lg:flex"
      >
        <Link
          href="/admin"
          aria-current={pathname === "/admin" ? "page" : undefined}
          className={`mb-3 flex min-h-10 items-center rounded-lg px-3 py-1.5 text-[15px] font-bold no-underline transition-[background-color,color,padding] duration-300 ${
            pathname === "/admin" ? "bg-ink text-white hover:text-white" : "text-ink hover:bg-white hover:pl-4 hover:text-ink"
          }`}
        >
          Översikt
        </Link>
        {groups.map((g, gi) => (
          <div key={g} className="flex flex-col gap-0.5">
            <span
              className={`px-3 pb-1.5 text-[12px] font-bold tracking-[1px] text-muted uppercase ${gi ? "pt-4" : ""}`}
            >
              {g}
            </span>
            {adminSections
              .filter((s) => s.group === g)
              .map((s) => {
                const active = isCurrent(pathname, s);
                return (
                  <Link
                    key={s.slug}
                    href={`/admin/${s.slug}`}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex min-h-10 items-center gap-2 rounded-lg px-3 py-1.5 text-[15px] leading-snug no-underline transition-[background-color,color,padding] duration-300 ${
                      active
                        ? "bg-ink pr-10 font-bold text-white hover:text-white"
                        : "text-ink hover:bg-white hover:pl-4 hover:text-ink"
                    }`}
                  >
                    {s.label}
                    {s.planned && !active && <SoonTag />}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute top-1/2 right-3.5 h-3 w-5 -translate-y-1/2 -skew-x-[28deg] bg-orange"
                        style={{ viewTransitionName: "admin-nav-indicator" }}
                      />
                    )}
                  </Link>
                );
              })}
          </div>
        ))}
        <button
          type="button"
          onClick={resetDemoState}
          className="mt-6 cursor-pointer self-start px-3 text-[13px] text-muted underline underline-offset-2 hover:text-ink"
        >
          Återställ demons klick
        </button>
        <span className="mt-1 px-3 text-[12px] leading-snug text-muted">
          Gilla, kommentarer och anmälningar sparas i din webbläsare. Innehållet du ändrar här syns för alla.
        </span>
      </nav>

      <nav aria-label="Administration" className="border-b border-line bg-white lg:hidden">
        <ul
          ref={strip}
          className="relative m-0 flex list-none items-center gap-1 overflow-x-auto px-3 py-2 [mask-image:linear-gradient(90deg,#000_88%,transparent)] [scrollbar-width:none] md:px-5"
        >
          <li className="flex-none">
            <Link
              href="/admin"
              aria-current={pathname === "/admin" ? "page" : undefined}
              className={`relative flex min-h-10 items-center rounded-full px-3.5 text-[14px] font-bold whitespace-nowrap no-underline ${
                pathname === "/admin" ? "bg-ink text-white hover:text-white" : "text-ink hover:bg-paper hover:text-ink"
              }`}
            >
              Översikt
            </Link>
          </li>
          {groups.map((g) => [
            <li key={g} className="flex-none px-2 text-[11px] font-bold tracking-[1px] text-muted uppercase">
              {g}
            </li>,
            ...adminSections
              .filter((s) => s.group === g)
              .map((s) => {
                const active = isCurrent(pathname, s);
                return (
                  <li key={s.slug} className="flex-none">
                    <Link
                      href={`/admin/${s.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-[14px] whitespace-nowrap no-underline ${
                        active ? "bg-ink font-bold text-white hover:text-white" : "text-ink hover:bg-paper hover:text-ink"
                      }`}
                    >
                      {s.label}
                      {s.planned && <SoonTag dark={active} />}
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute -bottom-0.5 left-1/2 h-[3px] w-6 -translate-x-1/2 -skew-x-[28deg] bg-orange"
                          style={{ viewTransitionName: "admin-strip-indicator" }}
                        />
                      )}
                    </Link>
                  </li>
                );
              }),
          ])}
          <li aria-hidden="true" className="w-6 flex-none" />
        </ul>
      </nav>
    </>
  );
}
