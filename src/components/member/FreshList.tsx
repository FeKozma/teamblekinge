"use client";

import Link from "next/link";
import { basePost, useRunJoiners } from "@/components/feed/feed-store";
import { SignupCount } from "@/components/news/LiveCounts";
import { storeKeys } from "@/components/news/store";
import type { Registration } from "@/lib/data/news";
import { useDemoState } from "@/lib/demo-store";

// "Nytt sedan sist": unread feed posts and news. Opening one marks it read
// (DEMO: in this browser), which also counts down the greeting line.

export type FreshItem = {
  id: string;
  href: string;
  kicker: string;
  title: string;
  meta: string;
  unread: boolean;
  /** Live sign-up count appended to the meta line. */
  count?: { slug: string; reg: Registration; format: "joined" | "left" };
  /** Löprunda in Klubbflödet: append "N hänger med", shared with /flodet. */
  runPostId?: string;
};

function useSeen(me: string) {
  return useDemoState<string[]>(storeKeys.homeSeen(me), []);
}

function Joiners({ postId, me }: { postId: string; me: string }) {
  const post = basePost(postId)!;
  const joiners = useRunJoiners(post, me);
  return <>{joiners.length} hänger med</>;
}

/** "3 nyheter och inlägg sedan ditt senaste besök" */
export function FreshCount({ ids, me }: { ids: string[]; me: string }) {
  const [seen] = useSeen(me);
  const n = ids.filter((id) => !seen.includes(id)).length;
  if (!n) return <>Du är ikapp – inget nytt sedan ditt senaste besök.</>;
  return (
    <>
      {n} {n === 1 ? "nyhet eller inlägg" : "nyheter och inlägg"} sedan ditt senaste besök
    </>
  );
}

export function FreshList({ items, me }: { items: FreshItem[]; me: string }) {
  const [seen, setSeen] = useSeen(me);
  return (
    <ul className="m-0 list-none overflow-hidden rounded-xl border border-line bg-white p-0" data-reveal>
      {items.map((it) => {
        const unread = it.unread && !seen.includes(it.id);
        return (
          <li key={it.id} className="border-b border-line last:border-0">
            <Link
              href={it.href}
              onClick={() => unread && setSeen((s) => [...s, it.id])}
              className="group flex gap-3 px-4 py-3.5 text-ink no-underline transition-colors hover:bg-paper hover:text-ink md:px-5"
            >
              {unread ? (
                <span role="img" aria-label="Oläst" className="live-dot mt-[7px] h-2.5 w-2.5 flex-none rounded-full bg-orange" />
              ) : (
                <span aria-hidden="true" className="mt-[7px] h-2.5 w-2.5 flex-none" />
              )}
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[12px] font-bold text-purple">{it.kicker}</span>
                <span className="text-[15px] leading-snug font-bold group-hover:underline">{it.title}</span>
                <span className="text-[13px] text-muted">
                  {it.meta}
                  {it.count && (
                    <>
                      {" "}
                      · <SignupCount {...it.count} me={me} />
                    </>
                  )}
                  {it.runPostId && (
                    <>
                      {" "}
                      · <Joiners postId={it.runPostId} me={me} />
                    </>
                  )}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
