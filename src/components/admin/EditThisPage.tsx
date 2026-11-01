"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconPencil } from "@/components/icons";
import { adminHrefFor } from "@/lib/admin-links";

/**
 * For board members browsing the site: a button straight to where this page's
 * content is edited, so nobody has to hunt through the admin.
 */
export function EditThisPage() {
  const href = adminHrefFor(usePathname());
  if (!href) return null;
  return (
    <Link
      href={href}
      className="lean-hover fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] left-3 z-40 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink py-2 pr-4 pl-2.5 text-[14px] font-bold text-white no-underline shadow-[0_10px_24px_rgba(34,30,31,0.35)] [rotate:-2deg] hover:text-white md:bottom-5 md:left-5"
    >
      <span className="flex h-7 w-7 -skew-x-[12deg] items-center justify-center rounded-[6px] bg-orange text-ink">
        <IconPencil size={16} strokeWidth={2.4} />
      </span>
      Ändra den här sidan
    </Link>
  );
}
