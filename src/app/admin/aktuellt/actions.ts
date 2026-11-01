"use server";

import { boardOnly, checked, invalid, isISODate, isUrl, published, saved, text } from "@/components/admin/server";
import { saveAnnouncement } from "@/lib/content/announcement";
import type { Announcement } from "@/lib/data/announcement";
import { todayISO } from "@/lib/format";

export async function saveAnnouncementAction(data: FormData) {
  await boardOnly();
  const a: Announcement = {
    show: checked(data, "show"),
    until: text(data, "until"),
    label: text(data, "label"),
    title: text(data, "title"),
    text: text(data, "text"),
    linkText: text(data, "linkText"),
    href: text(data, "href"),
  };
  const errors: Record<string, string> = {};
  if (!a.title) errors.title = "Skriv vad som är aktuellt.";
  if (a.until && !isISODate(a.until)) errors.until = "Välj ett datum, eller lämna fältet tomt.";
  else if (a.show && a.until && a.until < todayISO()) {
    errors.until = "Datumet har redan varit, så bandet skulle inte synas. Välj ett senare datum eller töm fältet.";
  }
  if (a.href && !a.href.startsWith("/") && !isUrl(a.href)) errors.href = "Skriv hela webbadressen, med https:// först.";
  if (a.href && !a.linkText) errors.linkText = "Skriv en länktext, t.ex. ”Läs mer”.";
  if (Object.keys(errors).length) return invalid(errors);
  await saveAnnouncement(a);
  published();
  return saved(a.show ? "Bandet är sparat och visas på startsidan." : "Bandet är sparat och dolt.");
}
