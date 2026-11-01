"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { Field, FormSection, fieldClass, useFieldError } from "@/components/admin/form";
import { extOf, FileGlyph } from "@/components/documents/bits";
import { IconExternal } from "@/components/public/icons";
import { IconUpload } from "@/components/icons";
import { moreOpen, visibilities, visibilityLabels, type Visibility } from "@/lib/data/documents";
import "../admin.css";

// Form pieces for the document admin, built on the admin form kit: a PDF
// picker with drag and drop, the "who may see it" choice (which knows what the
// folder allows), and the folder + visibility + announce block shared by the
// upload and edit pages.

export const MAX_PDF_BYTES = 10 * 1024 * 1024;

const sizeLabel = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} kB`
    : `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;

/** Why a picked file can't be used, or null. The server checks the bytes again. */
export function pdfProblem(f: File) {
  if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf") {
    return "Välj en PDF. Spara dokumentet som PDF först (Arkiv › Spara som › PDF) och försök igen.";
  }
  if (f.size > MAX_PDF_BYTES) return "Filen är för stor – högst 10 MB.";
  return null;
}

/** "Protokoll_styrelsemote-2026.pdf" → "Protokoll styrelsemote 2026" */
const titleFromFileName = (name: string) =>
  name
    .replace(/\.pdf$/i, "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Pick a PDF from the computer or phone, or drop it on the field. Posted as
 * a File under `name`. With `current`, choosing a file replaces it.
 */
export function PdfField({
  name = "file",
  label,
  current,
  hint,
  fillTitle = false,
}: {
  name?: string;
  label: string;
  /** The file used today (edit page). */
  current?: { name: string; size: string; pages?: number; href: string };
  hint?: string;
  /** Put the file's name in an empty "title" field. */
  fillTitle?: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<{ name: string; size: number } | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const serverError = useFieldError(name);
  const error = problem ?? (picked ? undefined : serverError);

  function accept(files: FileList | null) {
    const f = files?.[0];
    const el = input.current;
    if (!f || !el) return;
    const p = pdfProblem(f);
    setProblem(p);
    if (p) {
      el.value = "";
      setPicked(null);
      return;
    }
    // A dropped file has to be put in the input so the form posts it.
    if (el.files?.[0] !== f) {
      const dt = new DataTransfer();
      dt.items.add(f);
      el.files = dt.files;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    setPicked({ name: f.name, size: f.size });
    if (fillTitle) {
      const title = el.form?.elements.namedItem("title");
      if (title instanceof HTMLInputElement && !title.value.trim()) title.value = titleFromFileName(f.name);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files);
  }

  return (
    <div data-field={name} className="flex flex-col gap-1.5">
      <span id={`${id}-l`} className="text-[14px] font-semibold">
        {label}
      </span>
      {current && !picked && (
        <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-line bg-paper/60 p-3">
          <FileGlyph ext={extOf(current.name)} size={40} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[14px] font-bold [overflow-wrap:anywhere]">{current.name}</span>
            <span className="text-[13px] text-muted">
              {current.size}
              {current.pages ? ` · ${current.pages === 1 ? "1 sida" : `${current.pages} sidor`}` : ""}
            </span>
          </span>
          <a
            href={current.href}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-[#cfc8c4] bg-white px-3 text-[13px] font-semibold text-ink no-underline hover:border-ink hover:text-ink"
          >
            <IconExternal size={14} /> Öppna PDF<span className="sr-only"> (öppnas i ny flik)</span>
          </a>
        </div>
      )}
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={onDrop}
        data-dragging={dragging || undefined}
        className={`dropzone flex items-center gap-3 rounded-[10px] border-2 border-dashed p-4 ${
          error
            ? "border-[#b3261e] bg-[#fdf1f0]"
            : dragging
              ? "border-orange-dark bg-orange-soft"
              : "border-orange bg-[#fff7ee]"
        }`}
      >
        {picked ? (
          <span key={picked.name} className="file-drop-in flex-none">
            <FileGlyph ext={extOf(picked.name)} />
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="flex h-11 w-9 flex-none items-center justify-center rounded-[4px] border border-dashed border-orange-dark/60 bg-white text-orange-dark"
          >
            <IconUpload size={18} />
          </span>
        )}
        <span id={`${id}-hint`} className="flex min-w-0 flex-1 flex-col">
          {dragging ? (
            <span className="text-[14px] font-bold">Släpp filen här</span>
          ) : picked ? (
            <>
              <span className="text-[14px] font-bold [overflow-wrap:anywhere]">{picked.name}</span>
              <span className="text-[12px] text-muted">
                {sizeLabel(picked.size)} · {current ? "ersätter filen när du sparar" : "laddas upp när du sparar"}
              </span>
            </>
          ) : (
            <>
              <span className="text-[14px] font-bold">{current ? "Byt till en ny PDF" : "Välj en PDF"}</span>
              <span className="text-[12px] text-muted">Dra hit filen eller välj från dator eller telefon</span>
            </>
          )}
        </span>
        <button
          type="button"
          onClick={() => input.current?.click()}
          aria-describedby={`${id}-l ${id}-hint${error ? ` ${id}-err` : ""}`}
          className="min-h-9 flex-none cursor-pointer rounded-md border border-[#cfc8c4] bg-white px-3 text-[13px] font-semibold text-ink hover:border-ink"
        >
          {picked || current ? "Byt fil" : "Välj fil"}
        </button>
        <input
          ref={input}
          type="file"
          name={name}
          accept=".pdf,application/pdf"
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
          onChange={(e) => accept(e.target.files)}
        />
      </div>
      {error && (
        <span id={`${id}-err`} className="text-[13px] font-semibold text-[#b3261e]">
          {error}
        </span>
      )}
      <span className="text-[13px] text-muted">{hint ?? "PDF, högst 10 MB."}</span>
    </div>
  );
}

/** "bara för medlemmar" */
const limitWords: Record<Visibility, string> = {
  alla: "öppen för alla",
  medlemmar: "bara för medlemmar",
  styrelsen: "bara för styrelsen",
};

/**
 * Who may see a document or folder. Choices more open than the folder it
 * lies in (`limit`) are disabled, with the reason underneath.
 */
export function VisibilityChoice({
  name = "visibility",
  value,
  onChange,
  limit = "alla",
  limitName,
  legend = "Vem får se dokumentet?",
}: {
  name?: string;
  value: Visibility;
  onChange: (v: Visibility) => void;
  limit?: Visibility;
  /** The folder that sets the limit, e.g. "Protokoll". */
  limitName?: string;
  legend?: string;
}) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <fieldset data-field={name} className="m-0 flex flex-col gap-1.5 border-0 p-0" aria-describedby={`${id}-note`}>
      <legend className="pb-1.5 text-[14px] font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {visibilities.map((v) => {
          const off = moreOpen(v, limit);
          return (
            <label
              key={v}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg border-[1.5px] border-[#cfc8c4] bg-white px-3 text-[14px] transition-colors has-checked:border-ink has-checked:bg-paper has-checked:font-semibold ${
                off ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:border-ink"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={v}
                checked={value === v}
                disabled={off}
                onChange={() => onChange(v)}
                className="h-4 w-4 accent-orange-dark"
              />
              {visibilityLabels[v]}
            </label>
          );
        })}
      </div>
      {error && <span className="text-[13px] font-semibold text-[#b3261e]">{error}</span>}
      <span id={`${id}-note`} className="text-[13px] text-muted">
        {limit !== "alla"
          ? `${limitName ? `Mappen ${limitName}` : "Mappen"} är ${limitWords[limit]}, så mer öppet än så går inte.`
          : value === "alla"
            ? "Alla kan öppna den, även utan inloggning."
            : value === "medlemmar"
              ? "Inloggade medlemmar kan öppna den. Andra ombeds logga in."
              : "Bara styrelsen ser den. Andra får inte ens veta att den finns."}
      </span>
    </fieldset>
  );
}

/** VisibilityChoice that keeps its own state, for forms without a folder picker. */
export function VisibilityField({
  defaultValue,
  limit = "alla",
  ...rest
}: {
  defaultValue: Visibility;
  limit?: Visibility;
  limitName?: string;
  legend?: string;
}) {
  const [value, setValue] = useState<Visibility>(moreOpen(defaultValue, limit) ? limit : defaultValue);
  return <VisibilityChoice value={value} onChange={setValue} limit={limit} {...rest} />;
}

export type FolderOption = { path: string; label: string; title: string; limit: Visibility };

/**
 * "Var och för vem" (folder + visibility) and, when `announce` is given,
 * "Meddela medlemmarna". The visibility choice follows the chosen folder.
 */
export function DocAccessFields({
  folders,
  defaultFolder,
  defaultVisibility,
  folderHint,
  announce,
}: {
  folders: FolderOption[];
  defaultFolder: string;
  defaultVisibility: Visibility;
  folderHint?: string;
  /** Leave out to hide the announce part; `already` when a news item exists. */
  announce?: { already?: boolean; defaultChecked: boolean };
}) {
  const [folder, setFolder] = useState(defaultFolder);
  const current = folders.find((f) => f.path === folder);
  const limit = current?.limit ?? "alla";
  const [visibility, setVisibility] = useState<Visibility>(
    moreOpen(defaultVisibility, limit) ? limit : defaultVisibility,
  );
  const [wantsNews, setWantsNews] = useState(announce?.defaultChecked ?? false);
  const canAnnounce = visibility !== "styrelsen";

  return (
    <>
      <FormSection
        title="Var och för vem"
        description="Mappen bestämmer var dokumentet hamnar på sidan Dokument. Ett dokument kan aldrig vara mer öppet än mappen det ligger i."
      >
        <Field label="Mapp" name="folder" hint={folderHint}>
          {({ id, describedBy, invalid }) => (
            <select
              id={id}
              name="folder"
              value={folder}
              onChange={(e) => {
                setFolder(e.target.value);
                const next = folders.find((f) => f.path === e.target.value)?.limit ?? "alla";
                if (moreOpen(visibility, next)) setVisibility(next);
              }}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              className={`${fieldClass} cursor-pointer`}
            >
              {folders.map((f) => (
                <option key={f.path} value={f.path}>
                  {f.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <VisibilityChoice value={visibility} onChange={setVisibility} limit={limit} limitName={current?.title} />
      </FormSection>

      {announce && (
        <FormSection
          title="Meddela medlemmarna"
          description="En nyhet i kategorin Styrelsen med en länk direkt till dokumentet."
        >
          {announce.already ? (
            <p className="m-0 text-[14px]">
              <span className="font-semibold text-green">Redan meddelat</span> – nyheten finns under Nyheter.
            </p>
          ) : (
            <label className={`flex items-start gap-2.5 font-semibold ${canAnnounce ? "cursor-pointer" : "text-muted"}`}>
              <input
                type="checkbox"
                name="announce"
                checked={wantsNews && canAnnounce}
                disabled={!canAnnounce}
                onChange={(e) => setWantsNews(e.target.checked)}
                className="mt-0.5 h-5 w-5 flex-none accent-orange-dark"
              />
              <span className="flex flex-col">
                Publicera en nyhet om dokumentet
                <span className="text-[13px] font-normal text-muted">
                  {canAnnounce
                    ? `Nyheten blir ${visibility === "alla" ? "öppen för alla, som dokumentet" : "bara för medlemmar"}. På riktiga webbplatsen får den som följer Styrelsen en avisering – det skickas inga i demon.`
                    : "Dokument som bara styrelsen ser meddelas inte medlemmarna."}
                </span>
              </span>
            </label>
          )}
        </FormSection>
      )}
    </>
  );
}
