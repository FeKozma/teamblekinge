"use client";

import { newsCategories } from "@/lib/data/news";
import { useDemoState } from "@/lib/demo-store";
import { storeKeys } from "@/components/news/store";

// A member's own settings: contact details and which e-mails they want.
// DEMO: kept in this browser (useDemoState) — the real site stores them on the
// member and sends the mail. Shared by /installningar, the header menu and
// "Mina aviseringar" on the news pages, so they always agree.

export type Profile = { email: string; phone: string };

export function useProfile(me: string, initial: Profile) {
  return useDemoState<Profile>(`profile:${me}`, initial);
}

export type NewsFreq = "direkt" | "dag" | "vecka" | "av";
export type Notify = { freq: NewsFreq; cats: string[] };

export const newsFreqs: { id: NewsFreq; label: string; hint: string }[] = [
  { id: "direkt", label: "Direkt", hint: "Ett mejl per nyhet" },
  { id: "dag", label: "Dagssammanfattning", hint: "Högst ett mejl per dag" },
  { id: "vecka", label: "Veckobrev", hint: "Ett mejl i veckan" },
  { id: "av", label: "Inga mejl", hint: "Bara klockan här på sidan" },
];

export const defaultNotify: Notify = { freq: "dag", cats: [...newsCategories] };

export function useNotify(me: string) {
  return useDemoState<Notify>(storeKeys.notify(me), defaultNotify);
}

/** Other e-mails than news. */
export type EmailPrefs = Record<(typeof emailTopics)[number]["id"], boolean>;

export const emailTopics = [
  { id: "replies", label: "Svar på mina kommentarer och inlägg", hint: "När någon svarar dig i en nyhet eller i Klubbflödet." },
  { id: "mentions", label: "När någon nämner mig", hint: "Någon skriver @ och ditt namn." },
  { id: "deadlines", label: "Påminnelse före sista anmälningsdag", hint: "Två dagar innan, för anmälningar du inte svarat på." },
  { id: "runs", label: "Nya löprundor i Klubbflödet", hint: "När någon bjuder in till en löprunda." },
] as const;

export const defaultEmailPrefs: EmailPrefs = { replies: true, mentions: true, deadlines: true, runs: false };

export function useEmailPrefs(me: string) {
  return useDemoState<EmailPrefs>(`email-prefs:${me}`, defaultEmailPrefs);
}
