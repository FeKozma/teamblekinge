import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoPathFallback, DemoUploadFolders, DemoUploadRows } from "@/components/documents/DemoUploads";
import { Toaster } from "@/components/documents/Toaster";
import {
  DocRow,
  DocumentView,
  FolderCard,
  FolderView,
  LoginGate,
  MembersHint,
  type FolderCardData,
} from "@/components/documents/views";
import { Page, PageHero, SectionHeading } from "@/components/ui";
import {
  canSee,
  crumbsFor,
  documentsIn,
  effectiveVisibility,
  folderHref,
  latestDocuments,
  listFolder,
  resolveDocumentPath,
  rootFolder,
  uploadLabel,
  viewerOf,
  type DocFile,
  type Viewer,
} from "@/lib/data/documents";
import { getSession } from "@/lib/session";

type Props = PageProps<"/dokument/[[...path]]">;

const withEffective = (d: DocFile) => ({ ...d, effective: effectiveVisibility(d) });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path = [] } = await params;
  const r = resolveDocumentPath(path);
  if (!r || !path.length) return { title: "Dokument" };
  const viewer = viewerOf(await getSession());
  const name = r.kind === "document" ? r.doc.title : r.folder.title;
  return {
    // Board-only titles stay hidden from everyone else, even in the tab.
    title: canSee(r.visibility, viewer) || r.visibility === "medlemmar" ? name : "Dokument",
    robots: r.visibility === "alla" ? undefined : { index: false },
  };
}

export default async function DocumentsPage({ params }: Props) {
  const { path = [] } = await params;
  const viewer = viewerOf(await getSession());
  const here = folderHref(path);
  const loginHref = `/logga-in?next=${here}`;
  const r = resolveDocumentPath(path);

  if (!r) {
    // Unknown on the server, but it may be a protocol uploaded in the admin
    // demo (only this browser knows) — let the client have a look.
    if (rootFolder.folders?.some((f) => f.slug === path[0])) {
      return (
        <Page>
          <DemoPathFallback segments={path} viewer={viewer} />
          <Toaster aboveTabBar />
        </Page>
      );
    }
    notFound();
  }

  const titles = r.trail.map((f) => f.title);
  const folderPath = r.kind === "document" ? r.doc.folder : r.path;

  if (!canSee(r.visibility, viewer)) {
    // Members are never told about board-only material.
    if (viewer !== "guest") notFound();
    const boardOnly = r.visibility === "styrelsen";
    const crumbs = boardOnly ? crumbsFor(["Dokument"], []) : crumbsFor(titles, folderPath);
    const title = boardOnly ? undefined : r.kind === "document" ? r.doc.title : r.folder.title;
    return (
      <Page>
        <LoginGate
          crumbs={r.kind === "folder" && !boardOnly ? crumbs.slice(0, -1) : crumbs}
          title={title}
          what={r.kind === "document" ? "dokument" : "mapp"}
          boardOnly={boardOnly}
          kind={r.kind === "document" ? r.doc.kind : "protokoll"}
          pages={r.kind === "document" ? r.doc.pages : 3}
          loginHref={loginHref}
        />
      </Page>
    );
  }

  if (r.kind === "document") {
    const siblings = documentsIn(r.doc.folder)
      .filter((d) => d.id !== r.doc.id && canSee(effectiveVisibility(d), viewer))
      .slice(0, 4)
      .map(withEffective);
    return (
      <Page>
        <DocumentView
          doc={r.doc}
          crumbs={crumbsFor(titles, folderPath)}
          folderPathLabel={titles.slice(1).join(" › ")}
          folderLink={folderHref(folderPath)}
          visibility={r.visibility}
          siblings={siblings}
        />
        <Toaster aboveTabBar />
      </Page>
    );
  }

  const listing = listFolder(r.path, viewer)!;
  const folders: FolderCardData[] = listing.folders.map((f) => ({
    title: f.folder.title,
    description: f.folder.description,
    visibility: f.folder.visibility,
    path: f.path,
    count: f.count,
    latestLabel: f.latest && uploadLabel(f.latest),
  }));

  if (!r.path.length) {
    return (
      <Page>
        <RootView viewer={viewer} folders={folders} membersOnly={listing.membersOnly} loginHref={loginHref} />
      </Page>
    );
  }

  return (
    <Page>
      <FolderView
        title={r.folder.title}
        description={r.folder.description}
        crumbs={crumbsFor(titles, r.path).slice(0, -1)}
        visibility={r.visibility}
        path={r.path}
        folders={folders}
        docs={listing.docs.map(withEffective)}
        membersOnly={listing.membersOnly}
        loginHref={loginHref}
        extraFolders={
          r.path[0] === "protokoll" && r.path.length === 1 ? (
            <DemoUploadFolders
              path={r.path}
              known={(r.folder.folders ?? []).map((f) => f.slug)}
              viewer={viewer}
            />
          ) : undefined
        }
        extraRows={<DemoUploadRows path={r.path} viewer={viewer} folderVisibility={r.visibility} />}
      />
      <Toaster aboveTabBar />
    </Page>
  );
}

function RootView({
  viewer,
  folders,
  membersOnly,
  loginHref,
}: {
  viewer: Viewer;
  folders: FolderCardData[];
  membersOnly: number;
  loginHref: string;
}) {
  const latest = latestDocuments(viewer, 4).map(withEffective);
  return (
    <>
      <PageHero
        kicker="Dokument"
        title="Protokoll, policys och stadgar"
        intro={
          viewer === "guest"
            ? "Föreningens styrdokument samlade på ett ställe. Protokollen från styrelsemöten och årsmöten är för medlemmar – logga in så ser du dem."
            : "Föreningens protokoll och styrdokument samlade på ett ställe. Dela gärna länkar: den som inte är inloggad loggar in och hamnar direkt rätt."
        }
      />
      <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-4 pt-4 pb-16 md:px-6">
        <section className="flex flex-col gap-5" aria-labelledby="mappar">
          <SectionHeading>
            <span id="mappar">Mappar</span>
          </SectionHeading>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">
            {folders.map((f, i) => (
              <FolderCard key={f.path.join("/")} f={f} i={i} />
            ))}
          </div>
          {membersOnly > 0 && (
            <MembersHint count={membersOnly} loginHref={loginHref} example="styrelsens protokoll" />
          )}
        </section>

        {latest.length > 0 && (
          <section className="flex flex-col gap-5" aria-labelledby="senast">
            <SectionHeading tone="purple">
              <span id="senast">Senast uppladdat</span>
            </SectionHeading>
            <ul
              className="card m-0 list-none divide-y divide-line overflow-hidden p-0"
              data-reveal="up"
              style={{ "--reveal-i": 1 } as CSSProperties}
            >
              {latest.map((d) => (
                <DocRow key={d.id} doc={d} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
