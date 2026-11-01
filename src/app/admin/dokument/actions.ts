"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { adminDocHref, adminFolderHref, reservedSlugs } from "@/components/admin/documents/links";
import type { FormState } from "@/components/admin/form-state";
import { boardOnly, checked, invalid, published, saved, slugify, text } from "@/components/admin/server";
import { getArchive, saveArchive } from "@/lib/content/documents";
import { getAllNews, saveAllNews } from "@/lib/content/news";
import { deleteUpload, formatBytes, saveUpload, UploadError, type StoredFile } from "@/lib/content/store";
import {
  docHref,
  effectiveVisibility,
  folderLabel,
  folderTrail,
  folderVisibility,
  kindLabels,
  longDateWithYear,
  moreOpen,
  protocolTarget,
  protocolTemplates,
  samePath,
  slugTaken,
  visibilities,
  visibilityLabels,
  type DocArchive,
  type DocFile,
  type DocFolder,
  type DocKind,
  type ProtocolTemplate,
  type Visibility,
} from "@/lib/data/documents";
import type { NewsItem } from "@/lib/data/news";
import type { DemoUser } from "@/lib/data/users";
import { dayMonth, todayISO } from "@/lib/format";
import { countPdfPages } from "@/lib/pdf";

// Everything the admin does to the document archive. Each action checks the
// board login, validates, writes the archive (and the news, when a document is
// announced) and refreshes the site.

const TITLE_MAX = 140;
const SUMMARY_MAX = 280;

export type UploadState = NonNullable<FormState> & { doc?: { id: string; folder: string[] } };

const pathFrom = (s: string) => s.split("/").filter(Boolean);
const newId = () => `d${randomBytes(5).toString("hex")}`;

function uniqueSlug(archive: DocArchive, path: string[], base: string) {
  const free = (s: string) => !slugTaken(archive, path, s) && !(path.length === 0 && reservedSlugs.includes(s));
  let slug = base;
  for (let i = 2; !free(slug); i++) slug = `${base}-${i}`;
  return slug;
}

/** "Mappen Protokoll är bara för medlemmar …" when `v` is more open than the folder allows. */
function visibilityError(archive: DocArchive, path: string[], v: Visibility, what: "dokumentet" | "mappen") {
  const limit = folderVisibility(archive.root, path);
  if (!moreOpen(v, limit)) return null;
  const name = folderTrail(archive.root, path)?.at(-1)?.title ?? "Mappen";
  return `${name} är ${limit === "styrelsen" ? "bara för styrelsen" : "bara för medlemmar"}, så ${what} kan inte vara öppen för fler. Välj ${visibilityLabels[limit]}${limit === "medlemmar" ? " eller Endast styrelsen" : ""}.`;
}

/** A file name that works on every computer: "Budget 2027 – utkast.pdf". */
const fileNameFor = (title: string) => `${title.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim()}.pdf`;

/** Store a chosen PDF; an error message for the form when it isn't one. */
async function storePdf(file: File): Promise<{ stored: StoredFile; pages?: number } | { error: string }> {
  try {
    const stored = await saveUpload(file, { kinds: ["pdf"] });
    return { stored, pages: countPdfPages(new Uint8Array(await file.arrayBuffer())) };
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }
}

const pickedFile = (data: FormData, name = "file") => {
  const f = data.get(name);
  return f instanceof File && f.size > 0 ? f : null;
};

/** Find or create the folders along `path`, with the given titles and visibility for new ones. */
function ensureFolders(root: DocFolder, path: string[], titles: string[], visibility: (parent: DocFolder) => Visibility) {
  let at = root;
  path.forEach((slug, i) => {
    let next = at.folders?.find((f) => f.slug === slug);
    if (!next) {
      next = { slug, title: titles[i], visibility: visibility(at) };
      // Year folders go first, so this year's meetings are on top.
      at.folders = /-\d{4}$/.test(slug) ? [next, ...(at.folders ?? [])] : [...(at.folders ?? []), next];
    }
    at = next;
  });
}

const nowTime = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", hour: "2-digit", minute: "2-digit" }).format(new Date());

/**
 * Publish a news item (category Styrelsen) linking to the document. Members
 * only unless the document is open to everyone. Returns the news slug.
 */
async function announce(
  archive: DocArchive,
  doc: DocFile,
  user: DemoUser,
  wording: { title: string; slugBase: string; intro: string; linkTitle: string },
) {
  const all = await getAllNews();
  const taken = new Set(["ny", ...all.map((n) => n.slug)]);
  let slug = slugify(wording.slugBase);
  for (let i = 2; taken.has(slug); i++) slug = `${slugify(wording.slugBase)}-${i}`;
  const today = todayISO();
  const where = ["Dokument", folderLabel(archive.root, doc.folder)].join(" › ");
  const item: NewsItem = {
    slug,
    title: wording.title,
    category: "Styrelsen",
    date: today,
    dateLabel: dayMonth(today),
    time: nowTime(),
    excerpt: doc.summary || `${wording.intro} finns nu under Dokument.`,
    body: [...(doc.summary ? [doc.summary] : []), `${wording.intro} finns nu att läsa under ${where}.`],
    author: user.id,
    membersOnly: effectiveVisibility(archive.root, doc) !== "alla",
    comments: [],
    document: { title: wording.linkTitle, path: where, href: docHref(doc) },
  };
  await saveAllNews([item, ...all]);
  return slug;
}

const generalWording = (doc: DocFile) => ({
  title: `Nytt dokument: ${doc.title}`,
  slugBase: doc.title,
  intro: doc.title,
  linkTitle: "Öppna dokumentet",
});

/** Keep the announcing news item's link right after a move, or drop it when the document goes. */
async function relinkNews(doc: DocFile, oldHref: string, next: { href: string; path: string } | null) {
  const slug = doc.announced?.newsSlug;
  if (!slug) return;
  const all = await getAllNews();
  const n = all.find((x) => x.slug === slug);
  if (!n?.document || n.document.href !== oldHref) return;
  if (next) n.document = { ...n.document, ...next };
  else delete n.document;
  await saveAllNews(all);
}

function readVisibility(data: FormData) {
  const v = text(data, "visibility") as Visibility;
  return visibilities.includes(v) ? v : null;
}

// ───────────────────────── Protocols (the quick form) ─────────────────────────

const fail = (errors: Record<string, string>): UploadState => ({ ok: false, errors });

const meetingWord: Record<ProtocolTemplate, string> = {
  styrelse: "styrelsemötet",
  arsmote: "årsmötet",
  ovrigt: "mötet",
};

/** "Ladda upp protokoll": the name and folder follow from the template and the meeting date. */
export async function uploadProtocolAction(data: FormData): Promise<UploadState> {
  const user = await boardOnly();
  const archive = await getArchive();
  const today = todayISO();
  const template = text(data, "template") as ProtocolTemplate;
  const date = text(data, "date");
  const visibility = readVisibility(data);
  const summary = text(data, "summary");
  const file = pickedFile(data);

  const errors: Record<string, string> = {};
  if (!protocolTemplates.some((t) => t.id === template)) errors.template = "Välj en mall.";
  const target = protocolTarget(archive, template, date);
  if (!date) errors.date = "Fyll i mötesdatum – det bestämmer namn och mapp.";
  else if (!target) errors.date = "Skriv datumet som år-månad-dag, t.ex. 2026-10-12.";
  else if (date > today) errors.date = "Mötesdatumet kan inte ligga i framtiden.";
  else if (target.exists) errors.date = `${target.title} finns redan i ${target.folderTitles.join(" › ")}.`;
  if (!visibility) errors.visibility = "Välj vem som får se protokollet.";
  if (summary.length > SUMMARY_MAX) errors.summary = `Sammanfattningen får vara högst ${SUMMARY_MAX} tecken.`;
  if (!file) errors.file = "Välj filen med protokollet.";
  if (Object.keys(errors).length || !target || !visibility || !file) return fail(errors);

  // New folders get the visibility of the folder they're created in (Protokoll: members).
  ensureFolders(archive.root, target.folder, target.folderTitles, (parent) =>
    parent === archive.root ? "medlemmar" : parent.visibility,
  );
  const tooOpen = visibilityError(archive, target.folder, visibility, "dokumentet");
  if (tooOpen) return fail({ visibility: tooOpen });

  const pdf = await storePdf(file);
  if ("error" in pdf) return fail({ file: pdf.error });

  const doc: DocFile = {
    id: newId(),
    title: target.title,
    slug: target.slug,
    folder: target.folder,
    kind: "protokoll",
    uploaded: today,
    uploadedBy: user.id,
    visibility,
    size: formatBytes(pdf.stored.bytes),
    pages: pdf.pages,
    fileName: target.fileName,
    file: pdf.stored.id,
    summary: summary || undefined,
  };
  const announced = checked(data, "announce") && effectiveVisibility(archive.root, doc) !== "styrelsen";
  if (announced) {
    const newsSlug = await announce(archive, doc, user, {
      title: target.newsTitle,
      slugBase: `Protokoll ${target.title}`,
      intro: `Protokollet från ${meetingWord[template]} ${longDateWithYear(date)}`,
      linkTitle: "Öppna protokollet",
    });
    doc.announced = { category: "Styrelsen", newsSlug };
  }
  archive.docs.push(doc);
  await saveArchive(archive);
  published();
  return {
    ok: true,
    message: announced ? `${doc.title} är uppladdat och nyheten publicerad.` : `${doc.title} är uppladdat.`,
    doc: { id: doc.id, folder: doc.folder },
  };
}

// ───────────────────────── Any document ─────────────────────────

type DocFields = { title: string; folder: string[]; visibility: Visibility; kind: DocKind; summary: string };

function readDocFields(archive: DocArchive, data: FormData): { fields?: DocFields; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const title = text(data, "title");
  const folder = pathFrom(text(data, "folder"));
  const visibility = readVisibility(data);
  const kind = text(data, "kind") as DocKind;
  const summary = text(data, "summary");
  if (!title) errors.title = "Skriv vad dokumentet heter.";
  else if (title.length > TITLE_MAX) errors.title = `Namnet får vara högst ${TITLE_MAX} tecken.`;
  if (!folder.length || !folderTrail(archive.root, folder)) errors.folder = "Välj en mapp.";
  if (!visibility) errors.visibility = "Välj vem som får se dokumentet.";
  else if (!errors.folder) {
    const tooOpen = visibilityError(archive, folder, visibility, "dokumentet");
    if (tooOpen) errors.visibility = tooOpen;
  }
  if (!(kind in kindLabels)) errors.kind = "Välj vad det är för slags dokument.";
  if (summary.length > SUMMARY_MAX) errors.summary = `Sammanfattningen får vara högst ${SUMMARY_MAX} tecken.`;
  if (Object.keys(errors).length || !visibility) return { errors };
  return { fields: { title, folder, visibility, kind, summary }, errors };
}

/** "Ladda upp dokument": any PDF into any folder. */
export async function uploadDocumentAction(data: FormData): Promise<FormState> {
  const user = await boardOnly();
  const archive = await getArchive();
  const { fields, errors } = readDocFields(archive, data);
  const file = pickedFile(data);
  if (!file) errors.file = "Välj PDF-filen du vill ladda upp.";
  if (!fields || !file) return invalid(errors);

  const pdf = await storePdf(file);
  if ("error" in pdf) return invalid({ file: pdf.error });

  const doc: DocFile = {
    id: newId(),
    title: fields.title,
    slug: uniqueSlug(archive, fields.folder, slugify(fields.title)),
    folder: fields.folder,
    kind: fields.kind,
    uploaded: todayISO(),
    uploadedBy: user.id,
    visibility: fields.visibility,
    size: formatBytes(pdf.stored.bytes),
    pages: pdf.pages,
    fileName: fileNameFor(fields.title),
    file: pdf.stored.id,
    summary: fields.summary || undefined,
  };
  if (checked(data, "announce") && effectiveVisibility(archive.root, doc) !== "styrelsen") {
    doc.announced = { category: "Styrelsen", newsSlug: await announce(archive, doc, user, generalWording(doc)) };
  }
  archive.docs.push(doc);
  await saveArchive(archive);
  published();
  redirect(`${adminFolderHref(doc.folder)}?ny=${doc.id}`);
}

/** Edit a document: details, folder (a move), who may see it, a new file, announce it. */
export async function saveDocumentAction(id: string, data: FormData): Promise<FormState> {
  const user = await boardOnly();
  const archive = await getArchive();
  const doc = archive.docs.find((d) => d.id === id);
  if (!doc) return invalid({}, "Dokumentet finns inte längre – det kan ha tagits bort.");
  const { fields, errors } = readDocFields(archive, data);
  if (!fields) return invalid(errors);

  const file = pickedFile(data);
  if (file) {
    const pdf = await storePdf(file);
    if ("error" in pdf) return invalid({ file: pdf.error });
    if (doc.file) await deleteUpload(doc.file);
    doc.file = pdf.stored.id;
    doc.size = formatBytes(pdf.stored.bytes);
    doc.pages = pdf.pages;
  }

  const oldHref = docHref(doc);
  const moved = !samePath(doc.folder, fields.folder);
  if (moved) {
    doc.slug = uniqueSlug(archive, fields.folder, doc.slug);
    doc.folder = fields.folder;
    await relinkNews(doc, oldHref, {
      href: docHref(doc),
      path: ["Dokument", folderLabel(archive.root, doc.folder)].join(" › "),
    });
  }
  if (fields.title !== doc.title) doc.fileName = fileNameFor(fields.title);
  doc.title = fields.title;
  doc.kind = fields.kind;
  doc.visibility = fields.visibility;
  doc.summary = fields.summary || undefined;

  let announcedNow = false;
  if (!doc.announced && checked(data, "announce") && effectiveVisibility(archive.root, doc) !== "styrelsen") {
    doc.announced = { category: "Styrelsen", newsSlug: await announce(archive, doc, user, generalWording(doc)) };
    announcedNow = true;
  }
  await saveArchive(archive);
  published();
  // The edit page's address follows the document.
  if (moved) redirect(`${adminDocHref(doc)}?sparat=flyttat`);
  return saved(announcedNow ? "Dokumentet är sparat och nyheten publicerad." : "Dokumentet är sparat.");
}

export async function deleteDocumentAction(id: string): Promise<FormState> {
  await boardOnly();
  const archive = await getArchive();
  const doc = archive.docs.find((d) => d.id === id);
  if (!doc) return invalid({}, "Dokumentet finns inte längre.");
  archive.docs = archive.docs.filter((d) => d.id !== id);
  await saveArchive(archive);
  if (doc.file) await deleteUpload(doc.file);
  await relinkNews(doc, docHref(doc), null);
  published();
  redirect(`${adminFolderHref(doc.folder)}?borttaget=dokument`);
}

// ───────────────────────── Folders ─────────────────────────

function readFolderFields(archive: DocArchive, parent: string[], data: FormData) {
  const errors: Record<string, string> = {};
  const title = text(data, "title");
  const description = text(data, "description");
  const visibility = readVisibility(data);
  if (!title) errors.title = "Skriv vad mappen heter.";
  else if (title.length > 80) errors.title = "Namnet får vara högst 80 tecken.";
  if (description.length > 200) errors.description = "Beskrivningen får vara högst 200 tecken.";
  if (!visibility) errors.visibility = "Välj vem som får se mappen.";
  else {
    const tooOpen = visibilityError(archive, parent, visibility, "mappen");
    if (tooOpen) errors.visibility = tooOpen;
  }
  return { title, description, visibility, errors };
}

export async function createFolderAction(parentPath: string, data: FormData): Promise<FormState> {
  await boardOnly();
  const archive = await getArchive();
  const parentSlugs = pathFrom(parentPath);
  const parent = folderTrail(archive.root, parentSlugs)?.at(-1);
  if (!parent) return invalid({}, "Mappen du ville skapa den i finns inte längre.");
  const { title, description, visibility, errors } = readFolderFields(archive, parentSlugs, data);
  if (Object.keys(errors).length || !visibility) return invalid(errors);
  if (parent.folders?.some((f) => f.title.toLowerCase() === title.toLowerCase())) {
    return invalid({ title: `Det finns redan en mapp som heter ${title} här.` });
  }
  const folder: DocFolder = {
    slug: uniqueSlug(archive, parentSlugs, slugify(title)),
    title,
    description: description || undefined,
    visibility,
  };
  parent.folders = [...(parent.folders ?? []), folder];
  await saveArchive(archive);
  published();
  redirect(`${adminFolderHref([...parentSlugs, folder.slug])}?sparat=mapp`);
}

/** Rename a folder or change who may see it. Its address stays, so shared links keep working. */
export async function saveFolderAction(path: string, data: FormData): Promise<FormState> {
  await boardOnly();
  const archive = await getArchive();
  const slugs = pathFrom(path);
  const folder = slugs.length ? folderTrail(archive.root, slugs)?.at(-1) : undefined;
  if (!folder) return invalid({}, "Mappen finns inte längre.");
  const { title, description, visibility, errors } = readFolderFields(archive, slugs.slice(0, -1), data);
  if (Object.keys(errors).length || !visibility) return invalid(errors);
  folder.title = title;
  folder.description = description || undefined;
  folder.visibility = visibility;
  await saveArchive(archive);
  published();
  return saved(`Mappen ${title} är sparad.`);
}

/** Only empty folders can be deleted — nothing disappears by accident. */
export async function deleteFolderAction(path: string): Promise<FormState> {
  await boardOnly();
  const archive = await getArchive();
  const slugs = pathFrom(path);
  const trail = slugs.length ? folderTrail(archive.root, slugs) : null;
  if (!trail) return invalid({}, "Mappen finns inte längre.");
  const folder = trail[trail.length - 1];
  const parent = trail[trail.length - 2];
  if (folder.folders?.length || archive.docs.some((d) => samePath(d.folder, slugs))) {
    return invalid({}, "Mappen är inte tom. Flytta eller ta bort det som ligger i den först.");
  }
  parent.folders = parent.folders?.filter((f) => f !== folder);
  await saveArchive(archive);
  published();
  redirect(`${adminFolderHref(slugs.slice(0, -1))}?borttaget=mapp`);
}
