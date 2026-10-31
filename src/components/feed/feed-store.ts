"use client";

import { useSyncExternalStore } from "react";
import type { ClubEvent } from "@/lib/data/events";
import { feed, type FeedComment, type FeedPost } from "@/lib/data/feed";
import { people } from "@/lib/data/users";
import { useDemoState } from "@/lib/demo-store";

// Everything a member does in Klubbflödet — posts, "jag hänger med", likes,
// comments — lives in demo state (localStorage, see lib/demo-store.ts).
// Nothing reaches a server. Keys are per member so switching demo user
// doesn't hand Ingrid's likes to Stina. The calendar reads the same keys, so
// a löprunda posted here shows up there too.

/** A post written in the composer. `when` is derived from `createdAt`. */
export type MyPost = FeedPost & { createdAt: number };
export type MyComment = FeedComment & { createdAt?: number };

export function useMyPosts() {
  return useDemoState<MyPost[]>("flodet:posts", []);
}

export function useJoined(post: FeedPost, me: string) {
  return useDemoState<boolean>(`flodet:join:${post.id}:${me}`, post.run?.joiners.includes(me) ?? false);
}

export function useLiked(post: FeedPost, me: string) {
  return useDemoState<boolean>(`flodet:like:${post.id}:${me}`, post.likedByMe ?? false);
}

export function useMyComments(postId: string) {
  return useDemoState<MyComment[]>(`flodet:comments:${postId}`, []);
}

export function useCommentLiked(commentId: string, me: string) {
  return useDemoState<boolean>(`flodet:comment-like:${commentId}:${me}`, false);
}

/** Who's coming: the post's own list, with me added last (or first, on my own run). */
export function joinersWith(base: string[], me: string, joined: boolean) {
  const others = base.filter((p) => p !== me);
  if (!joined) return others;
  return base[0] === me ? [me, ...others] : [...others, me];
}

/** Live joiner list for a löprunda, for use outside the post card. */
export function useRunJoiners(post: FeedPost, me: string) {
  const [joined] = useJoined(post, me);
  return joinersWith(post.run?.joiners ?? [], me, joined);
}

export function basePost(id: string) {
  return feed.find((p) => p.id === id);
}

/** A löprunda from the feed as a calendar event. */
export function runEvent(post: FeedPost): ClubEvent | null {
  const run = post.run;
  if (!run?.time || !run.place) return null;
  return {
    id: post.id,
    date: run.date,
    time: run.time,
    title: `Löprunda med ${people[post.author]?.firstName ?? "en medlem"}`,
    place: run.place,
    kind: "lopprunda",
    membersOnly: true,
    href: `/flodet#${post.id}`,
    note: run.detail || undefined,
    source: "flode",
    post: post.id,
  };
}

export function nameOf(id: string) {
  return people[id]?.name ?? "Medlem";
}

/** "Sara, Lars och du" */
export function listNames(ids: string[], me: string) {
  const names = ids.map((id) => (id === me ? "du" : (people[id]?.firstName ?? "Medlem")));
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} och ${names.at(-1)}`;
}

// A coarse clock for "5 min sedan" labels: ticks every 30 s, and is 0 on the
// server / during hydration (which reads as "nyss").
const TICK = 30_000;
function subscribeClock(onTick: () => void) {
  const t = setInterval(onTick, TICK);
  return () => clearInterval(t);
}
const clock = () => Math.floor(Date.now() / TICK) * TICK;

export function useNow() {
  return useSyncExternalStore(subscribeClock, clock, () => 0);
}

export function timeAgo(createdAt: number, now: number) {
  const min = Math.floor((now - createdAt) / 60_000);
  if (!now || min < 1) return "nyss";
  if (min < 60) return `${min} min sedan`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} tim sedan`;
  const d = Math.floor(h / 24);
  return d === 1 ? "i går" : `${d} dagar sedan`;
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}
