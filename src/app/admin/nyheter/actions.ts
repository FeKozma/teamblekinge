"use server";

import { redirect } from "next/navigation";
import {
  boardOnly,
  imageFrom,
  invalid,
  isISODate,
  isUrl,
  parseList,
  published,
  saved,
  slugify,
  text,
} from "@/components/admin/server";
import { dayMonthLong } from "@/components/news/util";
import { addNews, deleteNews, getNews, updateNews } from "@/lib/content/news";
import { newsCategories, type NewsCategory, type NewsItem, type Registration } from "@/lib/data/news";
import { paragraphs } from "@/lib/data/pages";
import { dayMonth, longDate } from "@/lib/format";
import { defaultCta, type RegKind } from "./options";

type Errors = Record<string, string>;
/** What the editor sets; the rest of an item (slug, author, comments …) is kept or set on create. */
type Fields = Omit<NewsItem, "slug" | "author" | "comments">;

const kinds: RegKind[] = ["extern", "stafett", "funktionar"];

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** "lördag 7 november" → "Lördag 7 november" */
const capitalized = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Time of day in Stockholm, e.g. "19:40". */
const timeNow = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", hour: "2-digit", minute: "2-digit" }).format(
    new Date(),
  );

export async function createNewsAction(data: FormData) {
  const user = await boardOnly();
  const read = await readNews(data);
  if ("errors" in read) return invalid(read.errors);
  const slug = await addNews({
    slug: slugify(read.fields.title),
    ...read.fields,
    author: user.id,
    time: timeNow(),
    comments: [],
  });
  published();
  // The editor for the new item, with a "published" note and a link to it.
  redirect(`/admin/nyheter/${slug}?publicerad=1`);
}

export async function updateNewsAction(slug: string, data: FormData) {
  await boardOnly();
  const prev = await getNews(slug);
  if (!prev) return invalid({ title: "Nyheten finns inte längre – någon kan ha tagit bort den." });
  const read = await readNews(data, prev);
  if ("errors" in read) return invalid(read.errors);
  // The address never changes (links have been shared), and the author,
  // time, comments and likes stay as they were.
  await updateNews(slug, { ...prev, ...read.fields });
  published();
  return saved("Nyheten är sparad.");
}

export async function deleteNewsAction(slug: string) {
  await boardOnly();
  await deleteNews(slug);
  published();
  redirect("/admin/nyheter?borttagen=1");
}

async function readNews(data: FormData, prev?: NewsItem): Promise<{ errors: Errors } | { fields: Fields }> {
  const errors: Errors = {};

  const title = text(data, "title");
  if (!title) errors.title = "Skriv en rubrik.";
  else if (title.length > 140) errors.title = `Rubriken har ${title.length} tecken – korta den till högst 140.`;

  const category = text(data, "category") as NewsCategory;
  if (!newsCategories.includes(category)) errors.category = "Välj en kategori.";

  const audience = text(data, "audience");
  if (audience !== "alla" && audience !== "medlemmar") errors.audience = "Välj vem som får läsa nyheten.";

  const date = text(data, "date");
  if (!isISODate(date)) errors.date = "Välj ett datum.";

  const excerpt = text(data, "excerpt");
  if (!excerpt) errors.excerpt = "Skriv en ingress – en eller två meningar om vad nyheten handlar om.";
  else if (excerpt.length > 400) {
    errors.excerpt = `Ingressen har ${excerpt.length} tecken – korta den till högst 400. Resten kan stå i texten.`;
  }

  const body = paragraphs(text(data, "body").replace(/\r\n/g, "\n"));
  if (!body.length) errors.body = "Skriv själva nyheten.";

  const file = data.get("image__file");
  const hasImage = (file instanceof File && file.size > 0) || !!text(data, "image");
  const imageAlt = text(data, "imageAlt");
  if (hasImage && !imageAlt) errors.imageAlt = "Beskriv kort vad bilden visar.";

  const pinnedUntil = text(data, "pinnedUntil");
  if (pinnedUntil && !isISODate(pinnedUntil)) errors.pinnedUntil = "Välj ett datum, eller töm fältet.";
  else if (pinnedUntil && isISODate(date) && pinnedUntil < date) {
    errors.pinnedUntil = "Välj nyhetens datum eller en senare dag.";
  }

  const registration = readRegistration(data, prev?.registration, errors);

  if (Object.keys(errors).length) return { errors };

  // Store a new picture only once the rest is right, so a form that comes
  // back with errors leaves no stray uploads behind.
  const image = await imageFrom(data, "image");
  if ("error" in image) return { errors: { image: image.error } };

  return {
    fields: {
      title,
      category,
      date,
      dateLabel: dayMonth(date),
      excerpt,
      body,
      image: image.url || undefined,
      imageAlt: image.url ? imageAlt : undefined,
      // A crop chosen for the old picture doesn't fit a new one.
      imagePosition: image.url && image.url === prev?.image ? prev.imagePosition : undefined,
      membersOnly: audience === "medlemmar" || undefined,
      pinnedUntil: pinnedUntil || undefined,
      registration,
    },
  };
}

function readRegistration(data: FormData, prev: Registration | undefined, errors: Errors) {
  const kind = text(data, "regKind") as RegKind | "";
  if (!kind) return undefined;
  if (!kinds.includes(kind)) {
    errors.regKind = "Välj ett av alternativen.";
    return undefined;
  }
  // Sign-up counts and pass ids only carry over while the kind stays the same.
  const same = prev?.kind === kind ? prev : undefined;

  const date = text(data, "regDate");
  const deadline = text(data, "regDeadline");
  if (!isISODate(date)) errors.regDate = "Välj vilken dag det gäller.";
  if (!isISODate(deadline)) errors.regDeadline = "Välj sista dagen att anmäla sig.";
  else if (isISODate(date) && deadline > date) errors.regDeadline = "Sista anmälningsdag kan inte vara efter själva dagen.";

  const reg: Registration = {
    kind,
    date,
    dateLabel: isISODate(date) ? capitalized(longDate(date)) : "",
    deadline,
    deadlineLabel: isISODate(deadline) ? dayMonthLong(deadline) : "",
    cta: text(data, "regCta") || defaultCta[kind],
  };
  const hint = text(data, "regHint");
  if (hint) reg.hint = hint;
  const deadlineTitle = text(data, "regDeadlineTitle");
  if (deadlineTitle) reg.deadlineTitle = deadlineTitle;
  if (same?.signupTitle) reg.signupTitle = same.signupTitle;

  if (kind !== "funktionar") {
    const extra: { label: string; value: string }[] = [];
    parseList<Record<string, unknown>>(data, "regExtra").forEach((r, i) => {
      const label = str(r.label);
      const value = str(r.value);
      if (!label && !value) return;
      if (!label) errors[`regExtra.${i}.label`] = "Skriv en rubrik, t.ex. ”Start”.";
      if (!value) errors[`regExtra.${i}.value`] = "Skriv vad som gäller, t.ex. ”11:00, Jämjö”.";
      extra.push({ label, value });
    });
    if (extra.length) reg.extra = extra;
  }

  if (kind === "extern") {
    const url = text(data, "regUrl");
    if (!url) errors.regUrl = "Klistra in länken till anmälan.";
    else if (!isUrl(url) || !URL.canParse(url)) {
      errors.regUrl = "Länken ska börja med https:// – kopiera den från webbläsarens adressfält.";
    }
    reg.url = url;
  }

  if (kind === "stafett") {
    const capacity = Number(text(data, "regCapacity") || NaN);
    const registered = same?.registered ?? 0;
    if (!Number.isInteger(capacity) || capacity < 1) errors.regCapacity = "Skriv hur många som kan anmäla sig, t.ex. 24.";
    else if (capacity < registered) {
      errors.regCapacity = `${registered} har redan anmält sig – skriv minst ${registered}.`;
    }
    reg.capacity = capacity;
    reg.registered = registered;
  }

  if (kind === "funktionar") {
    const rows = parseList<Record<string, unknown>>(data, "regSlots");
    const before = new Map((same?.slots ?? []).map((s) => [s.id, s]));
    // Members' sign-ups point at a pass's id, so a renamed pass keeps it.
    const used = new Set(rows.map((r) => str(r.id)).filter((id) => before.has(id)));
    const slots = rows.map((r, i) => {
      const label = str(r.label);
      const capacity = r.capacity === "" ? NaN : Number(r.capacity);
      const old = before.get(str(r.id));
      const taken = old?.taken ?? 0;
      if (!label) errors[`regSlots.${i}.label`] = "Skriv vad passet är, t.ex. ”Vägvakt”.";
      if (!Number.isInteger(capacity) || capacity < 1) errors[`regSlots.${i}.capacity`] = "Skriv hur många som behövs.";
      else if (capacity < taken) errors[`regSlots.${i}.capacity`] = `${taken} har redan valt passet – skriv minst ${taken}.`;
      return { id: old?.id ?? freeId(slugify(label), used), label, capacity, taken };
    });
    if (!slots.length) errors.regSlots = "Lägg till minst ett pass.";
    reg.slots = slots;
    reg.capacity = slots.reduce((s, x) => s + (x.capacity || 0), 0);
    reg.registered = slots.reduce((s, x) => s + x.taken, 0);
  }

  return reg;
}

/** `base`, or `base-2` … — the first one not in `used` (which it joins). */
function freeId(base: string, used: Set<string>) {
  let id = base;
  for (let i = 2; used.has(id); i++) id = `${base}-${i}`;
  used.add(id);
  return id;
}
