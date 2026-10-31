"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Breadcrumbs, VisibilityBadge } from "@/components/documents/bits";
import { CopyLinkButton } from "@/components/documents/CopyLinkButton";
import { uploadedSubfolders, uploadsIn, useHydrated, useUploadedDocs } from "@/components/documents/uploads";
import {
  docHref,
  folderHref,
  samePath,
  type DocFile,
  type UploadedDoc,
  type Visibility,
} from "@/lib/data/documents";
import { DocumentsTable, type AdminRow } from "./DocumentsTable";
import { UploadForm } from "./UploadForm";

/** Admin URL of a folder; the root has its own alias since /admin/dokument opens the working folder. */
export function adminFolderHref(path: string[]) {
  return path.length ? `/admin/dokument/${path.join("/")}` : "/admin/dokument/mappar";
}

export type AdminFolder = {
  titles: string[];
  visibility: Visibility;
  folders: {
    slug: string;
    title: string;
    path: string[];
    count: number;
    latestLabel: string | null;
    visibility: Visibility;
  }[];
  docs: DocFile[];
};

const announcedLabel = (d: DocFile) => (d.announced ? `Nyhet · ${d.announced.category}` : undefined);

/**
 * Drawup 09: the folder's documents on the left, "Ladda upp protokoll" on the
 * right. Static documents come from the server; demo uploads from this
 * browser are merged in on top.
 */
export function DocumentsWorkspace({
  path,
  folder,
  highlight,
  today,
  userId,
}: {
  path: string[];
  /** Null for a folder that only exists through demo uploads (e.g. next year's). */
  folder: AdminFolder | null;
  highlight?: string;
  today: string;
  userId: string;
}) {
  const router = useRouter();
  const hydrated = useHydrated();
  const [uploads] = useUploadedDocs();
  const [fresh, setFresh] = useState<string | null>(highlight ?? null);

  // Arrived here from an upload into another folder: drop ?ny= from the URL
  // once the row has been highlighted, so a reload doesn't replay it.
  useEffect(() => {
    if (highlight) window.history.replaceState(null, "", window.location.pathname);
  }, [highlight]);

  const mine = uploadsIn(uploads, path).sort((a, b) => b.uploaded.localeCompare(a.uploaded));
  const titles = folder?.titles ?? (mine[0] ? ["Dokument", ...mine[0].folderTitles] : null);

  if (!titles) {
    return (
      <div className="flex flex-col items-start gap-4 px-4 py-8 md:px-6">
        {hydrated ? (
          <>
            <h1 className="m-0 text-[28px] font-extrabold">Mappen finns inte</h1>
            <p className="m-0 text-muted">Den kan ha tagits bort, eller så har demon återställts.</p>
            <Link href="/admin/dokument/mappar" className="btn btn-dark">
              Till alla mappar
            </Link>
          </>
        ) : (
          <span className="h-10 w-72 rounded bg-line motion-safe:animate-pulse" aria-hidden="true" />
        )}
      </div>
    );
  }

  const visibility = folder?.visibility ?? "medlemmar";
  const title = titles[titles.length - 1];
  const crumbs = titles.slice(0, -1).map((t, i) => ({ title: t, href: adminFolderHref(path.slice(0, i)) }));

  const newFolders = uploadedSubfolders(uploads, path, folder?.folders.map((f) => f.slug) ?? []);
  const rows: AdminRow[] = [
    ...newFolders.map(
      (f): AdminRow => ({
        kind: "folder",
        id: `folder:${f.slug}`,
        title: f.title,
        adminHref: adminFolderHref([...path, f.slug]),
        publicHref: folderHref([...path, f.slug]),
        count: f.count,
        latestLabel: "i dag",
        visibility: "medlemmar",
      }),
    ),
    ...(folder?.folders ?? []).map(
      (f): AdminRow => ({
        kind: "folder",
        id: `folder:${f.slug}`,
        title: f.title,
        adminHref: adminFolderHref(f.path),
        publicHref: folderHref(f.path),
        count: f.count + uploadsIn(uploads, f.path).length,
        latestLabel: f.latestLabel,
        visibility: f.visibility,
      }),
    ),
    ...[...mine, ...(folder?.docs ?? [])].map(
      (d): AdminRow => ({
        kind: "doc",
        id: d.id,
        title: d.title,
        publicHref: docHref(d),
        uploadedLabel: d.uploadedLabel,
        announced: announcedLabel(d),
        visibility: d.visibility,
        demo: "demo" in d,
      }),
    ),
  ];

  function onUploaded(doc: UploadedDoc) {
    if (samePath(doc.folder, path)) setFresh(doc.id);
    else router.push(`${adminFolderHref(doc.folder)}?ny=${encodeURIComponent(doc.id)}`);
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 md:px-6 md:pt-6">
      <Breadcrumbs crumbs={crumbs} current={title} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3" data-reveal>
          <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.5px] md:text-[30px]">{title}</h1>
          {path.length > 0 && <VisibilityBadge visibility={visibility} />}
        </div>
        <CopyLinkButton href={folderHref(path)} label="Kopiera länk till mappen" variant="outline" icon />
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <DocumentsTable
          rows={rows}
          folderVisibility={visibility}
          freshId={fresh}
          className="flex-[3_1_460px]"
        />
        <UploadForm today={today} userId={userId} onUploaded={onUploaded} className="flex-[2_1_360px]" />
      </div>
    </div>
  );
}
