import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/documents/Toaster";
import {
  DocRow,
  DocumentView,
  FolderCard,
  FolderView,
  LoginGate,
  MembersHint,
  UploadButton,
  type FolderCardData,
} from "@/components/documents/views";
import { Page, PageHero, SectionHeading } from "@/components/ui";
import { getArchive } from "@/lib/content/documents";
import { getNews } from "@/lib/content/news";
import { getPageTexts } from "@/lib/content/pages";
import {
  canSee,
  crumbsFor,
  documentsIn,
  effectiveVisibility,
  folderHref,
  kindLabels,
  latestDocuments,
  listFolder,
  resolveDocumentPath,
  uploadLabel,
  viewerOf,
  type DocArchive,
  type DocFile,
  type Viewer,
} from "@/lib/data/documents";
import { getSession } from "@/lib/session";

type Props = PageProps<"/dokument/[[...path]]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path = [] } = await params;
  const r = resolveDocumentPath(await getArchive(), path);
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
  const [archive, user] = await Promise.all([getArchive(), getSession()]);
  const viewer = viewerOf(user);
  const loginHref = `/logga-in?next=${folderHref(path)}`;
  const r = resolveDocumentPath(archive, path);
  if (!r) notFound();

  const withEffective = (d: DocFile) => ({ ...d, effective: effectiveVisibility(archive.root, d) });
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
          label={r.kind === "document" ? kindLabels[r.doc.kind] : undefined}
          loginHref={loginHref}
        />
      </Page>
    );
  }

  if (r.kind === "document") {
    const siblings = documentsIn(archive.docs, r.doc.folder)
      .filter((d) => d.id !== r.doc.id && canSee(effectiveVisibility(archive.root, d), viewer))
      .slice(0, 4)
      .map(withEffective);
    const newsSlug = r.doc.announced?.newsSlug;
    const news = newsSlug ? await getNews(newsSlug) : undefined;
    return (
      <Page>
        <DocumentView
          doc={r.doc}
          crumbs={crumbsFor(titles, folderPath)}
          folderPathLabel={titles.slice(1).join(" › ")}
          folderLink={folderHref(folderPath)}
          visibility={r.visibility}
          siblings={siblings}
          newsHref={news && (!news.membersOnly || viewer !== "guest") ? `/nyheter/${news.slug}` : undefined}
        />
        <Toaster aboveTabBar />
      </Page>
    );
  }

  const listing = listFolder(archive, r.path, viewer)!;
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
        <RootView
          archive={archive}
          viewer={viewer}
          folders={folders}
          membersOnly={listing.membersOnly}
          loginHref={loginHref}
        />
        <Toaster aboveTabBar />
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
        board={viewer === "board"}
      />
      <Toaster aboveTabBar />
    </Page>
  );
}

async function RootView({
  archive,
  viewer,
  folders,
  membersOnly,
  loginHref,
}: {
  archive: DocArchive;
  viewer: Viewer;
  folders: FolderCardData[];
  membersOnly: number;
  loginHref: string;
}) {
  const t = await getPageTexts("dokument");
  const latest = latestDocuments(archive, viewer, 4).map((d) => ({
    ...d,
    effective: effectiveVisibility(archive.root, d),
  }));
  return (
    <>
      <PageHero
        kicker={t("hero.kicker")}
        title={t("hero.title")}
        intro={viewer === "guest" ? t("hero.introGuest") : t("hero.introMember")}
      >
        {viewer === "board" && (
          <div className="run-in mt-2 flex" style={{ "--i": 3 } as CSSProperties}>
            <UploadButton path={[]} onDark />
          </div>
        )}
      </PageHero>
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
