import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireBoard } from "@/components/admin/access";
import { DocumentsWorkspace, type AdminFolder } from "@/components/admin/DocumentsWorkspace";
import { Page } from "@/components/ui";
import { folderTrail, listFolder, strictest, uploadLabel } from "@/lib/data/documents";
import { todayISO } from "@/lib/format";

type Props = PageProps<"/admin/dokument/[[...path]]">;

/** /admin/dokument opens the board's everyday folder: this year's board meetings. */
function workingFolder(today: string) {
  const path = ["protokoll", `styrelsemote-${today.slice(0, 4)}`];
  return folderTrail(path) ? path : ["protokoll", "styrelsemote-2026"];
}

/** /admin/dokument → working folder, /admin/dokument/mappar → the root, else the folder itself. */
function segmentsFor(path: string[] | undefined, today: string) {
  if (!path?.length) return workingFolder(today);
  if (path.length === 1 && path[0] === "mappar") return [];
  return path;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const trail = folderTrail(segmentsFor(path, todayISO()));
  return { title: trail && trail.length > 1 ? `${trail[trail.length - 1].title} – Dokument` : "Dokument" };
}

export default async function AdminDocumentsPage({ params, searchParams }: Props) {
  const user = await requireBoard();
  if (!user) return null;
  const { path } = await params;
  const { ny } = await searchParams;
  const today = todayISO();
  const segments = segmentsFor(path, today);

  const listing = listFolder(segments, "board");
  // Unknown folders under Protokoll may have been "created automatically" by a
  // demo upload — the client checks. Anything else is a 404.
  if (!listing && segments[0] !== "protokoll") notFound();

  const folder: AdminFolder | null = listing && {
    titles: listing.trail.map((f) => f.title),
    visibility: strictest(...listing.trail.map((f) => f.visibility)),
    folders: listing.folders.map((f) => ({
      slug: f.folder.slug,
      title: f.folder.title,
      path: f.path,
      count: f.count,
      latestLabel: f.latest && uploadLabel(f.latest),
      visibility: f.folder.visibility,
    })),
    docs: listing.docs,
  };

  return (
    <Page className="min-w-0 flex-1 pb-12!">
      <DocumentsWorkspace
        key={segments.join("/")}
        path={segments}
        folder={folder}
        highlight={typeof ny === "string" ? ny : undefined}
        today={today}
        userId={user.id}
      />
    </Page>
  );
}
