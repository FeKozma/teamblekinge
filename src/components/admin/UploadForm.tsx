"use client";

import { useId, useRef, useState, type DragEvent, type FormEvent } from "react";
import { IconUpload } from "@/components/icons";
import { extOf, FileGlyph } from "@/components/documents/bits";
import { toast } from "@/components/documents/Toaster";
import { useUploadedDocs } from "@/components/documents/uploads";
import {
  protocolTarget,
  protocolTemplates,
  samePath,
  uploadLabel,
  visibilityLabels,
  type ProtocolTemplate,
  type UploadedDoc,
  type Visibility,
} from "@/lib/data/documents";
import { addDays, weekday } from "@/lib/format";
import "./admin.css";

const ACCEPT = ".pdf,.doc,.docx,.odt,application/pdf";
const ALLOWED = /\.(pdf|docx?|odt)$/i;
const SUMMARY_MAX = 280;

type PickedFile = { name: string; size: number };

const field =
  "min-h-11 w-full rounded-lg border-[1.5px] border-[#cfc8c4] bg-white px-2.5 text-[15px] font-normal text-ink aria-[invalid=true]:border-[#b3261e]";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

/** Most recent Monday before today that has no protocol yet — for the example file. */
function suggestDate(today: string, taken: (date: string) => boolean) {
  let d = addDays(today, -1);
  while (weekday(d) !== "måndag") d = addDays(d, -1);
  while (taken(d)) d = addDays(d, -7);
  return d;
}

function ErrorText({ id, children }: { id: string; children?: string }) {
  return children ? (
    <span id={id} className="text-[13px] font-semibold text-[#b3261e]">
      {children}
    </span>
  ) : null;
}

/**
 * "Ladda upp protokoll" from drawup 09. Everything is derived live from the
 * template and meeting date: the name, the folder, and the news post that
 * announces it. DEMO: nothing is uploaded — the protocol is saved in this
 * browser (useDemoState) and shows up in the table and on /dokument.
 */
export function UploadForm({
  today,
  userId,
  onUploaded,
  className = "",
}: {
  today: string;
  userId: string;
  onUploaded: (doc: UploadedDoc) => void;
  className?: string;
}) {
  const id = useId();
  const [uploads, setUploads] = useUploadedDocs();
  const [template, setTemplate] = useState<ProtocolTemplate>("styrelse");
  const [date, setDate] = useState("");
  const [dateFromFile, setDateFromFile] = useState(false);
  const [file, setFile] = useState<PickedFile | null>(null);
  const [visibility, setVisibility] = useState<Visibility>("medlemmar");
  const [announce, setAnnounce] = useState(true);
  const [summary, setSummary] = useState("");
  const [errors, setErrors] = useState<{ file?: string; date?: string }>({});
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const fileButton = useRef<HTMLButtonElement>(null);
  const dateInput = useRef<HTMLInputElement>(null);

  const target = protocolTarget(template, date);
  const taken = (folder: string[], slug: string) =>
    uploads.some((u) => u.slug === slug && samePath(u.folder, folder));
  const duplicate = !!target && (target.exists || taken(target.folder, target.slug));
  const canAnnounce = visibility !== "styrelsen";
  const willAnnounce = announce && canAnnounce;

  function pick(f: PickedFile) {
    if (!ALLOWED.test(f.name)) {
      setErrors((e) => ({ ...e, file: "Välj en PDF eller Word-fil – andra filtyper kan inte bli protokoll." }));
      return;
    }
    setFile(f);
    setErrors((e) => ({ ...e, file: undefined }));
    // "Protokoll styrelsemöte 2026-10-12.pdf" → fill in the meeting date.
    const m = /(\d{4}-\d{2}-\d{2})/.exec(f.name);
    if (m && !date && m[1] <= today) {
      setDate(m[1]);
      setDateFromFile(true);
      setErrors((e) => ({ ...e, date: undefined }));
    }
  }

  function pickExample() {
    const d =
      date ||
      suggestDate(today, (x) => {
        const t = protocolTarget(template, x);
        return !!t && (t.exists || taken(t.folder, t.slug));
      });
    const what = template === "arsmote" ? "årsmöte" : template === "ovrigt" ? "möte" : "styrelsemöte";
    pick({ name: `Protokoll ${what} ${d}.pdf`, size: 203_776 });
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pick({ name: f.name, size: f.size });
  }

  function reset() {
    setTemplate("styrelse");
    setDate("");
    setDateFromFile(false);
    setFile(null);
    setVisibility("medlemmar");
    setAnnounce(true);
    setSummary("");
    setErrors({});
    if (input.current) input.current.value = "";
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const errs: { file?: string; date?: string } = {};
    if (!date) errs.date = "Fyll i mötesdatum – det bestämmer namn och mapp.";
    else if (date > today) errs.date = "Mötesdatumet kan inte ligga i framtiden.";
    else if (duplicate && target) errs.date = `${target.title} finns redan i ${target.folderTitles.join(" › ")}.`;
    if (!file) errs.file = "Välj filen med protokollet.";
    setErrors(errs);
    if (errs.date) return dateInput.current?.focus();
    if (errs.file) return fileButton.current?.focus();
    if (!target || !file) return;

    setBusy(true);
    // A short pause so it feels like an upload; nothing leaves the browser.
    setTimeout(() => {
      const doc: UploadedDoc = {
        id: [...target.folder, target.slug].join("/"),
        title: target.title,
        slug: target.slug,
        folder: target.folder,
        folderTitles: target.folderTitles,
        kind: "protokoll",
        uploaded: today,
        uploadedLabel: uploadLabel(today),
        uploadedBy: userId,
        visibility,
        size: formatSize(file.size),
        pages: Math.min(12, Math.max(1, Math.round(file.size / 70_000))),
        fileName: file.name,
        announced: willAnnounce ? { category: "Styrelsen" } : undefined,
        summary: summary.trim() || undefined,
        demo: true,
      };
      setUploads((prev) => [doc, ...prev.filter((u) => u.id !== doc.id)]);
      toast(
        willAnnounce
          ? `${doc.title} är uppladdat och nyheten publicerad. (Demo – sparas bara i din webbläsare.)`
          : `${doc.title} är uppladdat. (Demo – sparas bara i din webbläsare.)`,
      );
      reset();
      setBusy(false);
      onUploaded(doc);
    }, 650);
  }

  const dateErr = `${id}-date-err`;
  const fileErr = `${id}-file-err`;
  const fileHint = `${id}-file-hint`;

  return (
    <section
      aria-labelledby={`${id}-h`}
      className={`card flex min-w-0 flex-col gap-4 p-5 ${className}`}
      data-reveal="right"
    >
      <h2 id={`${id}-h`} className="m-0 flex items-center gap-3 text-[20px] font-extrabold">
        <span aria-hidden="true" className="skew-bar h-3 w-5 bg-orange" />
        Ladda upp protokoll
      </h2>

      <form noValidate onSubmit={onSubmit} onReset={reset} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          <label className="flex flex-col gap-1 text-[13px] font-semibold">
            Mall
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as ProtocolTemplate)}
              className={`${field} cursor-pointer`}
            >
              {protocolTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-date`} className="text-[13px] font-semibold">
              Mötesdatum
            </label>
            <input
              id={`${id}-date`}
              ref={dateInput}
              type="date"
              value={date}
              max={today}
              required
              onChange={(e) => {
                setDate(e.target.value);
                setDateFromFile(false);
                setErrors((x) => ({ ...x, date: undefined }));
              }}
              aria-invalid={!!errors.date || undefined}
              aria-describedby={errors.date ? dateErr : undefined}
              className={field}
            />
            {dateFromFile && !errors.date && (
              <span className="text-[12px] font-normal text-muted">Hämtat från filnamnet</span>
            )}
            <ErrorText id={dateErr}>{errors.date}</ErrorText>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
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
              errors.file
                ? "border-[#b3261e] bg-[#fdf1f0]"
                : dragging
                  ? "border-orange-dark bg-orange-soft"
                  : "border-orange bg-[#fff7ee]"
            }`}
          >
            {file ? (
              <span key={file.name} className="file-drop-in flex-none">
                <FileGlyph ext={extOf(file.name)} />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="flex h-11 w-9 flex-none items-center justify-center rounded-[4px] border border-dashed border-orange-dark/60 bg-white text-orange-dark"
              >
                <IconUpload size={18} />
              </span>
            )}
            <span id={fileHint} className="flex min-w-0 flex-1 flex-col">
              {dragging ? (
                <span className="text-[14px] font-bold">Släpp filen här</span>
              ) : file ? (
                <>
                  <span className="text-[14px] font-bold [overflow-wrap:anywhere]">{file.name}</span>
                  <span className="text-[12px] text-muted">
                    {formatSize(file.size)} · Dra hit en annan fil eller byt
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[14px] font-bold">Protokollet som PDF</span>
                  <span className="text-[12px] text-muted">Dra hit filen eller välj från dator eller telefon</span>
                </>
              )}
            </span>
            <button
              ref={fileButton}
              type="button"
              onClick={() => input.current?.click()}
              aria-describedby={`${fileHint}${errors.file ? ` ${fileErr}` : ""}`}
              className="min-h-9 flex-none cursor-pointer rounded-md border border-[#cfc8c4] bg-white px-3 text-[13px] font-semibold text-ink hover:border-ink"
            >
              {file ? "Byt fil" : "Välj fil"}
            </button>
            <input
              ref={input}
              type="file"
              accept={ACCEPT}
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) pick({ name: f.name, size: f.size });
              }}
            />
          </div>
          <ErrorText id={fileErr}>{errors.file}</ErrorText>
          {!file && (
            <button
              type="button"
              onClick={pickExample}
              className="cursor-pointer self-start text-[12px] text-muted underline underline-offset-2 hover:text-ink"
            >
              Ingen fil till hands? Använd en exempelfil
            </button>
          )}
        </div>

        <p className={`m-0 text-[13px] ${duplicate ? "font-semibold text-[#b3261e]" : "text-muted"}`}>
          {target ? (
            duplicate ? (
              <>
                Det finns redan <strong>{target.title}</strong> i {target.folderTitles.join(" › ")}. Välj ett annat
                datum.
              </>
            ) : (
              <>
                Sparas som <strong className="text-ink">{target.title}</strong> i {target.folderTitles.join(" › ")}
                {target.createNote && ` (${target.createNote})`}.
              </>
            )
          ) : (
            "Välj mötesdatum så ser du var protokollet sparas."
          )}
        </p>

        <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
          <legend className="pb-1.5 text-[13px] font-semibold">Vem får se dokumentet?</legend>
          <div className="flex flex-wrap gap-2">
            {(["alla", "medlemmar", "styrelsen"] as const).map((v) => (
              <label
                key={v}
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border-[1.5px] border-[#cfc8c4] bg-white px-3 text-[14px] transition-colors hover:border-ink has-checked:border-ink has-checked:bg-paper has-checked:font-semibold"
              >
                <input
                  type="radio"
                  name={`${id}-vis`}
                  value={v}
                  checked={visibility === v}
                  onChange={() => setVisibility(v)}
                  className="h-4 w-4 accent-orange-dark"
                />
                {visibilityLabels[v]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <label className={`flex items-start gap-2.5 font-bold ${canAnnounce ? "cursor-pointer" : "text-muted"}`}>
            <input
              type="checkbox"
              checked={willAnnounce}
              disabled={!canAnnounce}
              onChange={(e) => setAnnounce(e.target.checked)}
              className="mt-0.5 h-5 w-5 flex-none accent-orange-dark"
            />
            <span className="flex flex-col">
              Meddela medlemmarna
              <span className="text-[13px] font-normal text-muted">
                {canAnnounce
                  ? "En nyhet för medlemmar i kategorin Styrelsen, med direktlänk. Den som följer Styrelsen får en avisering."
                  : "Dokument som bara styrelsen ser meddelas inte medlemmarna."}
              </span>
            </span>
          </label>

          <label className="flex flex-col gap-1 text-[13px] font-semibold">
            <span className="flex justify-between gap-2">
              Kort sammanfattning (valfritt)
              <span className="font-normal text-muted" aria-hidden="true">
                {summary.length}/{SUMMARY_MAX}
              </span>
            </span>
            <textarea
              rows={3}
              maxLength={SUMMARY_MAX}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="T.ex. beslut om nya klubbkläder och datum för årsmötet"
              className={`${field} resize-y py-2.5`}
            />
          </label>

          {willAnnounce ? (
            <div className="flex flex-col gap-1.5 rounded-[10px] bg-paper p-3.5">
              <span className="text-[12px] font-bold tracking-[0.5px] text-muted uppercase">
                Förhandsvisning av inlägget
              </span>
              <span className="text-[12px] text-muted">
                Nyheter › Styrelsen · {visibility === "alla" ? "Öppen för alla" : "Endast medlemmar"}
              </span>
              <span className="text-[16px] leading-snug font-extrabold">
                {target ? (
                  target.newsTitle
                ) : (
                  <span className="text-muted">Nytt protokoll: styrelsemöte [mötesdatum]</span>
                )}
              </span>
              {summary.trim() && <span className="text-[14px] [overflow-wrap:anywhere]">{summary.trim()}</span>}
              <span className="arrow-link self-start text-[14px] text-orange-dark">
                Öppna protokollet <span className="arrow">→</span>
              </span>
            </div>
          ) : (
            <p className="m-0 rounded-[10px] border border-dashed border-line px-3.5 py-3 text-[13px] text-muted">
              Ingen nyhet publiceras – protokollet läggs bara i mappen. Du kan dela länken själv.
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2.5">
          <button
            type="reset"
            className="min-h-12 cursor-pointer rounded-[10px] border-[1.5px] border-[#cfc8c4] bg-white px-[18px] font-semibold text-ink hover:border-ink"
          >
            Avbryt
          </button>
          <button
            type="submit"
            disabled={busy}
            className="btn btn-primary min-h-12 rounded-[10px] px-[22px] font-extrabold disabled:cursor-wait disabled:opacity-80"
          >
            {busy && (
              <span
                aria-hidden="true"
                className="h-4 w-4 rounded-full border-2 border-ink/30 border-t-ink motion-safe:animate-spin"
              />
            )}
            {busy ? "Laddar upp …" : willAnnounce ? "Ladda upp och meddela" : "Ladda upp"}
          </button>
        </div>
        <p className="m-0 text-right text-[12px] text-muted">
          Demo: filen lämnar aldrig din dator – uppladdningen sparas bara i den här webbläsaren.
        </p>
      </form>
    </section>
  );
}
