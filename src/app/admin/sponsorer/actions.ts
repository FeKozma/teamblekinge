"use server";

import { boardOnly, invalid, isUrl, parseList, published, resolveListImages, saved, tidy } from "@/components/admin/server";
import { savePartners } from "@/lib/content/club";
import type { Partner } from "@/lib/data/club";

// A row may carry `logo__upload`: the file input holding a newly chosen logo.
type Row = Partner & { logo__upload?: string | null };

export async function savePartnersAction(data: FormData) {
  await boardOnly();
  const items = parseList<Row>(data, "partners").map(tidy);
  const errors: Record<string, string> = {};
  items.forEach((p, i) => {
    if (!p.name) errors[`partners.${i}.name`] = "Skriv sponsorns namn.";
    if (!p.logo && !p.logo__upload) errors[`partners.${i}.logo`] = "Välj en bild med sponsorns logga.";
    if (p.url && !isUrl(p.url)) errors[`partners.${i}.url`] = "Klistra in hela adressen. Den börjar med https://";
  });
  // Store new logos only once everything else is right, so a retry doesn't store them twice.
  if (!Object.keys(errors).length) Object.assign(errors, await resolveListImages(data, "partners", items, "logo"));
  if (Object.keys(errors).length) return invalid(errors);
  await savePartners(items.map(({ name, logo, url }) => (url ? { name, logo, url } : { name, logo })));
  published();
  return saved(items.length === 1 ? "1 sponsor sparad." : `${items.length} sponsorer sparade.`);
}
