"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { loginAs, logout } from "@/app/(site)/logga-in/actions";
import { IconChevronDown, IconKey, IconLogout, IconSettings } from "@/components/icons";
import { useProfile } from "@/components/member/prefs";
import { Avatar } from "@/components/ui";

type MenuUser = { id: string; name: string; email: string; role: "member" | "board" };

/**
 * The avatar in the header opens this: who you are, Inställningar,
 * Administration for the board, Logga ut. (The logo already leads home.)
 */
export function UserMenu({ user }: { user: MenuUser }) {
  const [open, setOpen] = useState(false);
  const [profile] = useProfile(user.id, { email: user.email, phone: "" });
  const ref = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item =
    "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-[15px] font-semibold text-ink no-underline transition-[background-color,padding] duration-300 hover:bg-paper hover:pl-4 hover:text-ink";

  return (
    <div ref={ref} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="user-menu"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 font-semibold text-white transition-colors hover:bg-ink-2 md:px-2"
      >
        <Avatar person={user.id} size={36} />
        <span className="sr-only">Konto och inställningar för {user.name}</span>
        <IconChevronDown
          size={16}
          className={`hidden text-mist transition-transform duration-300 sm:block ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          id="user-menu"
          className="menu-pop absolute top-full right-0 z-50 mt-2 w-[min(290px,calc(100vw-24px))] origin-top-right overflow-hidden rounded-xl border border-line bg-white text-ink shadow-2xl"
        >
          <div className="relative flex items-center gap-3 overflow-hidden border-b border-line bg-ink px-4 py-3.5 text-white">
            <span
              aria-hidden="true"
              className="absolute -top-2 -right-4 h-16 w-20 bg-orange/90"
              style={{ clipPath: "polygon(40% 0, 100% 0, 60% 100%, 0 100%)" }}
            />
            <Avatar person={user.id} size={40} className="relative ring-2 ring-white/20" />
            <span className="relative flex min-w-0 flex-col">
              <span className="truncate font-extrabold">{user.name}</span>
              <span className="truncate text-[13px] text-mist">{profile.email || user.email}</span>
            </span>
          </div>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-2">
            <li>
              <Link href="/installningar" className={item}>
                <IconSettings size={19} className="text-orange-dark" /> Inställningar
              </Link>
            </li>
            {user.role === "board" ? (
              <li>
                <Link href="/admin" className={item}>
                  <IconKey size={19} className="text-orange-dark" /> Administration
                </Link>
              </li>
            ) : (
              // DEMO: the admin is for board members; let a visitor switch to one.
              <li>
                <form action={loginAs}>
                  <input type="hidden" name="user" value="stina" />
                  <input type="hidden" name="next" value="/admin" />
                  <button type="submit" className={`${item} flex-wrap`}>
                    <IconKey size={19} className="text-purple" />
                    <span className="flex flex-col leading-tight">
                      Byt till styrelsen
                      <span className="text-[12px] font-normal text-muted">Demo: se administrationen som Stina</span>
                    </span>
                  </button>
                </form>
              </li>
            )}
            <li className="mt-1 border-t border-line pt-1">
              <form action={logout}>
                <button type="submit" className={item}>
                  <IconLogout size={19} className="text-muted" /> Logga ut
                </button>
              </form>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
