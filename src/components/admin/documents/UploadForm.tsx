"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition, type DragEvent, type FormEvent } from "react";
import { uploadProtocolAction } from "@/app/admin/dokument/actions";
import { IconUpload } from "@/components/icons";
import { extOf, FileGlyph } from "@/components/documents/bits";
import {
  folderTrail,
  folderVisibility,
  longDateWithYear,
  moreOpen,
  protocolTarget,
  protocolTemplates,
  type DocFolder,
  type DocRef,
  type ProtocolTemplate,
  type Visibility,
} from "@/lib/data/documents";
import { addDays, weekday } from "@/lib/format";
import { placeholderPdf } from "@/lib/pdf";
import { pdfProblem, VisibilityChoice } from "./fields";
import { adminFolderHref } from "./links";
import "../admin.css";

const SUMMARY_MAX = 280;

type Errors = Partial<Record<"file" | "date" | "visibility" | "summary" | "template" | "form", string>>;

const field =
  "min-h-11 w-full rounded-lg border-[1.5px] border-[#cfc8c4] bg-white px-2.5 text-[15px] font-normal text-ink aria-[invalid=true]:border-[#b3261e]";

const sizeLabel = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} kB`
    : `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;

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
 * template and meeting date: the name, the folder (created if missing), and
 * the news item that announces it. The file is uploaded for real.
 */
export function UploadForm({
  today,
  archive,
  className = "",
}: {
  today: string;
  /** The folder tree and where documents already are — for the live name and duplicate check. */
  archive: { root: DocFolder; docs: DocRef[] };
  className?: string;
}) {
  const id = useId();
  const router = useRouter();
  const [template, setTemplate] = useState<ProtocolTemplate>("styrelse");
  const [date, setDate] = useState("");
  const [dateFromFile, setDateFromFile] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<Visibility>("medlemmar");
  const [announce, setAnnounce] = useState(true);
  const [summary, setSummary] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [dragging, setDragging] = useState(false);
  const [busy, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const fileButton = useRef<HTMLButtonElement>(null);
  const dateInput = useRef<HTMLInputElement>(null);

  const target = protocolTarget(archive, template, date);
  const duplicate = !!target?.exists;
  // A new year folder takes the visibility of Protokoll (members, unless changed).
  const limit: Visibility = !target
    ? "alla"
    : folderTrail(archive.root, target.folder)
      ? folderVisibility(archive.root, target.folder)
      : folderTrail(archive.root, target.folder.slice(0, 1))
        ? folderVisibility(archive.root, target.folder.slice(0, 1))
        : "medlemmar";
  const shown = moreOpen(visibility, limit) ? limit : visibility;
  const canAnnounce = shown !== "styrelsen";
  const willAnnounce = announce && canAnnounce;
  const dirty = !!file || !!date || !!summary;

  useEffect(() => {
    if (!dirty || busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, busy]);

  function pick(f: File) {
    const problem = pdfProblem(f);
    if (problem) {
      setErrors((e) => ({ ...e, file: problem }));
      if (input.current) input.current.value = "";
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

  /** A real (generated) PDF, so the demo can be tried without a file at hand. */
  function pickExample() {
    const d =
      date ||
      suggestDate(today, (x) => !!protocolTarget(archive, template, x)?.exists);
    const t = protocolTarget(archive, template, d)!;
    const bytes = placeholderPdf({
      title: t.title,
      kind: "Protokoll",
      folder: t.folderTitles.join(" › "),
      uploaded: longDateWithYear(today),
    });
    pick(new File([bytes as Uint8Array<ArrayBuffer>], t.fileName, { type: "application/pdf" }));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pick(f);
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
    const errs: Errors = {};
    if (!date) errs.date = "Fyll i mötesdatum – det bestämmer namn och mapp.";
    else if (date > today) errs.date = "Mötesdatumet kan inte ligga i framtiden.";
    else if (duplicate && target) errs.date = `${target.title} finns redan i ${target.folderTitles.join(" › ")}.`;
    if (!file) errs.file = "Välj filen med protokollet.";
    setErrors(errs);
    if (errs.date) return dateInput.current?.focus();
    if (errs.file) return fileButton.current?.focus();
    if (!file) return;

    const data = new FormData();
    data.set("template", template);
    data.set("date", date);
    data.set("visibility", shown);
    if (willAnnounce) data.set("announce", "on");
    data.set("summary", summary);
    data.set("file", file);
    startTransition(async () => {
      const res = await uploadProtocolAction(data);
      if (!res?.ok || !res.doc) {
        setErrors({ ...(res?.errors ?? {}), form: res?.message });
        if (res?.errors?.date) dateInput.current?.focus();
        else if (res?.errors?.file) fileButton.current?.focus();
        return;
      }
      reset();
      // The folder page highlights the new row and confirms with a toast.
      router.push(`${adminFolderHref(res.doc.folder)}?ny=${encodeURIComponent(res.doc.id)}`);
    });
  }

  const dateErr = `${id}-date-err`;
  const fileErr = `${id}-file-err`;
  const fileHint = `${id}-file-hint`;

  return (
    <section
      id="ladda-upp-protokoll"
      aria-labelledby={`${id}-h`}
      className={`card flex min-w-0 scroll-mt-4 flex-col gap-4 p-5 ${className}`}
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
                    {sizeLabel(file.size)} · Dra hit en annan fil eller byt
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
              accept=".pdf,application/pdf"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) pick(f);
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

        <VisibilityChoice
          name={`${id}-vis`}
          value={shown}
          onChange={setVisibility}
          limit={limit}
          limitName={target?.folderTitles.at(-1)}
          legend="Vem får se protokollet?"
        />
        <ErrorText id={`${id}-vis-err`}>{errors.visibility}</ErrorText>

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
                  ? "En nyhet i kategorin Styrelsen, med direktlänk. På riktiga webbplatsen får den som följer Styrelsen en avisering – i demon skickas inga."
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
            <span className="font-normal text-muted">Visas på dokumentets sida och i nyheten.</span>
          </label>

          {willAnnounce ? (
            <div className="flex flex-col gap-1.5 rounded-[10px] bg-paper p-3.5">
              <span className="text-[12px] font-bold tracking-[0.5px] text-muted uppercase">
                Förhandsvisning av nyheten
              </span>
              <span className="text-[12px] text-muted">
                Nyheter › Styrelsen · {shown === "alla" ? "Öppen för alla" : "Endast medlemmar"}
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

        {errors.form && (
          <p role="alert" className="m-0 text-[14px] font-semibold text-[#b3261e]">
            {errors.form}
          </p>
        )}
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
          Filen laddas upp på riktigt och syns direkt på webbplatsen – i demon bara för dig.
        </p>
      </form>
    </section>
  );
}
