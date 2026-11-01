import { useDemoState } from "@/lib/demo-store";
import type { Registration } from "@/lib/data/news";

// Demo-store keys and hooks for the news pages and the member home, kept in one
// place so "Mina anmälningar" on the home page sees what the article saved.
// Client components only (they wrap useDemoState).

export type StafettSignup = { leg: string; pace: string; seats: number };
export type FunktionarSignup = { slot: string };
export type MyComment = { id: string; text: string; at: number; parentId?: string };

export const legOptions = [
  { id: "kort", label: "Kort" },
  { id: "mellan", label: "Mellan" },
  { id: "lang", label: "Lång" },
  { id: "valfri", label: "Spelar ingen roll" },
] as const;

export function legLabel(id: string) {
  return legOptions.find((l) => l.id === id)?.label ?? id;
}

// Per-member state (sign-ups, likes, follows, read markers) is keyed by member
// id, like Klubbflödet's store, so switching demo user doesn't hand Ingrid's
// sign-ups to Stina. Comments are shared: everyone sees them.
export const storeKeys = {
  signup: (slug: string, me: string) => `news:signup:${slug}:${me}`,
  comments: (slug: string) => `news:comments:${slug}`,
  commentLikes: (slug: string, me: string) => `news:comment-likes:${slug}:${me}`,
  like: (slug: string, me: string) => `news:like:${slug}:${me}`,
  follow: (slug: string, me: string) => `news:follow:${slug}:${me}`,
  homeSeen: (me: string) => `home:seen:${me}`,
  notify: (me: string) => `news:notify:${me}`,
};

// DEMO: members start out signed up as vägvakt at Jämjöhalvan, as in the
// member-home drawup ("Mina anmälningar").
const initialSignups: Record<string, unknown> = {
  "funktionarer-jamjohalvan": { slot: "vagvakt" } satisfies FunktionarSignup,
};

/** The member's own sign-up for a news item. Guests (no `me`) never have one. */
export function useSignup<T>(slug: string, me: string | undefined) {
  const [value, set] = useDemoState<T | null>(
    storeKeys.signup(slug, me ?? "guest"),
    me ? ((initialSignups[slug] as T | undefined) ?? null) : null,
  );
  return [me ? value : null, set] as const;
}

/** Others' sign-ups plus the visitor's own. */
export function signupCount(reg: Registration, mine: boolean) {
  return (reg.registered ?? 0) + (mine ? 1 : 0);
}

export function useMyComments(slug: string) {
  return useDemoState<MyComment[]>(storeKeys.comments(slug), []);
}

/** "i dag 14:32" / "28 okt 09:10" for the visitor's own comments. */
export function commentTime(at: number) {
  const d = new Date(at);
  const tz = "Europe/Stockholm";
  const day = new Intl.DateTimeFormat("sv-SE", { timeZone: tz }).format(d);
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: tz }).format(new Date());
  const time = new Intl.DateTimeFormat("sv-SE", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(d);
  if (Date.now() - at < 60_000) return "nyss";
  if (day === today) return `i dag ${time}`;
  return `${new Intl.DateTimeFormat("sv-SE", { timeZone: tz, day: "numeric", month: "short" }).format(d)} ${time}`;
}
