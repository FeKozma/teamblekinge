import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MainNav } from "@/components/MainNav";
import { NotificationBell } from "@/components/NotificationBell";
import { IconUser } from "@/components/icons";
import { Avatar } from "@/components/ui";
import type { DemoUser } from "@/lib/data/users";
import { guestNav, memberNav } from "@/lib/nav";

export function SiteHeader({ user }: { user: DemoUser | null }) {
  return (
    <header className="relative z-40 bg-ink text-white" style={{ viewTransitionName: "site-header" }}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-orange focus:px-3 focus:py-2 focus:text-ink"
      >
        Hoppa till innehållet
      </a>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-2.5 md:px-6 md:py-3">
        <Link href="/" aria-label="Team Blekinge Löparförening – till startsidan" className="logo-link block min-w-0">
          <Logo className="[--s:0.165] sm:[--s:0.22] md:[--s:0.3]" />
        </Link>
        {user ? (
          <div className="flex items-center gap-1 md:gap-3">
            {user.role === "board" && (
              <Link
                href="/admin/dokument"
                className="hidden rounded-lg px-3 py-2 text-[14px] font-semibold text-orange no-underline hover:bg-ink-2 md:inline-flex"
              >
                Administration
              </Link>
            )}
            <NotificationBell />
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 font-semibold text-white no-underline hover:bg-ink-2 md:px-2"
            >
              <Avatar person={user.id} size={36} />
              <span className="hidden md:inline">Min sida</span>
            </Link>
          </div>
        ) : (
          <Link
            href="/logga-in"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border-[1.5px] border-orange px-3 text-[15px] font-semibold text-white no-underline transition-colors hover:bg-orange hover:text-ink md:px-[18px]"
          >
            <IconUser size={18} className="text-orange [a:hover>&]:text-ink" />
            <span className="sr-only sm:not-sr-only">Logga in</span>
          </Link>
        )}
      </div>
      <MainNav items={user ? memberNav : guestNav} />
    </header>
  );
}
