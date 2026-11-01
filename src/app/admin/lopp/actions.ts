"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/components/admin/form-state";
import {
  boardOnly,
  imageFrom,
  invalid,
  isISODate,
  isTime,
  isUrl,
  parseList,
  published,
  saved,
  slugify,
  text,
  tidy,
} from "@/components/admin/server";
import { getRaces, saveRaces } from "@/lib/content/races";
import { raceDateLabel, stockholmDateTime, type Race } from "@/lib/data/races";

const tones: Race["tone"][] = ["orange", "purple"];
const fits: NonNullable<Race["imageFit"]>[] = ["cover", "poster", "contain"];
/** Taken by the "new race" page, /admin/lopp/nytt. */
const reserved = new Set(["nytt"]);

const lines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/**
 * Save a race. `slug` is null for a new race, which gets a slug from its name
 * once; after that the slug never changes, because links to the race's page
 * are shared.
 */
export async function saveRaceAction(slug: string | null, data: FormData): Promise<FormState> {
  await boardOnly();
  const races = await getRaces();
  const index = slug ? races.findIndex((r) => r.slug === slug) : -1;
  if (slug && index < 0) return invalid({}, "Loppet finns inte längre – någon kan ha tagit bort det.");
  const errors: Record<string, string> = {};

  const name = text(data, "name");
  const date = text(data, "date");
  const time = text(data, "time");
  const place = text(data, "place");
  const kicker = text(data, "kicker");
  const tone = text(data, "tone") as Race["tone"];
  const summary = text(data, "summary");
  const cta = text(data, "cta");
  const imageFit = text(data, "imageFit") as NonNullable<Race["imageFit"]>;
  const imageAlt = text(data, "imageAlt");
  const feeNote = text(data, "feeNote");
  const registration = {
    label: text(data, "registration.label"),
    url: text(data, "registration.url"),
    note: text(data, "registration.note"),
    tip: text(data, "registration.tip"),
  };

  if (!name) errors.name = "Skriv loppets namn.";
  if (!isISODate(date)) errors.date = "Välj ett datum.";
  if (!isTime(time)) errors.time = "Skriv tiden som 11:00.";
  if (!place) errors.place = "Skriv var loppet går.";
  if (!kicker) errors.kicker = "Skriv en kort etikett, t.ex. datum och ort.";
  if (!tones.includes(tone)) errors.tone = "Välj en färg.";
  if (!summary) errors.summary = "Skriv en kort sammanfattning.";
  if (!cta) errors.cta = "Skriv en knapptext, t.ex. ”Till loppet”.";
  if (!fits.includes(imageFit)) errors.imageFit = "Välj hur bilden ska visas.";
  const file = data.get("image__file");
  const hasImage = (file instanceof File && file.size > 0) || !!text(data, "image");
  if (!hasImage) errors.image = "Välj en bild för loppet.";
  else if (!imageAlt) errors.imageAlt = "Beskriv bilden med några ord.";
  if (!registration.label) errors["registration.label"] = "Skriv texten på knappen, t.ex. ”Anmäl dig på mittlopp.se”.";
  if (registration.url && !isUrl(registration.url)) {
    errors["registration.url"] = "Skriv hela webbadressen, med https:// först.";
  }
  if (!registration.note) errors["registration.note"] = "Skriv något om anmälan, t.ex. när den stänger.";

  const distances = parseList<Race["distances"][number]>(data, "distances").map(tidy);
  if (!distances.length) errors.distances = "Lägg till minst en distans.";
  distances.forEach((d, i) => {
    if (!d.name) errors[`distances.${i}.name`] = "Skriv distansen.";
    if (!isTime(d.start ?? "")) errors[`distances.${i}.start`] = "Skriv tiden som 11:00.";
  });

  const feeLadder = parseLadder(data, errors);

  const records = parseList<NonNullable<Race["records"]>[number]>(data, "records").map(tidy);
  records.forEach((r, i) => {
    if (!r.distance) errors[`records.${i}.distance`] = "Skriv distansen.";
    if (!r.time) errors[`records.${i}.time`] = "Skriv tiden.";
    if (!r.name) errors[`records.${i}.name`] = "Skriv namnet.";
    if (!r.club) errors[`records.${i}.club`] = "Skriv klubben.";
    if (!Number.isInteger(r.year) || r.year < 1900 || r.year > 2100) errors[`records.${i}.year`] = "Skriv året, t.ex. 2013.";
  });

  const others = new Set(races.filter((r) => r.slug !== slug).map((r) => r.slug));
  const related = parseList<NonNullable<Race["related"]>[number]>(data, "related").map(tidy);
  const linked = new Set<string>();
  related.forEach((r, i) => {
    if (!others.has(r.slug)) errors[`related.${i}.slug`] = "Välj ett lopp.";
    else if (linked.has(r.slug)) errors[`related.${i}.slug`] = "Det loppet finns redan i listan.";
    linked.add(r.slug);
    if (!r.text) errors[`related.${i}.text`] = "Skriv hur loppen hänger ihop.";
  });

  const results = parseList<{ label: string; text: string; current: string }>(data, "results").map(tidy);
  results.forEach((r, i) => {
    if (!r.label) errors[`results.${i}.label`] = "Skriv året eller en rubrik.";
  });
  const currentRows = results.flatMap((r, i) => (r.current === "ja" ? [i] : []));
  for (const i of currentRows.slice(1)) errors[`results.${i}.current`] = "Bara en rad kan gälla årets lopp.";

  if (Object.keys(errors).length) return invalid(errors);

  // Store a newly chosen image only once everything else is right.
  const image = await imageFrom(data, "image");
  if ("error" in image) return invalid({ image: image.error });

  const race: Race = {
    slug: slug ?? uniqueSlug(name, races),
    name,
    start: stockholmDateTime(date, time),
    dateLabel: raceDateLabel(date),
    place,
    kicker,
    tone,
    summary,
    image: image.url,
    imageAlt,
    imageFit,
    distances: distances.map(({ name, start, fee, note }) => ({
      name,
      start,
      ...(fee ? { fee } : {}),
      ...(note ? { note } : {}),
    })),
    registration: {
      label: registration.label,
      ...(registration.url ? { url: registration.url } : {}),
      note: registration.note,
      ...(registration.tip ? { tip: registration.tip } : {}),
    },
    facts: lines(text(data, "facts")),
    cta,
    ...(feeNote ? { feeNote } : {}),
    ...(feeLadder ? { feeLadder } : {}),
    ...(records.length
      ? { records: records.map(({ distance, name, club, time, year }) => ({ distance, name, club, time, year })) }
      : {}),
    ...(related.length ? { related: related.map(({ slug, text }) => ({ slug, text })) } : {}),
    ...(results.length
      ? {
          results: results.map(({ label, text, current }) => ({
            label,
            text,
            ...(current === "ja" ? { current: true } : {}),
          })),
        }
      : {}),
  };

  if (index >= 0) races[index] = race;
  else races.push(race);
  await saveRaces(races);
  published();
  if (!slug) redirect(`/admin/lopp/${race.slug}?skapat=1`);
  return saved(`${race.name} är sparat.`);
}

/** Remove a race, and any other race's link to it. */
export async function deleteRaceAction(slug: string) {
  await boardOnly();
  const races = (await getRaces())
    .filter((r) => r.slug !== slug)
    .map((r) => ({ ...r, related: r.related?.filter((l) => l.slug !== slug) }));
  await saveRaces(races);
  published();
  redirect("/admin/lopp?borttaget=1");
}

/** Move a race one step up (-1) or down (1) — the order the site shows them in. */
export async function moveRaceAction(slug: string, step: -1 | 1) {
  await boardOnly();
  const races = await getRaces();
  const i = races.findIndex((r) => r.slug === slug);
  const j = i + step;
  if (i < 0 || j < 0 || j >= races.length) return;
  [races[i], races[j]] = [races[j], races[i]];
  await saveRaces(races);
  published();
  redirect("/admin/lopp");
}

function uniqueSlug(name: string, races: Race[]) {
  const base = slugify(name);
  const taken = new Set([...races.map((r) => r.slug), ...reserved]);
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

/** The fee ladder table, or undefined when it's empty. Errors are added to `errors`. */
function parseLadder(data: FormData, errors: Record<string, string>): Race["feeLadder"] {
  let raw: { periods?: unknown; rows?: unknown };
  try {
    raw = JSON.parse(String(data.get("feeLadder") ?? "{}"));
  } catch {
    return undefined;
  }
  const periods = Array.isArray(raw.periods) ? raw.periods.map((p) => String(p ?? "").trim()) : [];
  const rows = (Array.isArray(raw.rows) ? raw.rows : []).map((r: { name?: unknown; fees?: unknown }) => ({
    name: String(r?.name ?? "").trim(),
    fees: Array.isArray(r?.fees) ? r.fees : [],
  }));
  if (!rows.length || !periods.length) return undefined;
  periods.forEach((p, j) => {
    if (!p) errors[`feeLadder.periods.${j}`] = "Skriv perioden, t.ex. 1/1–30/4.";
  });
  const out = rows.map((r, i) => {
    if (!r.name) errors[`feeLadder.rows.${i}.name`] = "Skriv distansen.";
    const fees = periods.map((_, j) => {
      const fee = r.fees[j];
      if (typeof fee !== "number" || !Number.isFinite(fee) || fee < 0) {
        errors[`feeLadder.rows.${i}.fees.${j}`] = "Skriv avgiften i kronor.";
        return 0;
      }
      return Math.round(fee);
    });
    return { name: r.name, fees };
  });
  return { periods, rows: out };
}
