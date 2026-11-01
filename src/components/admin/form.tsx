"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { IconArrowDown, IconArrowUp, IconImage, IconPlus, IconTrash } from "@/components/icons";
import { toast } from "@/components/documents/Toaster";
import type { FormState } from "./form-state";

// The admin's form kit. Built for board members who are not technical:
// plain labels, help text under fields, errors next to the field, a save bar
// that says when something is unsaved, and a warning before leaving with
// unsaved changes. Server actions take FormData and return FormState.

export const fieldClass =
  "min-h-11 w-full rounded-lg border-[1.5px] border-[#cfc8c4] bg-white px-2.5 text-[15px] font-normal text-ink transition-colors hover:border-muted focus:border-ink aria-[invalid=true]:border-[#b3261e]";

const ErrorsContext = createContext<Record<string, string>>({});

/** The error message for a field name, if the last save reported one. */
export function useFieldError(name: string) {
  return useContext(ErrorsContext)[name];
}

/**
 * A form that saves through a server action without reloading the page.
 * Shows a toast on success, errors next to fields, and a sticky save bar.
 */
export function AdminForm({
  action,
  children,
  submitLabel = "Spara",
  savedHint = "Ändringarna syns direkt på webbplatsen.",
  secondary,
  className = "",
}: {
  action: (data: FormData) => Promise<FormState>;
  children: ReactNode;
  submitLabel?: string;
  /** Shown in the save bar when nothing is unsaved. */
  savedHint?: string;
  /** Extra buttons in the save bar, e.g. "Ta bort". */
  secondary?: ReactNode;
  className?: string;
}) {
  const [state, setState] = useState<FormState>(null);
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const next = await action(data);
      setState(next);
      if (next?.ok) {
        setDirty(false);
        if (next.message) toast(next.message);
      } else if (next?.errors) {
        // Bring the first broken field into view.
        const first = Object.keys(next.errors)[0];
        requestAnimationFrame(() => {
          const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${CSS.escape(first)}"]`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          el?.querySelector<HTMLElement>("input,textarea,select")?.focus({ preventScroll: true });
        });
      }
    });
  }

  const errorCount = state?.errors ? Object.keys(state.errors).length : 0;

  return (
    <ErrorsContext.Provider value={state?.errors ?? {}}>
      <form
        ref={formRef}
        noValidate
        onSubmit={onSubmit}
        onInput={() => setDirty(true)}
        onChange={() => setDirty(true)}
        className={`flex flex-col gap-6 ${className}`}
      >
        {children}
        <div className="sticky bottom-0 z-20 -mx-4 mt-2 flex flex-wrap items-center gap-3 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
          <p
            role="status"
            className={`m-0 mr-auto flex items-center gap-2 text-[14px] ${
              errorCount ? "font-semibold text-[#b3261e]" : dirty ? "font-semibold text-orange-dark" : "text-muted"
            }`}
          >
            {(dirty || errorCount > 0) && (
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 flex-none rounded-full ${errorCount ? "bg-[#b3261e]" : "live-dot bg-orange"}`}
              />
            )}
            {errorCount
              ? (state?.message ?? (errorCount === 1 ? "Ett fält behöver rättas." : `${errorCount} fält behöver rättas.`))
              : dirty
                ? "Du har ändringar som inte är sparade."
                : savedHint}
          </p>
          {secondary}
          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary min-h-12 rounded-[10px] px-[22px] font-extrabold disabled:cursor-wait disabled:opacity-80"
          >
            {pending && (
              <span
                aria-hidden="true"
                className="h-4 w-4 rounded-full border-2 border-ink/30 border-t-ink motion-safe:animate-spin"
              />
            )}
            {pending ? "Sparar …" : submitLabel}
          </button>
        </div>
      </form>
    </ErrorsContext.Provider>
  );
}

/** A titled group of fields, as a white card. */
export function FormSection({
  title,
  description,
  children,
  aside,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="card flex flex-col gap-4 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 flex items-center gap-3 text-[19px] font-extrabold">
            <span aria-hidden="true" className="skew-bar h-3 w-5 bg-orange" />
            {title}
          </h2>
          {description && <p className="m-0 max-w-[640px] text-[14px] text-muted">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Label + control + hint + error. `name` ties it to server errors. */
export function Field({
  label,
  name,
  hint,
  children,
  className = "",
}: {
  label: ReactNode;
  name: string;
  hint?: ReactNode;
  children: (ids: { id: string; describedBy?: string; invalid?: true }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const error = useFieldError(name);
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [errId, hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div data-field={name} className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-[14px] font-semibold">
        {label}
      </label>
      {children({ id, describedBy, invalid: error ? true : undefined })}
      {error && (
        <span id={errId} className="text-[13px] font-semibold text-[#b3261e]">
          {error}
        </span>
      )}
      {hint && (
        <span id={hintId} className="text-[13px] text-muted">
          {hint}
        </span>
      )}
    </div>
  );
}

type InputProps = {
  label: ReactNode;
  name: string;
  defaultValue?: string | number;
  hint?: ReactNode;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

export function TextInput({
  type = "text",
  ...p
}: InputProps & { type?: "text" | "email" | "tel" | "url" | "date" | "time" | "number" }) {
  return (
    <Field label={p.label} name={p.name} hint={p.hint} className={p.className}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          name={p.name}
          type={type}
          defaultValue={p.defaultValue}
          placeholder={p.placeholder}
          required={p.required}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          inputMode={type === "number" ? "numeric" : undefined}
          className={fieldClass}
        />
      )}
    </Field>
  );
}

export function TextArea({ rows = 4, ...p }: InputProps & { rows?: number }) {
  return (
    <Field label={p.label} name={p.name} hint={p.hint} className={p.className}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          name={p.name}
          rows={rows}
          defaultValue={p.defaultValue}
          placeholder={p.placeholder}
          required={p.required}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={`${fieldClass} resize-y py-2.5 leading-relaxed`}
        />
      )}
    </Field>
  );
}

export function SelectInput({
  options,
  ...p
}: InputProps & { options: { value: string; label: string }[] }) {
  return (
    <Field label={p.label} name={p.name} hint={p.hint} className={p.className}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          name={p.name}
          defaultValue={p.defaultValue}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={`${fieldClass} cursor-pointer`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

/** A yes/no choice with an explanation, e.g. "Bara för medlemmar". */
export function CheckboxField({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: ReactNode;
  name: string;
  defaultChecked?: boolean;
  hint?: ReactNode;
}) {
  return (
    <label data-field={name} className="flex cursor-pointer items-start gap-2.5 font-semibold">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-5 w-5 flex-none accent-orange-dark"
      />
      <span className="flex flex-col">
        {label}
        {hint && <span className="text-[13px] font-normal text-muted">{hint}</span>}
      </span>
    </label>
  );
}

/** Preview of an image URL or a chosen file. */
function ImagePreview({ src, contain = false }: { src?: string; contain?: boolean }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- previews of uploads and blob: URLs
    <img
      src={src}
      alt=""
      className={`h-24 w-36 flex-none rounded-lg border border-line bg-white ${contain ? "object-contain p-1.5" : "object-cover"}`}
    />
  ) : (
    <span className="flex h-24 w-36 flex-none items-center justify-center rounded-lg border border-dashed border-[#cfc8c4] bg-white text-muted">
      <IconImage size={26} />
    </span>
  );
}

/**
 * Pick an image from the computer or phone. The current image is kept unless
 * a new one is chosen or it is removed. Read it in the action with
 * imageFrom(data, name) from ./server.
 */
export function ImageField({
  label,
  name,
  current,
  hint,
  contain = false,
}: {
  label: ReactNode;
  name: string;
  /** URL of the image used today, if any. */
  current?: string;
  hint?: ReactNode;
  /** Logos: show the whole image instead of cropping. */
  contain?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const error = useFieldError(name);
  const id = useId();
  const shown = picked ?? (removed ? undefined : current);

  useEffect(() => () => {
    if (picked) URL.revokeObjectURL(picked);
  }, [picked]);

  return (
    <div data-field={name} className="flex flex-col gap-1.5">
      <span id={`${id}-l`} className="text-[14px] font-semibold">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">
        <ImagePreview src={shown} contain={contain} />
        <div className="flex flex-col items-start gap-1.5">
          <button
            type="button"
            onClick={() => input.current?.click()}
            aria-describedby={`${id}-l`}
            className="btn btn-outline min-h-10 bg-white px-3 text-[14px]"
          >
            {shown ? "Byt bild" : "Välj bild"}
          </button>
          {shown && (
            <button
              type="button"
              onClick={() => {
                setPicked(null);
                setRemoved(true);
                if (input.current) input.current.value = "";
                input.current?.dispatchEvent(new Event("input", { bubbles: true }));
              }}
              className="cursor-pointer text-[13px] font-semibold text-muted underline underline-offset-2 hover:text-[#b3261e]"
            >
              Ta bort bilden
            </button>
          )}
        </div>
      </div>
      <input type="hidden" name={name} value={removed ? "" : (current ?? "")} />
      <input
        ref={input}
        type="file"
        name={`${name}__file`}
        accept="image/jpeg,image/png,image/webp"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          setPicked(f ? URL.createObjectURL(f) : null);
          if (f) setRemoved(false);
        }}
      />
      {error && <span className="text-[13px] font-semibold text-[#b3261e]">{error}</span>}
      <span className="text-[13px] text-muted">{hint ?? "JPG, PNG eller WebP, högst 10 MB."}</span>
    </div>
  );
}

// ───────────────────────── List editor ─────────────────────────

export type ListField = {
  name: string;
  label: string;
  /**
   * "lines": a string[] edited as one item per line. "image": an image URL with
   * upload — resolve uploads in the action with resolveListImages().
   */
  type?: "line" | "text" | "select" | "date" | "time" | "number" | "url" | "email" | "lines" | "image";
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  /** Grid columns on wide screens (of 6). Default: 3 for short fields, 6 for text. */
  span?: 1 | 2 | 3 | 4 | 6;
};

type Row = Record<string, unknown> & { __key: string };

// Initial rows get index keys (the same on server and client, so hydration
// matches); rows added later get a running number.
let keySeq = 0;
const withKey = (item: Record<string, unknown>, key = `n${++keySeq}`): Row => ({ ...item, __key: key });
const spanClass = { 1: "md:col-span-1", 2: "md:col-span-2", 3: "md:col-span-3", 4: "md:col-span-4", 6: "md:col-span-6" };

/**
 * Edit a list of similar things — FAQs, board members, sponsors — as cards
 * that can be added, removed and moved. The whole list is posted as JSON in
 * a hidden input called `name`; parse it with parseList() in the action.
 * Server errors use keys like `${name}.${index}.${field}`.
 */
export function ListEditor<T extends object>({
  name,
  initial,
  fields,
  newItem,
  titleField,
  untitled = "Ny rad",
  addLabel = "Lägg till",
  emptyText = "Listan är tom.",
  numbered = false,
}: {
  name: string;
  initial: T[];
  fields: ListField[];
  newItem: T;
  /** The field whose value heads each card, e.g. "q" for the question itself. */
  titleField: keyof T & string;
  /** Card heading while that field is empty, e.g. "Ny fråga". */
  untitled?: string;
  addLabel?: string;
  emptyText?: string;
  /** Show the position, for lists where order is shown on the site. */
  numbered?: boolean;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((item, i) => withKey(item as Record<string, unknown>, `i${i}`)),
  );
  const errors = useContext(ErrorsContext);
  const hidden = useRef<HTMLInputElement>(null);
  const lastAdded = useRef<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  // The form tracks "unsaved" through input events; tell it about list changes too.
  const changed = () => hidden.current?.dispatchEvent(new Event("input", { bubbles: true }));

  useEffect(() => {
    if (!lastAdded.current) return;
    const li = listRef.current?.querySelector<HTMLElement>(`[data-row="${lastAdded.current}"]`);
    lastAdded.current = null;
    li?.scrollIntoView({ behavior: "smooth", block: "center" });
    li?.querySelector<HTMLElement>("input,textarea,select")?.focus({ preventScroll: true });
  }, [rows]);

  function update(key: string, field: string, value: unknown) {
    setRows((rs) => rs.map((r) => (r.__key === key ? { ...r, [field]: value } : r)));
  }
  function move(i: number, d: -1 | 1) {
    setRows((rs) => {
      const next = [...rs];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });
    changed();
  }
  function remove(i: number) {
    setRows((rs) => rs.filter((_, j) => j !== i));
    changed();
  }
  function add() {
    const row = withKey(structuredClone(newItem) as Record<string, unknown>);
    lastAdded.current = row.__key;
    setRows((rs) => [...rs, row]);
    changed();
  }

  // Row keys are for React only; JSON.stringify's replacer drops them.
  const value = JSON.stringify(rows, (k, v) => (k === "__key" ? undefined : v));

  return (
    <div className="flex flex-col gap-3">
      <input ref={hidden} type="hidden" name={name} value={value} />
      {rows.length === 0 && (
        <p className="m-0 rounded-[10px] border border-dashed border-line px-4 py-6 text-center text-muted">{emptyText}</p>
      )}
      <ol ref={listRef} className="m-0 flex list-none flex-col gap-3 p-0">
        {rows.map((row, i) => {
          const raw = row[titleField];
          const title = (Array.isArray(raw) ? raw.join(", ") : String(raw ?? "")).trim() || untitled;
          return (
            <li
              key={row.__key}
              data-row={row.__key}
              className="flex flex-col gap-3 rounded-[10px] border border-line bg-paper/60 p-4"
            >
              <div className="flex items-center gap-2">
                {numbered && (
                  <span className="flex h-7 min-w-7 flex-none -skew-x-[12deg] items-center justify-center rounded-[5px] bg-ink px-1.5 text-[13px] font-extrabold text-white">
                    {i + 1}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate font-bold">{title}</span>
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Flytta upp: ${title}`}
                  title="Flytta upp"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-white hover:text-ink disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <IconArrowUp size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === rows.length - 1}
                  aria-label={`Flytta ner: ${title}`}
                  title="Flytta ner"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-white hover:text-ink disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <IconArrowDown size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Ta bort: ${title}`}
                  title="Ta bort"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-[#fdf1f0] hover:text-[#b3261e]"
                >
                  <IconTrash size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                {fields.map((f) => (
                  <ListFieldInput
                    key={f.name}
                    field={f}
                    fileName={`${name}__file__${row.__key}__${f.name}`}
                    onUpload={(inputName) => update(row.__key, `${f.name}__upload`, inputName)}
                    value={row[f.name]}
                    error={errors[`${name}.${i}.${f.name}`]}
                    errorKey={`${name}.${i}.${f.name}`}
                    onChange={(v) => update(row.__key, f.name, v)}
                  />
                ))}
              </div>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        onClick={add}
        className="btn btn-outline self-start border-dashed border-[#cfc8c4] bg-white"
      >
        <IconPlus size={18} /> {addLabel}
      </button>
    </div>
  );
}

function ListFieldInput({
  field: f,
  value,
  error,
  errorKey,
  onChange,
  fileName,
  onUpload,
}: {
  field: ListField;
  value: unknown;
  error?: string;
  errorKey: string;
  onChange: (v: unknown) => void;
  /** Name of this row's file input (type "image"). */
  fileName: string;
  /** Tell the row which file input holds a new image (or null). */
  onUpload: (inputName: string | null) => void;
}) {
  const id = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const type = f.type ?? "line";
  const long = type === "text" || type === "lines" || type === "image";
  const span = f.span ?? (long ? 6 : 3);
  const describedBy = [error && `${id}-err`, f.hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  } as const;

  let control: ReactNode;
  if (type === "image") {
    const shown = picked ?? (value ? String(value) : undefined);
    control = (
      <div className="flex flex-wrap items-center gap-3">
        <ImagePreview src={shown} contain />
        <div className="flex flex-col items-start gap-1.5">
          <button
            id={id}
            type="button"
            onClick={() => fileInput.current?.click()}
            className="btn btn-outline min-h-10 bg-white px-3 text-[14px]"
          >
            {shown ? "Byt bild" : "Välj bild"}
          </button>
          {shown && (
            <button
              type="button"
              onClick={() => {
                setPicked(null);
                if (fileInput.current) fileInput.current.value = "";
                onUpload(null);
                onChange("");
              }}
              className="cursor-pointer text-[13px] font-semibold text-muted underline underline-offset-2 hover:text-[#b3261e]"
            >
              Ta bort bilden
            </button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          name={fileName}
          accept="image/jpeg,image/png,image/webp"
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (picked) URL.revokeObjectURL(picked);
            setPicked(file ? URL.createObjectURL(file) : null);
            onUpload(file ? fileName : null);
          }}
        />
      </div>
    );
  } else if (type === "select") {
    control = (
      <select {...common} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={`${fieldClass} cursor-pointer`}>
        {f.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (long) {
    const text = type === "lines" ? ((value as string[] | undefined) ?? []).join("\n") : String(value ?? "");
    control = (
      <textarea
        {...common}
        rows={type === "lines" ? Math.max(2, text.split("\n").length) : 3}
        value={text}
        placeholder={f.placeholder}
        onChange={(e) => onChange(type === "lines" ? e.target.value.split("\n") : e.target.value)}
        className={`${fieldClass} resize-y py-2.5 leading-relaxed`}
      />
    );
  } else {
    control = (
      <input
        {...common}
        type={type === "line" ? "text" : type}
        value={value === undefined || value === null ? "" : String(value)}
        placeholder={f.placeholder}
        inputMode={type === "number" ? "numeric" : undefined}
        onChange={(e) => onChange(type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
        className={fieldClass}
      />
    );
  }

  return (
    <div data-field={errorKey} className={`flex min-w-0 flex-col gap-1 ${spanClass[span]}`}>
      <label htmlFor={id} className="text-[13px] font-semibold">
        {f.label}
      </label>
      {control}
      {error && (
        <span id={`${id}-err`} className="text-[13px] font-semibold text-[#b3261e]">
          {error}
        </span>
      )}
      {f.hint && (
        <span id={`${id}-hint`} className="text-[12px] text-muted">
          {f.hint}
        </span>
      )}
    </div>
  );
}
