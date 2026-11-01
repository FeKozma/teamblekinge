import Link from "next/link";
import { IconFolder, IconPencil } from "@/components/icons";
import { IconExternal } from "@/components/public/icons";
import { VisibilityBadge } from "@/components/documents/bits";
import { CopyLinkButton } from "@/components/documents/CopyLinkButton";
import type { Visibility } from "@/lib/data/documents";
import "../admin.css";

export type AdminRow =
  | {
      kind: "folder";
      id: string;
      title: string;
      adminHref: string;
      editHref: string;
      publicHref: string;
      count: number;
      latestLabel: string | null;
      visibility: Visibility;
    }
  | {
      kind: "doc";
      id: string;
      title: string;
      /** The edit page. */
      adminHref: string;
      publicHref: string;
      pdfHref: string;
      uploadedLabel: string;
      announced?: string;
      visibility: Visibility;
    };

const FOOTNOTE =
  "Länkarna fungerar i inlägg, mejl och Facebookgruppen. Den som inte är inloggad loggar in och hamnar sedan direkt på dokumentet.";

const smallButton =
  "inline-flex min-h-9 flex-none items-center justify-center gap-1.5 rounded-md border border-[#cfc8c4] bg-white px-3 text-[13px] font-semibold text-ink no-underline transition-[border-color,translate] duration-200 hover:-translate-y-px hover:border-ink hover:text-ink";

function Title({ row, folderVisibility }: { row: AdminRow; folderVisibility: Visibility }) {
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Link
          href={row.adminHref}
          className="inline-flex items-center gap-2 font-bold text-ink underline-offset-2 hover:text-orange-dark"
        >
          {row.kind === "folder" && <IconFolder size={18} className="flex-none text-orange-dark" />}
          {row.title}
        </Link>
        {row.visibility !== folderVisibility && (
          <VisibilityBadge visibility={row.visibility} className="py-0.5! text-[12px]!" />
        )}
      </span>
      <span className="font-mono text-[12px] [overflow-wrap:anywhere] text-muted">
        {row.publicHref}
        {row.kind === "folder" && (
          <span className="font-sans"> · {row.count === 1 ? "1 dokument" : `${row.count} dokument`}</span>
        )}
      </span>
    </span>
  );
}

function Announced({ row }: { row: AdminRow }) {
  return row.kind === "doc" && row.announced ? (
    <span className="font-semibold text-green">{row.announced}</span>
  ) : (
    <span className="text-muted">
      <span aria-hidden="true">—</span>
      <span className="sr-only">Inte meddelat</span>
    </span>
  );
}

function Actions({ row }: { row: AdminRow }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <Link href={row.kind === "doc" ? row.adminHref : row.editHref} className={smallButton}>
        <IconPencil size={14} />
        Ändra<span className="sr-only"> {row.title}</span>
      </Link>
      {row.kind === "doc" && (
        <a href={row.pdfHref} target="_blank" rel="noopener" className={smallButton}>
          <IconExternal size={14} />
          Öppna PDF<span className="sr-only">: {row.title} (öppnas i ny flik)</span>
        </a>
      )}
      <CopyLinkButton href={row.publicHref} what={row.title} />
    </span>
  );
}

const uploadedOf = (row: AdminRow) => (row.kind === "doc" ? row.uploadedLabel : (row.latestLabel ?? "—"));

/** The folder's contents as in drawup 09 — a table from sm up, a list on phones. */
export function DocumentsTable({
  rows,
  folderVisibility,
  freshId,
  className = "",
}: {
  rows: AdminRow[];
  folderVisibility: Visibility;
  freshId?: string | null;
  className?: string;
}) {
  // The newest document gets the drawup's soft highlight.
  const newest = rows.find((r) => r.kind === "doc")?.id;
  const tone = (r: AdminRow) => (r.id === freshId ? "row-fresh" : r.id === newest ? "bg-[#fff7ee]" : "");

  return (
    <section aria-label="Innehåll i mappen" className={`card min-w-0 overflow-hidden ${className}`}>
      {rows.length === 0 ? (
        <p className="m-0 px-4 py-8 text-center text-muted">
          Mappen är tom – ladda upp det första dokumentet eller skapa en mapp i den.
        </p>
      ) : (
        <>
          <table className="hidden w-full border-collapse sm:table">
            <thead>
              <tr className="bg-paper text-left text-[13px] text-muted">
                <th scope="col" className="px-4 py-3 font-bold">
                  Dokument
                </th>
                <th scope="col" className="px-3 py-3 font-bold">
                  Uppladdat
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Meddelat
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={`border-t border-line ${tone(r)}`}>
                  <td className="px-4 py-3">
                    <span className="flex flex-col gap-2">
                      <Title row={r} folderVisibility={folderVisibility} />
                      <Actions row={r} />
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top text-[14px] whitespace-nowrap text-muted">{uploadedOf(r)}</td>
                  <td className="px-4 py-3 align-top text-[14px] whitespace-nowrap">
                    <Announced row={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="m-0 list-none p-0 sm:hidden">
            {rows.map((r, i) => (
              <li key={r.id} className={`flex flex-col gap-2 px-4 py-3 ${i ? "border-t border-line" : ""} ${tone(r)}`}>
                <Title row={r} folderVisibility={folderVisibility} />
                <span className="text-[13px] text-muted">
                  {r.kind === "doc" ? `Uppladdat ${r.uploadedLabel}` : `Senast ${uploadedOf(r)}`} ·{" "}
                  <Announced row={r} />
                </span>
                <Actions row={r} />
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="m-0 border-t border-line px-4 py-3 text-[13px] text-muted">{FOOTNOTE}</p>
    </section>
  );
}
