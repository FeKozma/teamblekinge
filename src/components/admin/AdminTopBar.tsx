import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/(site)/logga-in/actions";
import { IconLogout } from "@/components/icons";
import type { DemoUser } from "@/lib/data/users";

/** Dark admin bar from drawup 09: emblem, club name | Administration — site link, user, log out. */
export function AdminTopBar({ user }: { user: DemoUser }) {
  return (
    <header className="relative bg-ink text-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-orange focus:px-3 focus:py-2 focus:text-ink"
      >
        Hoppa till innehållet
      </a>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-2.5 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin/dokument"
            className="group flex items-center gap-3 text-white no-underline hover:text-white"
            aria-label="Team Blekinge LF – administrationens startsida"
          >
            <Image
              src="/img/logo-emblem.png"
              alt=""
              width={37}
              height={40}
              priority
              className="h-10 w-auto transition-transform duration-500 group-hover:-rotate-6"
            />
            <span className="hidden text-[17px] font-extrabold whitespace-nowrap sm:inline">Team Blekinge LF</span>
          </Link>
          <span className="border-l border-ink-2 pl-3 text-[13px] whitespace-nowrap text-[#cfc8c4]">
            Administration
          </span>
        </div>
        <div className="flex items-center gap-1 text-[14px] sm:gap-4">
          <Link href="/" className="px-1 font-semibold whitespace-nowrap text-orange hover:text-orange">
            Visa webbplatsen
          </Link>
          <span className="hidden whitespace-nowrap text-mist md:inline">
            {user.name}
            {user.role === "board" && ", styrelsen"}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-mist transition-colors hover:bg-ink-2 hover:text-white"
            >
              <IconLogout size={18} />
              <span className="sr-only lg:not-sr-only">Logga ut</span>
            </button>
          </form>
        </div>
      </div>
      {/* A short skewed orange stripe along the bottom edge — the brand's speed line. */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-4 h-[3px] w-24 -skew-x-[28deg] bg-orange md:left-6 md:w-40"
      />
    </header>
  );
}
