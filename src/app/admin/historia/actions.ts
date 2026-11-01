"use server";

import { boardOnly, invalid, parseList, published, saved, tidy } from "@/components/admin/server";
import { saveHistory } from "@/lib/content/club";
import type { Milestone } from "@/lib/data/club";

// The status select posts "true" for planned events.
type Row = Omit<Milestone, "planned"> & { planned?: boolean | string };

export async function saveHistoryAction(data: FormData) {
  await boardOnly();
  const items = parseList<Row>(data, "history").map(tidy);
  const errors: Record<string, string> = {};
  items.forEach((m, i) => {
    if (!m.when) errors[`history.${i}.when`] = "Skriv när det hände, t.ex. Hösten 1989.";
    if (!m.mark) errors[`history.${i}.mark`] = "Skriv ett årtal.";
    else if (m.mark.length > 9) errors[`history.${i}.mark`] = "Högst nio tecken – det ska få plats på banan.";
    if (!m.title) errors[`history.${i}.title`] = "Skriv en rubrik.";
    if (!m.text) errors[`history.${i}.text`] = "Skriv vad som hände.";
  });
  if (Object.keys(errors).length) return invalid(errors);
  await saveHistory(
    items.map(({ when, mark, title, text, planned }) =>
      planned === true || planned === "true" ? { when, mark, title, text, planned: true } : { when, mark, title, text },
    ),
  );
  published();
  return saved(items.length === 1 ? "1 händelse sparad." : `${items.length} händelser sparade.`);
}
