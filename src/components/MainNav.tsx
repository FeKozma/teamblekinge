"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronDown } from "@/components/icons";
import { isActive, type NavItem } from "@/lib/nav";

/**
 * Desktop main menu. The orange underline under the current page carries a
 * view-transition-name, so on navigation it slides over to the new tab.
 */
export function MainNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Huvudmeny" className="hidden border-t border-ink-2 md:block">
      <ul className="mx-auto flex max-w-[1200px] flex-wrap gap-1 px-4">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="group relative">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative inline-flex items-center gap-1 px-3 pt-3.5 pb-3 text-[15px] no-underline transition-colors ${
                  active ? "font-semibold text-white" : "font-medium text-mist hover:text-white"
                }`}
              >
                {item.label}
                {item.children && (
                  <IconChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
                )}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0 h-[3px] bg-orange"
                    style={{ viewTransitionName: "nav-indicator" }}
                  />
                )}
                {!active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0 h-[3px] origin-left scale-x-0 -skew-x-[28deg] bg-orange/60 transition-transform duration-300 group-hover:scale-x-100"
                  />
                )}
              </Link>
              {item.children && (
                <ul className="invisible absolute top-full left-0 z-50 min-w-[240px] -translate-y-1 rounded-b-xl border border-t-0 border-ink-2 bg-ink py-2 opacity-0 shadow-xl transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {item.children.map((c) => (
                    <li key={c.href}>
                      <Link
                        href={c.href}
                        className="block px-4 py-2 text-[15px] text-mist no-underline transition-[padding,color] duration-200 hover:pl-6 hover:text-orange"
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
