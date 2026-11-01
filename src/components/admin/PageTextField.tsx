"use client";

import { useRef, useState } from "react";
import { Field, fieldClass } from "./form";

/**
 * One editable page text. Shows when it differs from the original and lets
 * the editor put the original back with one click.
 */
export function PageTextField({
  name,
  label,
  value,
  original,
  long = false,
  hint,
}: {
  name: string;
  label: string;
  value: string;
  original: string;
  long?: boolean;
  hint?: string;
}) {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const [current, setCurrent] = useState(value);
  const changed = current.trim() !== original;

  function restore() {
    const el = ref.current;
    if (!el) return;
    el.value = original;
    setCurrent(original);
    // Let the form know there is something to save.
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus();
  }

  const rows = Math.min(10, Math.max(3, Math.ceil(original.length / 70) + original.split("\n").length - 1));

  return (
    <Field
      name={name}
      label={
        <span className="flex flex-wrap items-center gap-2">
          {label}
          {changed && (
            <span className="rounded-full bg-orange-soft px-2 py-px text-[11px] font-bold tracking-[0.3px] text-orange-dark uppercase">
              Ändrad
            </span>
          )}
        </span>
      }
      hint={
        <>
          {hint && <span className="block">{hint}</span>}
          {long && <span className="block">Tom rad mellan stycken.</span>}
          {changed && (
            <button
              type="button"
              onClick={restore}
              className="cursor-pointer text-[13px] font-semibold text-orange-dark underline underline-offset-2 hover:text-ink"
            >
              Återställ originaltexten
            </button>
          )}
        </>
      }
    >
      {({ id, describedBy, invalid }) =>
        long ? (
          <textarea
            ref={ref}
            id={id}
            name={name}
            rows={rows}
            defaultValue={value}
            onChange={(e) => setCurrent(e.target.value)}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={`${fieldClass} resize-y py-2.5 leading-relaxed`}
          />
        ) : (
          <input
            ref={ref}
            id={id}
            name={name}
            defaultValue={value}
            onChange={(e) => setCurrent(e.target.value)}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={fieldClass}
          />
        )
      }
    </Field>
  );
}
