"use client";

import {
  canSee,
  crumbsFor,
  documentsIn,
  effectiveVisibility,
  folderHref,
  folderTrail,
  samePath,
  strictest,
  type Viewer,
  type Visibility,
} from "@/lib/data/documents";
import { uploadedSubfolders, uploadsIn, useHydrated, useUploadedDocs } from "./uploads";
import {
  DocRow,
  DocumentView,
  FolderCard,
  FolderView,
  LoginGate,
  NotFoundHere,
  ViewSkeleton,
  type ViewDoc,
} from "./views";

// The public pages are rendered on the server from the data files. Protocols
// uploaded in the admin demo exist only in this browser, so these client
// pieces slot them in: extra rows in a folder, extra year folders, and whole
// pages for paths the server doesn't know.

export function DemoUploadRows({
  path,
  viewer,
  folderVisibility,
}: {
  path: string[];
  viewer: Viewer;
  folderVisibility: Visibility;
}) {
  const [uploads] = useUploadedDocs();
  return uploadsIn(uploads, path)
    .filter((u) => canSee(u.visibility, viewer))
    .map((u) => <DocRow key={u.id} doc={u} folderVisibility={folderVisibility} />);
}

export function DemoUploadFolders({
  path,
  known,
  viewer,
}: {
  path: string[];
  known: string[];
  viewer: Viewer;
}) {
  const [uploads] = useUploadedDocs();
  const visible = uploads.filter((u) => canSee(u.visibility, viewer));
  return uploadedSubfolders(visible, path, known).map((f, i) => (
    <FolderCard
      key={f.slug}
      i={i + 1}
      f={{ title: f.title, visibility: "medlemmar", path: [...path, f.slug], count: f.count, latestLabel: "i dag" }}
    />
  ));
}

/** A /dokument path the server couldn't resolve — maybe it's a demo upload. */
export function DemoPathFallback({ segments, viewer }: { segments: string[]; viewer: Viewer }) {
  const [uploads] = useUploadedDocs();
  const hydrated = useHydrated();
  if (!hydrated) return <ViewSkeleton />;

  const here = folderHref(segments);
  const loginHref = `/logga-in?next=${here}`;
  const folderPath = segments.slice(0, -1);

  const doc = uploads.find((u) => u.slug === segments.at(-1) && samePath(u.folder, folderPath));
  if (doc) {
    const crumbs = crumbsFor(["Dokument", ...doc.folderTitles], doc.folder);
    const trail = folderTrail(doc.folder);
    const visibility = strictest(doc.visibility, ...(trail ?? []).map((f) => f.visibility));
    if (!canSee(visibility, viewer)) {
      return viewer === "guest" ? (
        <LoginGate
          crumbs={crumbs}
          title={visibility === "medlemmar" ? doc.title : undefined}
          boardOnly={visibility === "styrelsen"}
          what="dokument"
          pages={doc.pages}
          loginHref={loginHref}
        />
      ) : (
        <NotFoundHere />
      );
    }
    const siblings: ViewDoc[] = [
      ...uploadsIn(uploads, doc.folder).filter((u) => u.id !== doc.id && canSee(u.visibility, viewer)),
      ...documentsIn(doc.folder).filter((d) => canSee(effectiveVisibility(d), viewer)),
    ].slice(0, 4);
    return (
      <DocumentView
        doc={doc}
        crumbs={crumbs}
        folderPathLabel={doc.folderTitles.join(" › ")}
        folderLink={folderHref(doc.folder)}
        visibility={visibility}
        siblings={siblings}
      />
    );
  }

  // A year folder that was "created automatically" by a demo upload.
  const inside = uploadsIn(uploads, segments);
  if (inside.length) {
    const titles = ["Dokument", ...inside[0].folderTitles];
    const crumbs = crumbsFor(titles, segments).slice(0, -1);
    const visibility = strictest(...(folderTrail(folderPath) ?? []).map((f) => f.visibility), "medlemmar");
    if (!canSee(visibility, viewer)) {
      return viewer === "guest" ? (
        <LoginGate crumbs={crumbs} title={titles.at(-1)} what="mapp" loginHref={loginHref} />
      ) : (
        <NotFoundHere />
      );
    }
    return (
      <FolderView
        title={titles.at(-1) ?? ""}
        crumbs={crumbs}
        visibility={visibility}
        path={segments}
        folders={[]}
        docs={inside.filter((u) => canSee(u.visibility, viewer))}
        loginHref={loginHref}
      />
    );
  }

  return <NotFoundHere />;
}
