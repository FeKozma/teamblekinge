import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireBoard } from "@/components/admin/access";
import { DocumentEditor } from "@/components/admin/documents/DocumentEditor";
import { DocumentsWorkspace } from "@/components/admin/documents/DocumentsWorkspace";
import { flashFrom } from "@/components/admin/documents/options";
import { Page } from "@/components/ui";
import { getArchive } from "@/lib/content/documents";
import { folderTrail, resolveDocumentPath, type DocArchive } from "@/lib/data/documents";
import { todayISO } from "@/lib/format";

type Props = PageProps<"/admin/dokument/[[...path]]">;

/**
 * /admin/dokument → the board's everyday folder (this year's board meetings),
 * /admin/dokument/mappar → the root, otherwise a folder or a document (its
 * edit page) — the same path as on the public site.
 */
function segmentsFor(archive: DocArchive, path: string[] | undefined, today: string) {
  if (!path?.length) {
    const working = ["protokoll", `styrelsemote-${today.slice(0, 4)}`];
    return folderTrail(archive.root, working) ? working : [];
  }
  if (path.length === 1 && path[0] === "mappar") return [];
  return path;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const archive = await getArchive();
  const r = resolveDocumentPath(archive, segmentsFor(archive, path, todayISO()));
  if (!r || (r.kind === "folder" && !r.path.length)) return { title: "Dokument" };
  return { title: `${r.kind === "document" ? r.doc.title : r.folder.title} – Dokument` };
}

export default async function AdminDocumentsPage({ params, searchParams }: Props) {
  if (!(await requireBoard())) return null;
  const [{ path }, query, archive] = await Promise.all([params, searchParams, getArchive()]);
  const today = todayISO();
  const r = resolveDocumentPath(archive, segmentsFor(archive, path, today));
  if (!r) notFound();

  if (r.kind === "document") {
    return <DocumentEditor key={r.doc.id} archive={archive} doc={r.doc} flash={flashFrom(query)} />;
  }

  const highlight = typeof query.ny === "string" ? query.ny : undefined;
  const flash = flashFrom(query, (id) => {
    const d = archive.docs.find((x) => x.id === id);
    return d && (d.announced?.newsSlug ? `${d.title} är uppladdat och nyheten publicerad.` : `${d.title} är uppladdat.`);
  });
  return (
    <Page className="min-w-0 flex-1 pb-12!">
      <DocumentsWorkspace
        key={r.path.join("/")}
        archive={archive}
        path={r.path}
        today={today}
        highlight={highlight}
        flash={flash}
      />
    </Page>
  );
}
