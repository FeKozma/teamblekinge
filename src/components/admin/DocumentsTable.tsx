"use client";

import Link from "next/link";
import { IconFolder } from "@/components/icons";
import { VisibilityBadge } from "@/components/documents/bits";
import { CopyLinkButton } from "@/components/documents/CopyLinkButton";
import { DemoTag } from "@/components/documents/views";
import type { Visibility } from "@/lib/data/documents";
import "./admin.css";

export type AdminRow =
  | {
      kind: "folder";
      id: string;
      title: string;
      adminHref: string;
      publicHref: string;
      count: number;
      latestLabel: string | null;
      visibility: Visibility;
    }
  | {
      kind: "doc";
      id: string;
      title: string;
      publicHref: string;
      uploadedLabel: string;
      announced?: string;
      visibility: Visibility;
      demo?: boolean;
    };

const FOOTNOTE =
  "Länkarna fungerar i inlägg, mejl och Facebookgruppen. Den som inte är inloggad loggar in och hamnar sedan direkt på dokumentet.";

function Title({ row, folderVisibility }: { row: AdminRow; folderVisibility: Visibility }) {
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {row.kind === "folder" ? (
          <Link
            href={row.adminHref}
            className="inline-flex items-center gap-2 font-bold text-ink underline-offset-2 hover:text-orange-dark"
          >
            <IconFolder size={18} className="flex-none text-orange-dark" />
            {row.title}
          </Link>
        ) : (
          <Link href={row.publicHref} className="font-bold text-ink underline-offset-2 hover:text-orange-dark">
            {row.title}
          </Link>
        )}
        {row.kind === "doc" && row.demo && <DemoTag />}
        {row.visibility !== folderVisibility && (
          <VisibilityBadge visibility={row.visibility} className="py-0.5! text-[12px]!" />
        )}
      </span>
      <span className="font-mono text-[12px] break-all text-muted">
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
    <section aria-label="Filer i mappen" className={`card min-w-0 overflow-hidden ${className}`}>
      {rows.length === 0 ? (
        <p className="m-0 px-4 py-8 text-center text-muted">
          Inga dokument i mappen ännu – ladda upp det första i formuläret.
        </p>
      ) : (
        <>
          <table className="hidden w-full border-collapse sm:table">
            <thead>
              <tr className="bg-paper text-left text-[13px] text-muted">
                <th scope="col" className="px-4 py-3 font-bold">
                  Dokument
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Uppladdat
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Meddelat
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Länk</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={`border-t border-line ${tone(r)}`}>
                  <td className="px-4 py-3">
                    <Title row={r} folderVisibility={folderVisibility} />
                  </td>
                  <td className="px-4 py-3 text-[14px] whitespace-nowrap text-muted">{uploadedOf(r)}</td>
                  <td className="px-4 py-3 text-[14px]">
                    <Announced row={r} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CopyLinkButton href={r.publicHref} what={r.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="m-0 list-none p-0 sm:hidden">
            {rows.map((r, i) => (
              <li
                key={r.id}
                className={`flex items-start gap-3 px-4 py-3 ${i ? "border-t border-line" : ""} ${tone(r)}`}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <Title row={r} folderVisibility={folderVisibility} />
                  <span className="text-[13px] text-muted">
                    {r.kind === "doc" ? `Uppladdat ${r.uploadedLabel}` : `Senast ${uploadedOf(r)}`} ·{" "}
                    <Announced row={r} />
                  </span>
                </span>
                <CopyLinkButton href={r.publicHref} what={r.title} />
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="m-0 border-t border-line px-4 py-3 text-[13px] text-muted">{FOOTNOTE}</p>
    </section>
  );
}
