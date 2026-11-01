"use client";

import { useId, useState } from "react";
import { Field, fieldClass } from "@/components/admin/form";

const OTHER = "__other";

/**
 * Where a link goes: a page on the site picked from a list, or any web
 * address. Posts the chosen address in an input called `name`.
 */
export function LinkPicker({
  label,
  name,
  defaultValue,
  options,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  /** Pages on the site, grouped: { group, items: [{ value: "/tavla", label: "Tävla" }] }. */
  options: { group: string; items: { value: string; label: string }[] }[];
  hint?: string;
}) {
  const known = options.some((g) => g.items.some((o) => o.value === defaultValue)) || defaultValue === "";
  const [choice, setChoice] = useState(known ? defaultValue : OTHER);
  const [other, setOther] = useState(known ? "" : defaultValue);
  const otherId = useId();
  const value = choice === OTHER ? other : choice;

  return (
    <Field label={label} name={name} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <div className="flex flex-col gap-2">
          <input type="hidden" name={name} value={value} />
          <select
            id={id}
            value={choice}
            aria-describedby={describedBy}
            aria-invalid={choice !== OTHER ? invalid : undefined}
            onChange={(e) => setChoice(e.target.value)}
            className={`${fieldClass} cursor-pointer`}
          >
            <option value="">Ingen länk</option>
            {options.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={OTHER}>En annan webbadress …</option>
          </select>
          {choice === OTHER && (
            <>
              <label htmlFor={otherId} className="sr-only">
                Webbadress
              </label>
              <input
                id={otherId}
                type="url"
                value={other}
                placeholder="https://"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                onChange={(e) => setOther(e.target.value)}
                className={fieldClass}
              />
            </>
          )}
        </div>
      )}
    </Field>
  );
}
