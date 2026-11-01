// The club's document archive ("Dokument") — SEED and pure helpers. Folder
// names, the policies and the two latest protocols (with their upload days)
// follow the current site; earlier meeting dates, file sizes and page counts
// are made up, and the seed documents have no file behind them (the PDF route
// serves a generated example page instead). Pages read the board's edited
// archive through lib/content/documents and pass it to these helpers.

import type { NewsCategory } from "./news";
import { monthsLong, monthsShort } from "@/lib/format";

/** Who may open a folder or document. */
export type Visibility = "alla" | "medlemmar" | "styrelsen";
/** Who is looking: a guest, a logged-in member or a board member. */
export type Viewer = "guest" | "member" | "board";

export type DocKind = "protokoll" | "policy" | "stadgar" | "instruktion" | "underlag";

export type DocFolder = {
  /** Part of the URL. Never changes once created, so shared links keep working. */
  slug: string;
  title: string;
  description?: string;
  visibility: Visibility;
  folders?: DocFolder[];
};

export type DocFile = {
  /** Stable id (survives renames and moves). */
  id: string;
  title: string;
  slug: string;
  /** Folder slugs from the root, e.g. ["protokoll", "styrelsemote-2026"]. */
  folder: string[];
  kind: DocKind;
  uploaded: string; // ISO date
  uploadedBy: string; // person id in users.ts
  visibility: Visibility;
  size: string; // "214 kB"
  /** Unknown for some uploads. */
  pages?: number;
  /** The name the file gets when downloaded. */
  fileName: string;
  /** Id of the uploaded file in the content store; seed documents have none. */
  file?: string;
  summary?: string;
  /** Set when a news item announced the document ("Nyhet · Styrelsen"). */
  announced?: { category: NewsCategory; newsSlug?: string };
};

/** The whole archive: the folder tree and every document. */
export type DocArchive = { root: DocFolder; docs: DocFile[] };

/** Just enough of a document to know where it lives. */
export type DocRef = Pick<DocFile, "folder" | "slug">;

export const visibilities: Visibility[] = ["alla", "medlemmar", "styrelsen"];

export const visibilityLabels: Record<Visibility, string> = {
  alla: "Alla",
  medlemmar: "Medlemmar",
  styrelsen: "Endast styrelsen",
};

export const kindLabels: Record<DocKind, string> = {
  protokoll: "Protokoll",
  policy: "Policy",
  stadgar: "Stadgar",
  instruktion: "Instruktion",
  underlag: "Underlag",
};

const rootFolder: DocFolder = {
  slug: "",
  title: "Dokument",
  visibility: "alla",
  folders: [
    {
      slug: "protokoll",
      title: "Protokoll",
      description: "Styrelsemöten och årsmöten, sorterade per år.",
      visibility: "medlemmar",
      folders: [
        { slug: "styrelsemote-2026", title: "Styrelsemöte 2026", visibility: "medlemmar" },
        { slug: "styrelsemote-2025", title: "Styrelsemöte 2025", visibility: "medlemmar" },
        {
          slug: "arsmote",
          title: "Årsmöte",
          description: "Protokoll och handlingar från årsmötena.",
          visibility: "medlemmar",
        },
      ],
    },
    {
      slug: "policys",
      title: "Policys",
      description: "Drogpolicy, jämställdhetspolicy och antidopingplan.",
      visibility: "alla",
    },
    {
      slug: "stadgar",
      title: "Stadgar",
      description: "Föreningens stadgar, som de antagits av årsmötet.",
      visibility: "alla",
    },
    {
      slug: "lopp",
      title: "Lopp",
      description: "Instruktioner och underlag till loppen vi arrangerar.",
      visibility: "alla",
    },
    {
      slug: "styrelsen",
      title: "Styrelsens arbetsmaterial",
      description: "Utkast och underlag som bara styrelsen ser.",
      visibility: "styrelsen",
    },
  ],
};

/** "24 okt" in the demo year, "3 dec 2025" otherwise. */
export function uploadLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${monthsShort[m - 1]}${y === 2026 ? "" : ` ${y}`}`;
}

type DocInput = Omit<DocFile, "id" | "uploadedBy" | "fileName"> & Partial<Pick<DocFile, "uploadedBy" | "fileName">>;

function doc(d: DocInput): DocFile {
  return {
    ...d,
    id: [...d.folder, d.slug].join("/"),
    uploadedBy: d.uploadedBy ?? "stina",
    fileName: d.fileName ?? `${d.title}.pdf`,
  };
}

const board = (date: string, uploaded: string, size: string, pages: number, newsSlug?: string) =>
  doc({
    title: `Styrelsemöte ${date}`,
    slug: date,
    folder: ["protokoll", `styrelsemote-${date.slice(0, 4)}`],
    kind: "protokoll",
    uploaded,
    visibility: "medlemmar",
    size,
    pages,
    fileName: `Protokoll styrelsemöte ${date}.pdf`,
    announced: { category: "Styrelsen", newsSlug },
  });

const documents: DocFile[] = [
  board("2026-10-12", "2026-10-24", "214 kB", 3, "protokoll-styrelsemote-2026-10-12"),
  board("2026-09-07", "2026-09-13", "188 kB", 3, "protokoll-styrelsemote-2026-09-07"),
  board("2026-08-17", "2026-08-24", "176 kB", 2),
  board("2026-06-22", "2026-07-18", "201 kB", 3),
  board("2025-11-24", "2025-12-03", "193 kB", 3),
  board("2025-10-13", "2025-10-21", "168 kB", 2),
  board("2025-09-08", "2025-09-16", "181 kB", 2),

  doc({
    title: "Årsmöte 2026-02-26",
    slug: "2026-02-26",
    folder: ["protokoll", "arsmote"],
    kind: "protokoll",
    uploaded: "2026-03-10",
    visibility: "medlemmar",
    size: "342 kB",
    pages: 5,
    fileName: "Protokoll årsmöte 2026-02-26.pdf",
    announced: { category: "Styrelsen" },
  }),
  doc({
    title: "Verksamhetsberättelse 2025",
    slug: "verksamhetsberattelse-2025",
    folder: ["protokoll", "arsmote"],
    kind: "underlag",
    uploaded: "2026-02-12",
    visibility: "medlemmar",
    size: "1,2 MB",
    pages: 8,
  }),
  doc({
    title: "Årsmöte 2025-02-27",
    slug: "2025-02-27",
    folder: ["protokoll", "arsmote"],
    kind: "protokoll",
    uploaded: "2025-03-11",
    visibility: "medlemmar",
    size: "318 kB",
    pages: 5,
    fileName: "Protokoll årsmöte 2025-02-27.pdf",
  }),

  doc({
    title: "Drogpolicy",
    slug: "drogpolicy",
    folder: ["policys"],
    kind: "policy",
    uploaded: "2025-03-18",
    visibility: "alla",
    size: "96 kB",
    pages: 2,
  }),
  doc({
    title: "Jämställdhetspolicy",
    slug: "jamstalldhetspolicy",
    folder: ["policys"],
    kind: "policy",
    uploaded: "2025-03-18",
    visibility: "alla",
    size: "104 kB",
    pages: 2,
  }),
  doc({
    title: "Antidopingplan",
    slug: "antidopingplan",
    folder: ["policys"],
    kind: "policy",
    uploaded: "2025-03-18",
    visibility: "alla",
    size: "122 kB",
    pages: 3,
  }),

  doc({
    title: "Stadgar för Team Blekinge Löparförening",
    slug: "stadgar",
    folder: ["stadgar"],
    kind: "stadgar",
    uploaded: "2025-03-11",
    visibility: "alla",
    size: "236 kB",
    pages: 6,
    fileName: "Stadgar Team Blekinge LF.pdf",
  }),

  doc({
    title: "Jämjöhalvan – funktionärsinstruktioner",
    slug: "jamjohalvan-funktionarsinstruktioner",
    folder: ["lopp"],
    kind: "instruktion",
    uploaded: "2026-10-09",
    visibility: "medlemmar",
    size: "412 kB",
    pages: 4,
    announced: { category: "Funktionärer", newsSlug: "funktionarer-jamjohalvan" },
  }),
  doc({
    title: "Jämjöhalvan – banskiss",
    slug: "jamjohalvan-banskiss",
    folder: ["lopp"],
    kind: "underlag",
    uploaded: "2026-09-30",
    visibility: "alla",
    size: "1,8 MB",
    pages: 1,
  }),

  doc({
    title: "Budget 2027 – utkast",
    slug: "budget-2027-utkast",
    folder: ["styrelsen"],
    kind: "underlag",
    uploaded: "2026-10-20",
    visibility: "styrelsen",
    size: "88 kB",
    pages: 2,
  }),
  doc({
    title: "Verksamhetsplan 2027 – utkast",
    slug: "verksamhetsplan-2027-utkast",
    folder: ["styrelsen"],
    kind: "underlag",
    uploaded: "2026-10-20",
    visibility: "styrelsen",
    size: "74 kB",
    pages: 2,
  }),
];

/** The archive until the board changes it. */
export const seedArchive = (): DocArchive => ({ root: rootFolder, docs: documents });

// ───────────────────────── Access ─────────────────────────

const visibilityRank: Record<Visibility, number> = { alla: 0, medlemmar: 1, styrelsen: 2 };
const viewerRank: Record<Viewer, number> = { guest: 0, member: 1, board: 2 };

export function viewerOf(user: { role: "member" | "board" } | null): Viewer {
  return user ? (user.role === "board" ? "board" : "member") : "guest";
}

export function canSee(visibility: Visibility, viewer: Viewer) {
  return viewerRank[viewer] >= visibilityRank[visibility];
}

/** The most restrictive of the given visibilities (a folder limits its contents). */
export function strictest(...vs: Visibility[]): Visibility {
  return vs.reduce((a, b) => (visibilityRank[b] > visibilityRank[a] ? b : a), "alla");
}

/** Whether `v` is more open than `limit` (e.g. "alla" inside a members-only folder). */
export const moreOpen = (v: Visibility, limit: Visibility) => visibilityRank[v] < visibilityRank[limit];

// ───────────────────────── Paths ─────────────────────────

export type Crumb = { title: string; href: string };

export function folderHref(path: string[]) {
  return path.length ? `/dokument/${path.join("/")}` : "/dokument";
}

export function docHref(d: DocRef) {
  return `/dokument/${[...d.folder, d.slug].join("/")}`;
}

/** The PDF itself (opens in the browser's viewer). Access is checked like the page. */
export function docFileHref(d: DocRef, { download = false } = {}) {
  return `/filer/dokument/${[...d.folder, d.slug].join("/")}.pdf${download ? "?ladda-ner" : ""}`;
}

export function samePath(a: string[], b: string[]) {
  return a.length === b.length && a.every((s, i) => s === b[i]);
}

export function startsWith(path: string[], prefix: string[]) {
  return prefix.every((s, i) => path[i] === s);
}

/** The folders from the root down to `path` (root included), or null. */
export function folderTrail(root: DocFolder, path: string[]): DocFolder[] | null {
  const trail = [root];
  for (const seg of path) {
    const next = trail[trail.length - 1].folders?.find((f) => f.slug === seg);
    if (!next) return null;
    trail.push(next);
  }
  return trail;
}

/** Breadcrumbs for a folder trail ("Dokument › Protokoll › Styrelsemöte 2026"). */
export function crumbsFor(titles: string[], path: string[]): Crumb[] {
  return titles.map((title, i) => ({ title, href: folderHref(path.slice(0, i)) }));
}

/** "Protokoll › Styrelsemöte 2026" for a folder path (root left out). */
export function folderLabel(root: DocFolder, path: string[]) {
  return (folderTrail(root, path) ?? [])
    .slice(1)
    .map((f) => f.title)
    .join(" › ");
}

/** A folder's effective visibility: the strictest along its trail. */
export function folderVisibility(root: DocFolder, path: string[]) {
  return strictest(...(folderTrail(root, path) ?? []).map((f) => f.visibility));
}

/** A document's effective visibility: its own, narrowed by every folder above it. */
export function effectiveVisibility(root: DocFolder, d: Pick<DocFile, "folder" | "visibility">) {
  return strictest(d.visibility, folderVisibility(root, d.folder));
}

/** Every folder below the root, depth first, with its path — for folder pickers. */
export function allFolders(root: DocFolder) {
  const out: { path: string[]; titles: string[]; folder: DocFolder }[] = [];
  const walk = (f: DocFolder, path: string[], titles: string[]) => {
    for (const sub of f.folders ?? []) {
      const p = [...path, sub.slug];
      const t = [...titles, sub.title];
      out.push({ path: p, titles: t, folder: sub });
      walk(sub, p, t);
    }
  };
  walk(root, [], []);
  return out;
}

export type Resolved =
  | { kind: "folder"; folder: DocFolder; path: string[]; trail: DocFolder[]; visibility: Visibility }
  | { kind: "document"; doc: DocFile; path: string[]; trail: DocFolder[]; visibility: Visibility };

/** Resolve a URL path under /dokument to a folder or a document. */
export function resolveDocumentPath({ root, docs }: DocArchive, segments: string[]): Resolved | null {
  const trail = folderTrail(root, segments);
  if (trail) {
    return {
      kind: "folder",
      folder: trail[trail.length - 1],
      path: segments,
      trail,
      visibility: strictest(...trail.map((f) => f.visibility)),
    };
  }
  const folderPath = segments.slice(0, -1);
  const parentTrail = folderTrail(root, folderPath);
  const d = parentTrail && docs.find((x) => x.slug === segments.at(-1) && samePath(x.folder, folderPath));
  if (!parentTrail || !d) return null;
  return { kind: "document", doc: d, path: segments, trail: parentTrail, visibility: effectiveVisibility(root, d) };
}

const newestFirst = (a: DocFile, b: DocFile) => b.uploaded.localeCompare(a.uploaded) || b.slug.localeCompare(a.slug);

/** Documents directly in a folder, newest first. */
export function documentsIn(docs: DocFile[], path: string[]) {
  return docs.filter((d) => samePath(d.folder, path)).sort(newestFirst);
}

/** Documents anywhere below `path` that the viewer may open. */
export function visibleBelow({ root, docs }: DocArchive, path: string[], viewer: Viewer) {
  return docs.filter((d) => startsWith(d.folder, path) && canSee(effectiveVisibility(root, d), viewer));
}

/** What a viewer sees in a folder, plus how much more a member login would show. */
export function listFolder(archive: DocArchive, path: string[], viewer: Viewer) {
  const { root, docs } = archive;
  const trail = folderTrail(root, path);
  if (!trail) return null;
  const folder = trail[trail.length - 1];
  const folders = (folder.folders ?? [])
    .filter((f) => canSee(f.visibility, viewer))
    .map((f) => {
      const p = [...path, f.slug];
      const inside = visibleBelow(archive, p, viewer);
      return {
        folder: f,
        path: p,
        count: inside.length,
        latest: inside.reduce<string | null>((m, d) => (!m || d.uploaded > m ? d.uploaded : m), null),
      };
    });
  const inHere = documentsIn(docs, path).filter((d) => canSee(effectiveVisibility(root, d), viewer));
  // Guests get a hint about members-only material; nobody is told about the
  // board's own folder.
  const membersOnly =
    viewer === "guest"
      ? docs.filter((d) => startsWith(d.folder, path) && effectiveVisibility(root, d) === "medlemmar").length
      : 0;
  return { folder, trail, folders, docs: inHere, membersOnly };
}

/** The newest documents the viewer may open, across all folders. */
export function latestDocuments(archive: DocArchive, viewer: Viewer, limit = 4) {
  return visibleBelow(archive, [], viewer).sort(newestFirst).slice(0, limit);
}

/** Whether a folder already holds a folder or document with this slug. */
export function slugTaken({ root, docs }: { root: DocFolder; docs: DocRef[] }, path: string[], slug: string) {
  const folder = folderTrail(root, path)?.at(-1);
  return !!folder?.folders?.some((f) => f.slug === slug) || docs.some((d) => d.slug === slug && samePath(d.folder, path));
}

// ───────────────────────── Upload (admin) ─────────────────────────

export type ProtocolTemplate = "styrelse" | "arsmote" | "ovrigt";

export const protocolTemplates: { id: ProtocolTemplate; label: string }[] = [
  { id: "styrelse", label: "Styrelseprotokoll" },
  { id: "arsmote", label: "Årsmötesprotokoll" },
  { id: "ovrigt", label: "Övrigt" },
];

/** "12 oktober 2026" */
export function longDateWithYear(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${monthsLong[m - 1]} ${y}`;
}

/**
 * Where an uploaded protocol ends up and what it is called, derived from the
 * template and the meeting date: Styrelseprotokoll 2026-10-12 → "Styrelsemöte
 * 2026-10-12" in Protokoll › Styrelsemöte 2026. Missing folders are created.
 */
export function protocolTarget(
  { root, docs }: { root: DocFolder; docs: DocRef[] },
  template: ProtocolTemplate,
  date: string,
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const year = date.slice(0, 4);
  const long = longDateWithYear(date);
  const t = {
    styrelse: {
      sub: { slug: `styrelsemote-${year}`, title: `Styrelsemöte ${year}` },
      title: `Styrelsemöte ${date}`,
      fileName: `Protokoll styrelsemöte ${date}.pdf`,
      newsTitle: `Nytt protokoll: styrelsemöte ${long}`,
      createNote: "årsmappen skapas automatiskt",
    },
    arsmote: {
      sub: { slug: "arsmote", title: "Årsmöte" },
      title: `Årsmöte ${date}`,
      fileName: `Protokoll årsmöte ${date}.pdf`,
      newsTitle: `Nytt protokoll: årsmöte ${long}`,
      createNote: "mappen skapas automatiskt",
    },
    ovrigt: {
      sub: { slug: "ovrigt", title: "Övrigt" },
      title: `Protokoll ${date}`,
      fileName: `Protokoll ${date}.pdf`,
      newsTitle: `Nytt protokoll: möte ${long}`,
      createNote: "mappen skapas automatiskt",
    },
  }[template];
  const top = { slug: "protokoll", title: "Protokoll" };
  const folder = [top.slug, t.sub.slug];
  // Existing folders keep the title the board gave them.
  const trail = folderTrail(root, folder);
  const topTitle = root.folders?.find((f) => f.slug === top.slug)?.title ?? top.title;
  return {
    folder,
    folderTitles: trail ? trail.slice(1).map((f) => f.title) : [topTitle, t.sub.title],
    title: t.title,
    slug: date,
    fileName: t.fileName,
    href: docHref({ folder, slug: date }),
    newsTitle: t.newsTitle,
    /** Shown when the folder doesn't exist yet. */
    createNote: trail ? null : t.createNote,
    exists: docs.some((d) => d.slug === date && samePath(d.folder, folder)),
  };
}
