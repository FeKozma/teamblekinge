"use client";

import { useRef, useState, type ReactNode } from "react";
import { fieldClass, useFieldError } from "@/components/admin/form";
import { IconPlus, IconTrash } from "@/components/icons";

// A race's fee ladder as a table: one column per registration period, one row
// per distance, a fee in every cell. Posted as JSON ({ periods, rows }) in a
// hidden input called `name`. An empty table means the race has no ladder.
// Errors: `${name}.periods.${j}`, `${name}.rows.${i}.name`, `${name}.rows.${i}.fees.${j}`.

type Ladder = { periods: string[]; rows: { name: string; fees: (number | "")[] }[] };

export function FeeLadderEditor({ name, initial }: { name: string; initial?: Ladder }) {
  const [ladder, setLadder] = useState<Ladder>(() => structuredClone(initial ?? { periods: [], rows: [] }));
  const hidden = useRef<HTMLInputElement>(null);
  const changed = () => hidden.current?.dispatchEvent(new Event("input", { bubbles: true }));

  function edit(fn: (l: Ladder) => void, structural = false) {
    setLadder((l) => {
      const next = structuredClone(l);
      fn(next);
      return next;
    });
    if (structural) changed();
  }
  const addPeriod = () =>
    edit((l) => {
      l.periods.push("");
      l.rows.forEach((r) => r.fees.push(""));
      if (!l.rows.length) l.rows.push({ name: "", fees: l.periods.map(() => "" as const) });
    }, true);
  const removePeriod = (j: number) =>
    edit((l) => {
      l.periods.splice(j, 1);
      l.rows.forEach((r) => r.fees.splice(j, 1));
    }, true);
  const addRow = () =>
    edit((l) => {
      if (!l.periods.length) l.periods.push("");
      l.rows.push({ name: "", fees: l.periods.map(() => "" as const) });
    }, true);
  const removeRow = (i: number) => edit((l) => void l.rows.splice(i, 1), true);

  const empty = !ladder.periods.length && !ladder.rows.length;

  return (
    <div className="flex flex-col gap-3">
      <input ref={hidden} type="hidden" name={name} value={JSON.stringify(ladder)} />
      {empty ? (
        <p className="m-0 rounded-[10px] border border-dashed border-line px-4 py-6 text-center text-muted">
          Loppet har ingen avgiftstrappa. Lägg till en om avgiften stiger närmare loppdagen.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[10px] border border-line bg-paper/60">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="px-3 pt-3 pb-1 align-bottom text-[13px] font-semibold">
                  Distans
                </th>
                {ladder.periods.map((p, j) => (
                  <th key={j} scope="col" className="px-2 pt-3 pb-1 align-bottom font-normal">
                    <PeriodInput
                      name={name}
                      index={j}
                      value={p}
                      onChange={(v) => edit((l) => void (l.periods[j] = v))}
                      onRemove={() => removePeriod(j)}
                    />
                  </th>
                ))}
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {ladder.rows.map((row, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="px-3 py-2 align-top">
                    <Cell errorKey={`${name}.rows.${i}.name`}>
                      {(invalid) => (
                        <input
                          aria-label={`Distans, rad ${i + 1}`}
                          value={row.name}
                          placeholder="21,1 km"
                          aria-invalid={invalid}
                          onChange={(e) => edit((l) => void (l.rows[i].name = e.target.value))}
                          className={`${fieldClass} min-w-28`}
                        />
                      )}
                    </Cell>
                  </td>
                  {row.fees.map((fee, j) => (
                    <td key={j} className="px-2 py-2 align-top">
                      <Cell errorKey={`${name}.rows.${i}.fees.${j}`}>
                        {(invalid) => (
                          <span className="relative block">
                            <input
                              aria-label={`Avgift för ${row.name || `rad ${i + 1}`}, ${ladder.periods[j] || `period ${j + 1}`}`}
                              type="number"
                              inputMode="numeric"
                              min={0}
                              value={fee}
                              aria-invalid={invalid}
                              onChange={(e) =>
                                edit((l) => void (l.rows[i].fees[j] = e.target.value === "" ? "" : Number(e.target.value)))
                              }
                              className={`${fieldClass} min-w-24 pr-9`}
                            />
                            <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[14px] text-muted">
                              kr
                            </span>
                          </span>
                        )}
                      </Cell>
                    </td>
                  ))}
                  <td className="px-1 py-2 align-top">
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      aria-label={`Ta bort raden ${row.name || i + 1}`}
                      title="Ta bort raden"
                      className="flex h-11 w-10 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-[#fdf1f0] hover:text-[#b3261e]"
                    >
                      <IconTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={addRow} className="btn btn-outline border-dashed border-[#cfc8c4] bg-white">
          <IconPlus size={18} /> Lägg till en distans
        </button>
        <button type="button" onClick={addPeriod} className="btn btn-outline border-dashed border-[#cfc8c4] bg-white">
          <IconPlus size={18} /> Lägg till en period
        </button>
      </div>
    </div>
  );
}

function PeriodInput({
  name,
  index,
  value,
  onChange,
  onRemove,
}: {
  name: string;
  index: number;
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
}) {
  const error = useFieldError(`${name}.periods.${index}`);
  return (
    <span data-field={`${name}.periods.${index}`} className="flex flex-col gap-1">
      <span className="flex items-center justify-between gap-1 text-[13px] font-semibold">
        Period {index + 1}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Ta bort period ${index + 1}`}
          title="Ta bort perioden"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-muted hover:bg-[#fdf1f0] hover:text-[#b3261e]"
        >
          <IconTrash size={15} />
        </button>
      </span>
      <input
        aria-label={`Period ${index + 1}, datum`}
        value={value}
        placeholder="1/1–30/4"
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} min-w-24`}
      />
      {error && <span className="text-[13px] font-semibold text-[#b3261e]">{error}</span>}
    </span>
  );
}

function Cell({ errorKey, children }: { errorKey: string; children: (invalid?: true) => ReactNode }) {
  const error = useFieldError(errorKey);
  return (
    <span data-field={errorKey} className="flex flex-col gap-1">
      {children(error ? true : undefined)}
      {error && <span className="text-[13px] font-semibold text-[#b3261e]">{error}</span>}
    </span>
  );
}
