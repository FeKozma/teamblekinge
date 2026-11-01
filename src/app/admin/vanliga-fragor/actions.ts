"use server";

import { boardOnly, invalid, parseList, published, saved, tidy } from "@/components/admin/server";
import { saveFaqs } from "@/lib/content/club";
import type { Faq } from "@/lib/data/club";

const topics: Faq["topic"][] = ["medlem", "traning", "lopp"];

export async function saveFaqsAction(data: FormData) {
  await boardOnly();
  const items = parseList<Faq>(data, "faqs").map(tidy);
  const errors: Record<string, string> = {};
  items.forEach((f, i) => {
    if (!f.q) errors[`faqs.${i}.q`] = "Skriv frågan.";
    if (!f.a) errors[`faqs.${i}.a`] = "Skriv ett svar.";
    if (!topics.includes(f.topic)) errors[`faqs.${i}.topic`] = "Välj ett ämne.";
  });
  if (Object.keys(errors).length) return invalid(errors);
  await saveFaqs(items.map(({ q, a, topic }) => ({ q, a, topic })));
  published();
  return saved(items.length === 1 ? "1 fråga sparad." : `${items.length} frågor sparade.`);
}
