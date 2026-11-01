"use client";

import { useId, type ReactNode } from "react";
import { useFieldError } from "@/components/admin/form";

/**
 * A choice between a few options, each with a line on what it means — for
 * questions a list box would make cryptic ("Vem får läsa?"). Uncontrolled
 * with `defaultValue`, controlled with `value` + `onChange`.
 */
export function ChoiceCards<V extends string>({
  legend,
  name,
  options,
  defaultValue,
  value,
  onChange,
  hint,
}: {
  legend: ReactNode;
  name: string;
  options: readonly { value: V; label: string; about: string }[];
  defaultValue?: V;
  value?: V;
  onChange?: (v: V) => void;
  hint?: ReactNode;
}) {
  const error = useFieldError(name);
  const id = useId();
  const describedBy = [error && `${id}-err`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <fieldset data-field={name} aria-describedby={describedBy} className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0">
      <legend className="mb-1.5 p-0 text-[14px] font-semibold">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer items-start gap-3 rounded-[10px] border-[1.5px] border-[#cfc8c4] bg-white p-3 transition-[border-color,translate,rotate,box-shadow] duration-300 ease-sprint hover:-translate-y-0.5 hover:border-muted has-[:checked]:border-ink has-[:checked]:shadow-[0_8px_18px_-10px_rgb(34_30_31/0.55)] has-[:checked]:[rotate:-0.5deg] has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              {...(value === undefined
                ? { defaultChecked: o.value === defaultValue }
                : { checked: o.value === value, onChange: () => onChange?.(o.value) })}
              className="mt-0.5 h-5 w-5 flex-none accent-orange-dark"
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-bold">{o.label}</span>
              <span className="text-[13px] text-muted">{o.about}</span>
            </span>
          </label>
        ))}
      </div>
      {error && (
        <span id={`${id}-err`} className="text-[13px] font-semibold text-[#b3261e]">
          {error}
        </span>
      )}
      {hint && (
        <span id={`${id}-hint`} className="text-[13px] text-muted">
          {hint}
        </span>
      )}
    </fieldset>
  );
}
