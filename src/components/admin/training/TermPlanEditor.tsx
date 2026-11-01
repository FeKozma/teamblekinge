"use client";

import { useEffect, useId, useRef, useState } from "react";
import { fieldClass, useFieldError } from "@/components/admin/form";
import { IconPlus, IconTrash } from "@/components/icons";
import { Pill } from "@/components/ui";
import { addDays, longDate, nextTuesday } from "@/lib/format";

// The term plan as a table: one row per Tuesday, one text per group. "Lägg
// till en tisdag" adds the week after the last row, so filling in a term is
// a matter of clicking and typing. Posted as JSON in a hidden input called
// `name` (rows of { date, [groupId]: text }); errors use `${name}.${i}.${field}`.

type Group = { id: string; name: string; short: string; tone: "ink" | "orange" | "purple" };
type Row = { key: string; date: string; texts: Record<string, string> };

let keySeq = 0;

export function TermPlanEditor({
  name,
  initial,
  groups,
  today,
}: {
  name: string;
  initial: { date: string; texts: Record<string, string> }[];
  groups: Group[];
  today: string;
}) {
  const [rows, setRows] = useState<Row[]>(() => initial.map((r, i) => ({ ...r, key: `i${i}` })));
  const hidden = useRef<HTMLInputElement>(null);
  const added = useRef<string | null>(null);
  const list = useRef<HTMLOListElement>(null);

  // The form tracks "unsaved" through input events; tell it about row changes too.
  const changed = () => hidden.current?.dispatchEvent(new Event("input", { bubbles: true }));

  useEffect(() => {
    if (!added.current) return;
    const li = list.current?.querySelector<HTMLElement>(`[data-row="${added.current}"]`);
    added.current = null;
    li?.scrollIntoView({ behavior: "smooth", block: "center" });
    li?.querySelectorAll<HTMLElement>("input")[1]?.focus({ preventScroll: true });
  }, [rows]);

  function add() {
    const last = rows.map((r) => r.date).filter(Boolean).sort().at(-1);
    const date = last && last >= today ? addDays(last, 7) : nextTuesday(today);
    const row = { key: `n${++keySeq}`, date, texts: Object.fromEntries(groups.map((g) => [g.id, ""])) };
    added.current = row.key;
    setRows((rs) => [...rs, row]);
    changed();
  }
  function update(key: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function remove(key: string) {
    setRows((rs) => rs.filter((r) => r.key !== key));
    changed();
  }
  function removePast() {
    setRows((rs) => rs.filter((r) => !r.date || r.date >= today));
    changed();
  }

  const value = JSON.stringify(rows.map((r) => ({ date: r.date, ...r.texts })));
  const pastCount = rows.filter((r) => r.date && r.date < today).length;

  return (
    <div className="flex flex-col gap-3">
      <input ref={hidden} type="hidden" name={name} value={value} />
      {rows.length === 0 && (
        <p className="m-0 rounded-[10px] border border-dashed border-line px-4 py-6 text-center text-muted">
          Inga tisdagar i planen ännu.
        </p>
      )}
      <ol ref={list} className="m-0 flex list-none flex-col gap-3 p-0">
        {rows.map((row, i) => (
          <PlanRow
            key={row.key}
            row={row}
            index={i}
            name={name}
            groups={groups}
            past={!!row.date && row.date < today}
            onDate={(date) => update(row.key, { date })}
            onText={(id, text) => update(row.key, { texts: { ...row.texts, [id]: text } })}
            onRemove={() => remove(row.key)}
          />
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={add} className="btn btn-outline border-dashed border-[#cfc8c4] bg-white">
          <IconPlus size={18} /> Lägg till en tisdag
        </button>
        {pastCount > 0 && (
          <button
            type="button"
            onClick={removePast}
            className="cursor-pointer text-[14px] font-semibold text-muted underline underline-offset-2 hover:text-[#b3261e]"
          >
            Ta bort {pastCount === 1 ? "den passerade tisdagen" : `de ${pastCount} passerade tisdagarna`}
          </button>
        )}
      </div>
    </div>
  );
}

function PlanRow({
  row,
  index,
  name,
  groups,
  past,
  onDate,
  onText,
  onRemove,
}: {
  row: Row;
  index: number;
  name: string;
  groups: Group[];
  past: boolean;
  onDate: (date: string) => void;
  onText: (groupId: string, text: string) => void;
  onRemove: () => void;
}) {
  const id = useId();
  const dateError = useFieldError(`${name}.${index}.date`);
  const title = row.date ? longDate(row.date) : "Ny tisdag";
  return (
    <li
      data-row={row.key}
      className={`flex flex-col gap-3 rounded-[10px] border border-line p-4 ${past ? "bg-paper/40 opacity-75" : "bg-paper/60"}`}
    >
      <div className="flex flex-wrap items-end gap-3">
        <div data-field={`${name}.${index}.date`} className="flex flex-col gap-1">
          <label htmlFor={`${id}-date`} className="text-[13px] font-semibold">
            Datum
          </label>
          <input
            id={`${id}-date`}
            type="date"
            value={row.date}
            onChange={(e) => onDate(e.target.value)}
            aria-invalid={dateError ? true : undefined}
            aria-describedby={dateError ? `${id}-date-err` : undefined}
            className={`${fieldClass} w-[11.5rem]`}
          />
        </div>
        <span className="mb-2.5 flex min-w-0 flex-1 items-center gap-2 font-bold">
          <span className="truncate first-letter:uppercase">{title}</span>
          {past && <span className="flex-none text-[12px] font-semibold text-muted">· har varit</span>}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Ta bort ${title}`}
          title="Ta bort"
          className="mb-0.5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-[#fdf1f0] hover:text-[#b3261e]"
        >
          <IconTrash size={18} />
        </button>
      </div>
      {dateError && (
        <span id={`${id}-date-err`} className="-mt-2 text-[13px] font-semibold text-[#b3261e]">
          {dateError}
        </span>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {groups.map((g) => (
          <GroupText
            key={g.id}
            group={g}
            errorKey={`${name}.${index}.${g.id}`}
            value={row.texts[g.id] ?? ""}
            onChange={(text) => onText(g.id, text)}
          />
        ))}
      </div>
    </li>
  );
}

function GroupText({
  group,
  errorKey,
  value,
  onChange,
}: {
  group: Group;
  errorKey: string;
  value: string;
  onChange: (text: string) => void;
}) {
  const id = useId();
  const error = useFieldError(errorKey);
  return (
    <div data-field={errorKey} className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="flex items-center">
        <Pill tone={group.tone}>{group.short}</Pill>
        <span className="sr-only">: kvällens pass för {group.name}</span>
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Kvällens pass"
        aria-invalid={error ? true : undefined}
        className={fieldClass}
      />
      {error && <span className="text-[13px] font-semibold text-[#b3261e]">{error}</span>}
    </div>
  );
}
