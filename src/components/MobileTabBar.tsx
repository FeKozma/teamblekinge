"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconCalendar,
  IconChevronRight,
  IconClose,
  IconHome,
  IconLogout,
  IconMenu,
  IconNews,
  IconPeople,
  IconUser,
} from "@/components/icons";
import { logout } from "@/app/(site)/logga-in/actions";
import { isActive, type NavItem } from "@/lib/nav";

type Props = {
  nav: NavItem[];
  user: { firstName: string; role: "member" | "board" } | null;
  feedBadge?: number;
};

/** Bottom tab bar on phones (Hem · Kalender · Flöde · Nyheter · Meny), as in the mobile drawups. */
export function MobileTabBar({ nav, user, feedBadge = 0 }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the menu sheet when navigation lands on a new page.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const tabs = [
    { href: "/", label: "Hem", Icon: IconHome },
    { href: "/kalender", label: "Kalender", Icon: IconCalendar },
    { href: user ? "/flodet" : "/logga-in?next=/flodet", label: "Flöde", Icon: IconPeople, badge: user ? feedBadge : 0 },
    { href: "/nyheter", label: "Nyheter", Icon: IconNews },
  ];

  return (
    <>
      <nav
        aria-label="Snabbmeny"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        style={{ viewTransitionName: "tab-bar" }}
      >
        <ul className="grid grid-cols-5">
          {tabs.map(({ href, label, Icon, badge }) => {
            const active = isActive(pathname, href.split("?")[0]);
            return (
              <li key={label}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[12px] font-semibold no-underline ${
                    active ? "text-orange-dark" : "text-ink"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute top-0 h-[3px] w-8 -skew-x-[28deg] bg-orange"
                      style={{ viewTransitionName: "tab-indicator" }}
                    />
                  )}
                  <span className="relative">
                    <Icon size={22} />
                    {!!badge && (
                      <span className="absolute -top-1.5 -right-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange px-1 text-[11px] font-extrabold text-ink">
                        {badge}
                      </span>
                    )}
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobilmeny"
              className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[12px] font-semibold text-ink"
            >
              <IconMenu size={22} />
              Meny
            </button>
          </li>
        </ul>
      </nav>

      {/* Menu sheet */}
      <div
        className={`fixed inset-0 z-[70] md:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-ink/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <div
          id="mobilmeny"
          role="dialog"
          aria-modal="true"
          aria-label="Meny"
          className={`absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-ink pb-[calc(env(safe-area-inset-bottom)+16px)] text-white transition-[translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="sticky top-0 flex items-center justify-between bg-ink px-5 pt-4 pb-3">
            <span className="flex items-center gap-3 text-[20px] font-extrabold">
              <span aria-hidden="true" className="skew-bar bg-orange" />
              Meny
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-ink-2"
              aria-label="Stäng menyn"
            >
              <IconClose size={20} />
            </button>
          </div>
          <ul className="px-3">
            {nav.map((item, i) => (
              <li
                key={item.href}
                className={`border-b border-ink-2 transition-[opacity,translate] duration-500 ${open ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"}`}
                style={{ transitionDelay: open ? `${80 + i * 35}ms` : "0ms" }}
              >
                <Link
                  href={item.href}
                  className="flex items-center justify-between px-2 py-3.5 text-[17px] font-bold text-white no-underline"
                >
                  {item.label}
                  <IconChevronRight size={18} className="text-orange" />
                </Link>
                {item.children && (
                  <ul className="flex flex-wrap gap-2 px-2 pb-3.5">
                    {item.children.slice(1).map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          className="inline-block rounded-full border border-ink-2 px-3 py-1.5 text-[14px] text-mist no-underline"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            {!user && (
              <li className="border-b border-ink-2">
                <Link href="/fragor" className="flex px-2 py-3.5 text-[17px] font-bold text-white no-underline">
                  Frågor & kontakt
                </Link>
              </li>
            )}
            {user && (
              <li className="border-b border-ink-2">
                <Link href="/installningar" className="flex px-2 py-3.5 text-[17px] font-bold text-white no-underline">
                  Inställningar
                </Link>
              </li>
            )}
            {user?.role === "board" && (
              <li className="border-b border-ink-2">
                <Link href="/admin" className="flex px-2 py-3.5 text-[17px] font-bold text-orange no-underline">
                  Administration
                </Link>
              </li>
            )}
          </ul>
          <div className="px-5 pt-5">
            {user ? (
              <form action={logout}>
                <button type="submit" className="btn btn-outline-light w-full">
                  <IconLogout size={18} /> Logga ut {user.firstName}
                </button>
              </form>
            ) : (
              <Link href="/logga-in" className="btn btn-primary btn-lg w-full">
                <IconUser size={18} /> Logga in
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
