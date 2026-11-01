import Link from "next/link";
import { IconPencil, IconPlus, IconUpload } from "@/components/icons";
import { Breadcrumbs, VisibilityBadge } from "@/components/documents/bits";
import { CopyLinkButton } from "@/components/documents/CopyLinkButton";
import {
  docFileHref,
  docHref,
  effectiveVisibility,
  folderHref,
  folderVisibility,
  listFolder,
  uploadLabel,
  type DocArchive,
} from "@/lib/data/documents";
import { DocumentsTable, type AdminRow } from "./DocumentsTable";
import { FlashToast } from "./FlashToast";
import { adminDocHref, adminEditFolderHref, adminFolderHref, adminNewFolderHref, adminUploadHref } from "./links";
import { UploadForm } from "./UploadForm";

/**
 * Drawup 09: a folder's subfolders and documents on the left, the quick
 * "Ladda upp protokoll" on the right, and buttons for everything else
 * (any PDF, new folder, the folder's own settings).
 */
export function DocumentsWorkspace({
  archive,
  path,
  today,
  highlight,
  flash,
}: {
  archive: DocArchive;
  path: string[];
  today: string;
  /** A document id to highlight (just uploaded). */
  highlight?: string;
  /** A toast for what just happened (upload, delete …). */
  flash?: string;
}) {
  const listing = listFolder(archive, path, "board")!;
  const titles = listing.trail.map((f) => f.title);
  const visibility = folderVisibility(archive.root, path);
  const title = titles[titles.length - 1];
  const crumbs = titles.slice(0, -1).map((t, i) => ({ title: t, href: adminFolderHref(path.slice(0, i)) }));

  const rows: AdminRow[] = [
    ...listing.folders.map(
      (f): AdminRow => ({
        kind: "folder",
        id: `folder:${f.folder.slug}`,
        title: f.folder.title,
        adminHref: adminFolderHref(f.path),
        editHref: adminEditFolderHref(f.path),
        publicHref: folderHref(f.path),
        count: f.count,
        latestLabel: f.latest && uploadLabel(f.latest),
        visibility: f.folder.visibility,
      }),
    ),
    ...listing.docs.map(
      (d): AdminRow => ({
        kind: "doc",
        id: d.id,
        title: d.title,
        adminHref: adminDocHref(d),
        publicHref: docHref(d),
        pdfHref: docFileHref(d),
        uploadedLabel: uploadLabel(d.uploaded),
        announced: d.announced && `Nyhet · ${d.announced.category}`,
        visibility: effectiveVisibility(archive.root, d),
      }),
    ),
  ];

  return (
    <div className="flex flex-col gap-5 px-4 pt-5 md:px-6 md:pt-6">
      {flash && <FlashToast message={flash} />}
      <Breadcrumbs crumbs={[{ title: "Administration", href: "/admin" }, ...crumbs]} current={title} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3" data-reveal>
          <h1 className="m-0 flex items-center gap-3.5 text-[28px] leading-tight font-extrabold tracking-[-0.5px] md:text-[30px]">
            <span aria-hidden="true" className="skew-bar bg-orange" />
            {title}
          </h1>
          {path.length > 0 && <VisibilityBadge visibility={visibility} />}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={adminUploadHref(path)} className="btn btn-dark">
            <IconUpload size={18} /> Ladda upp dokument
          </Link>
          <Link href={adminNewFolderHref(path)} className="btn btn-outline bg-white">
            <IconPlus size={18} /> Ny mapp
          </Link>
          {path.length > 0 && (
            <Link href={adminEditFolderHref(path)} className="btn btn-outline bg-white">
              <IconPencil size={16} /> Ändra mappen
            </Link>
          )}
          <CopyLinkButton href={folderHref(path)} label="Kopiera länk" what="mappen" variant="outline" icon />
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <DocumentsTable rows={rows} folderVisibility={visibility} freshId={highlight} className="flex-[3_1_460px]" />
        <UploadForm
          today={today}
          archive={{ root: archive.root, docs: archive.docs.map((d) => ({ folder: d.folder, slug: d.slug })) }}
          className="flex-[2_1_360px]"
        />
      </div>
    </div>
  );
}
