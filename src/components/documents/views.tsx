import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { IconChevronRight, IconFolder, IconInfo, IconLock } from "@/components/icons";
import { SectionHeading, SpeedLines } from "@/components/ui";
import {
  docHref,
  folderHref,
  kindLabels,
  longDateWithYear,
  type Crumb,
  type DocFile,
  type DocKind,
  type Visibility,
} from "@/lib/data/documents";
import { people } from "@/lib/data/users";
import { Breadcrumbs, extOf, FileGlyph, VisibilityBadge } from "./bits";
import { CopyLinkButton } from "./CopyLinkButton";
import { DownloadButton } from "./DownloadButton";
import { PdfPreview } from "./PdfPreview";

// Presentational views for /dokument. No server-only APIs, so the client-side
// fallback for demo uploads can render exactly the same markup.

export type ViewDoc = DocFile & { demo?: true; summary?: string; effective?: Visibility };

export type FolderCardData = {
  title: string;
  description?: string;
  visibility: Visibility;
  path: string[];
  count: number;
  latestLabel?: string | null;
};

const SHARE_NOTE =
  "Länkarna fungerar i inlägg, mejl och Facebookgruppen. Den som inte är inloggad loggar in och hamnar sedan direkt på dokumentet.";

/** Small "Demo" marker on things that only exist in this browser. */
export function DemoTag() {
  return (
    <span
      title="Uppladdad i demon – finns bara i den här webbläsaren"
      className="inline-flex flex-none items-center rounded-full border border-dashed border-orange-dark/50 bg-orange-soft px-2 py-0.5 text-[11px] font-bold tracking-[0.3px] text-orange-dark uppercase"
    >
      Demo
    </span>
  );
}

/** `folderVisibility`: inside a folder, only flag documents that differ from it. */
export function DocRow({ doc, folderVisibility }: { doc: ViewDoc; folderVisibility?: Visibility }) {
  const visibility = doc.effective ?? doc.visibility;
  return (
    <li>
      <Link
        href={docHref(doc)}
        className="group flex items-center gap-3.5 px-4 py-3.5 text-ink no-underline transition-colors hover:bg-paper/70 hover:text-ink md:px-5"
      >
        <FileGlyph ext={extOf(doc.fileName)} size={42} />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="leading-snug font-bold underline-offset-2 group-hover:underline">{doc.title}</span>
            {doc.demo && <DemoTag />}
          </span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
            <span>
              Uppladdat {doc.uploadedLabel} · {doc.size}
            </span>
            {doc.announced && (
              <span className="font-semibold text-green">Nyhet · {doc.announced.category}</span>
            )}
            {visibility !== folderVisibility && (
              <VisibilityBadge visibility={visibility} className="py-0.5! text-[12px]!" />
            )}
          </span>
        </span>
        <IconChevronRight
          size={18}
          className="flex-none text-muted transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>
    </li>
  );
}

const cardTops = ["bg-orange", "bg-purple", "bg-ink"];

export function FolderCard({ f, i }: { f: FolderCardData; i: number }) {
  return (
    <Link
      href={folderHref(f.path)}
      data-settle
      style={{ "--rest-rotate": i % 2 ? "0.8deg" : "-0.8deg", "--reveal-i": i } as CSSProperties}
      className="straighten-hover card group relative flex min-h-[168px] flex-col gap-2 overflow-hidden p-5 pt-6 text-ink no-underline shadow-[0_6px_14px_rgba(34,30,31,0.08)] hover:text-ink"
    >
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 ${cardTops[i % 3]}`} />
      <span className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 -rotate-3 items-center justify-center rounded-lg bg-orange-soft text-orange-dark transition-transform duration-500 group-hover:rotate-0">
          <IconFolder size={22} />
        </span>
        <VisibilityBadge visibility={f.visibility} />
      </span>
      <span className="text-[19px] leading-tight font-extrabold">{f.title}</span>
      {f.description && <span className="text-[14px] text-muted">{f.description}</span>}
      <span className="mt-auto flex items-center gap-1.5 pt-1 text-[13px] font-semibold text-muted">
        {f.count === 1 ? "1 dokument" : `${f.count} dokument`}
        {f.latestLabel && ` · senast ${f.latestLabel}`}
        <span aria-hidden="true" className="ml-auto text-orange-dark transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}

/** For guests: how much more there is behind the login. */
export function MembersHint({
  count,
  loginHref,
  example,
}: {
  count: number;
  loginHref: string;
  /** E.g. "styrelsens protokoll" on the start page. */
  example?: string;
}) {
  return (
    <div
      data-reveal="up"
      className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-purple/40 bg-purple-soft p-4 md:p-5"
    >
      <span className="flex h-11 w-11 flex-none -rotate-3 items-center justify-center rounded-lg bg-purple text-white">
        <IconLock size={20} />
      </span>
      <p className="m-0 min-w-[200px] flex-1 text-[15px]">
        <strong>
          {count === 1 ? "1 dokument till är" : `${count} dokument till är`} bara för medlemmar
        </strong>
        {example && ` – till exempel ${example}`}. Logga in så ser du dem.
      </p>
      <Link href={loginHref} className="btn btn-dark">
        Logga in
      </Link>
    </div>
  );
}

export function FolderView({
  title,
  description,
  crumbs,
  visibility,
  path,
  folders,
  docs,
  membersOnly = 0,
  loginHref,
  extraFolders,
  extraRows,
}: {
  title: string;
  description?: string;
  /** Ancestors only; the folder itself is the current crumb. */
  crumbs: Crumb[];
  visibility: Visibility;
  path: string[];
  folders: FolderCardData[];
  docs: ViewDoc[];
  membersOnly?: number;
  loginHref: string;
  extraFolders?: ReactNode;
  extraRows?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pt-8 pb-16 md:px-6 md:pt-10">
      <Breadcrumbs crumbs={crumbs} current={title} />
      <div className="flex flex-wrap items-center justify-between gap-4" data-reveal>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 flex items-center gap-3.5 text-[30px] leading-tight font-extrabold tracking-[-0.8px] md:text-[38px]">
            <span aria-hidden="true" className="skew-bar bg-orange" />
            {title}
          </h1>
          <VisibilityBadge visibility={visibility} />
        </div>
        <CopyLinkButton href={folderHref(path)} label="Kopiera länk till mappen" variant="outline" icon />
      </div>
      {description && <p className="-mt-2 mb-0 max-w-[640px] text-[16px] text-muted">{description}</p>}

      {(folders.length > 0 || extraFolders) && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">
          {extraFolders}
          {folders.map((f, i) => (
            <FolderCard key={f.path.join("/")} f={f} i={i} />
          ))}
        </div>
      )}

      {docs.length > 0 ? (
        <section aria-label={`Dokument i ${title}`} className="card overflow-hidden" data-reveal="up">
          <ul className="m-0 list-none divide-y divide-line p-0">
            {extraRows}
            {docs.map((d) => (
              <DocRow key={d.id} doc={d} folderVisibility={visibility} />
            ))}
          </ul>
          <p className="m-0 flex gap-2.5 border-t border-line bg-paper/60 px-4 py-3 text-[13px] text-muted md:px-5">
            <IconInfo size={16} className="mt-0.5 flex-none" />
            {SHARE_NOTE}
          </p>
        </section>
      ) : (
        folders.length === 0 &&
        !extraFolders && <p className="card m-0 p-6 text-center text-muted">Här finns inga dokument ännu.</p>
      )}

      {membersOnly > 0 && <MembersHint count={membersOnly} loginHref={loginHref} />}
    </div>
  );
}

export function DocumentView({
  doc,
  crumbs,
  folderPathLabel,
  folderLink,
  visibility,
  siblings,
}: {
  doc: ViewDoc;
  /** All folders down to the document's own. */
  crumbs: Crumb[];
  folderPathLabel: string;
  folderLink: string;
  visibility: Visibility;
  siblings: ViewDoc[];
}) {
  const author = people[doc.uploadedBy]?.name;
  const folderTitle = crumbs[crumbs.length - 1]?.title ?? "mappen";
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 pt-8 pb-16 md:px-6 md:pt-10">
      <Breadcrumbs crumbs={crumbs} current={doc.title} />

      <div className="flex flex-wrap items-start gap-x-14 gap-y-10">
        <div className="flex min-w-0 flex-[1_1_300px] justify-center px-3 pt-2 md:justify-start md:px-0">
          <PdfPreview title={doc.title} kind={doc.kind} pages={doc.pages} />
        </div>

        <div className="flex min-w-0 flex-[1.25_1_340px] flex-col gap-5">
          <span className="run-in self-start bg-orange px-3 py-1 text-[13px] font-extrabold tracking-[1px] text-ink uppercase [rotate:-2deg]">
            {kindLabels[doc.kind]}
          </span>
          <h1
            className="run-in m-0 text-[32px] leading-[1.08] font-extrabold tracking-[-1px] md:text-[42px]"
            style={{ "--i": 1 } as CSSProperties}
          >
            {doc.title}
          </h1>
          <div className="run-in flex flex-wrap items-center gap-2" style={{ "--i": 2 } as CSSProperties}>
            <VisibilityBadge visibility={visibility} />
            {doc.demo && <DemoTag />}
          </div>
          {doc.summary && <p className="m-0 text-[17px]">{doc.summary}</p>}

          <dl
            className="card m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 p-5 text-[15px]"
            data-reveal="up"
          >
            <dt className="text-muted">Uppladdat</dt>
            <dd className="m-0 font-semibold">
              {longDateWithYear(doc.uploaded)}
              {author && <span className="font-normal text-muted"> av {author}</span>}
            </dd>
            <dt className="text-muted">Fil</dt>
            <dd className="m-0 break-words">
              {doc.fileName}
              <span className="text-muted">
                {" "}
                · {doc.size} · {doc.pages === 1 ? "1 sida" : `${doc.pages} sidor`}
              </span>
            </dd>
            <dt className="text-muted">Mapp</dt>
            <dd className="m-0">
              <Link href={folderLink} className="font-semibold">
                {folderPathLabel}
              </Link>
            </dd>
            {doc.announced && (
              <>
                <dt className="text-muted">Meddelat</dt>
                <dd className="m-0">
                  <span className="font-semibold text-green">Nyhet · {doc.announced.category}</span>
                  {doc.announced.newsSlug && (
                    <>
                      {" · "}
                      <Link href={`/nyheter/${doc.announced.newsSlug}`} className="font-semibold">
                        Läs nyheten
                      </Link>
                    </>
                  )}
                </dd>
              </>
            )}
          </dl>

          <div className="flex flex-wrap gap-3">
            <DownloadButton fileName={doc.fileName} size={doc.size} />
            <CopyLinkButton href={docHref(doc)} variant="outline" icon what={doc.title} />
          </div>
          <p className="m-0 flex gap-2.5 text-[14px] text-muted">
            <IconInfo size={18} className="mt-0.5 flex-none text-purple" />
            {visibility === "alla"
              ? "Dokumentet är öppet för alla – länken fungerar utan inloggning, i mejl, inlägg och Facebookgruppen."
              : "Dela länken i mejl, inlägg eller Facebookgruppen. Den som inte är inloggad loggar in och hamnar sedan direkt här."}
          </p>
        </div>
      </div>

      {siblings.length > 0 && (
        <section className="flex flex-col gap-4 pt-4">
          <SectionHeading tone="purple">Mer i {folderTitle}</SectionHeading>
          <ul className="card m-0 list-none divide-y divide-line overflow-hidden p-0" data-reveal="up">
            {siblings.map((d) => (
              <DocRow key={d.id} doc={d} folderVisibility={visibility} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/**
 * Members-only (or board-only) content for a guest: the drawup's promise —
 * log in and land right on the document.
 */
export function LoginGate({
  crumbs,
  title,
  what,
  boardOnly = false,
  kind = "protokoll",
  pages = 3,
  loginHref,
}: {
  crumbs: Crumb[];
  /** Shown for members-only material; left out for board-only. */
  title?: string;
  what: "dokument" | "mapp";
  boardOnly?: boolean;
  kind?: DocKind;
  pages?: number;
  loginHref: string;
}) {
  const heading = title ?? (what === "mapp" ? "Logga in för att se mappen" : "Logga in för att se dokumentet");
  const text = boardOnly
    ? `${what === "mapp" ? "Mappen" : "Dokumentet"} är inte öppet för alla. Logga in så hamnar du direkt rätt, om ditt konto har behörighet.`
    : `${what === "mapp" ? "Mappen" : "Dokumentet"} är bara för föreningens medlemmar. Logga in med din e-postadress – du hamnar sedan direkt ${what === "mapp" ? "i mappen" : "på dokumentet"}.`;
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 pt-8 pb-16 md:px-6 md:pt-10">
      <Breadcrumbs crumbs={crumbs} current={title} />
      <section
        className="relative overflow-hidden rounded-2xl bg-ink text-white"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 36px), 0 100%)" }}
      >
        <SpeedLines
          lines={[
            [760, 640, 1120, 0],
            [840, 640, 1200, 0],
            [920, 640, 1280, 0],
          ]}
        />
        <div className="relative flex flex-wrap items-center gap-x-12 gap-y-8 px-6 pt-8 pb-16 md:px-10 md:pt-10 md:pb-20">
          <div className="relative mx-auto w-full max-w-[260px] flex-[1_1_220px] px-2">
            <PdfPreview title={title ?? "Dokument"} kind={kind} pages={pages} blurred />
            <span
              aria-hidden="true"
              className="tilt-pop absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 -rotate-6 items-center justify-center rounded-xl bg-orange text-ink shadow-[0_14px_30px_rgba(0,0,0,0.4)]"
            >
              <IconLock size={30} strokeWidth={2.2} />
            </span>
          </div>
          <div className="flex min-w-0 flex-[1.5_1_300px] flex-col gap-4">
            <span className="run-in self-start bg-purple px-3 py-1 text-[13px] font-extrabold tracking-[1px] text-white uppercase [rotate:-2deg]">
              {boardOnly ? "Kräver inloggning" : "Bara för medlemmar"}
            </span>
            <h1
              className="run-in m-0 text-[30px] leading-[1.08] font-extrabold tracking-[-1px] md:text-[40px]"
              style={{ "--i": 1 } as CSSProperties}
            >
              {heading}
            </h1>
            <p className="run-in m-0 max-w-[520px] text-[17px] text-mist" style={{ "--i": 2 } as CSSProperties}>
              {text}
            </p>
            <div className="run-in mt-1 flex flex-wrap gap-3" style={{ "--i": 3 } as CSSProperties}>
              <Link href={loginHref} className="btn btn-primary btn-lg flex-1 sm:flex-none">
                {what === "mapp" ? "Logga in och öppna mappen" : "Logga in och öppna"}
              </Link>
              {!boardOnly && (
                <Link href="/bli-medlem" className="btn btn-outline-light btn-lg flex-1 sm:flex-none">
                  Bli medlem
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function NotFoundHere() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-start gap-4 px-4 pt-12 pb-20 md:px-6">
      <span className="flex h-12 w-12 -rotate-3 items-center justify-center rounded-lg bg-orange-soft text-orange-dark">
        <IconFolder size={24} />
      </span>
      <h1 className="m-0 text-[30px] font-extrabold tracking-[-0.8px]">Hittade inget här</h1>
      <p className="m-0 text-[17px] text-muted">
        Dokumentet eller mappen finns inte, eller så har det flyttats. Börja om från Dokument så hittar du rätt.
      </p>
      <Link href="/dokument" className="btn btn-dark">
        Till Dokument
      </Link>
    </div>
  );
}

/** Shown while localStorage is read for demo uploads. */
export function ViewSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pt-8 pb-16 md:px-6 md:pt-10">
      <span className="h-4 w-56 motion-safe:animate-pulse rounded bg-line" />
      <span className="h-10 w-80 max-w-full motion-safe:animate-pulse rounded bg-line" />
      <span className="h-56 w-full motion-safe:animate-pulse rounded-xl bg-white" />
    </div>
  );
}
