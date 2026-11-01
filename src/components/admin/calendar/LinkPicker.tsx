"use client";

import { useRef, useState } from "react";
import { Field, fieldClass } from "@/components/admin/form";
import { IconExternal } from "@/components/public/icons";

export type LinkGroup = { label: string; options: { value: string; label: string }[] };

/**
 * Where an event links to: a page, race or news item picked from a list, or
 * a pasted web address. Posts `link` (a path, "url" or "") and `linkUrl`;
 * read them with readEventFields().
 */
export function LinkPicker({ groups, current }: { groups: LinkGroup[]; current?: string }) {
  const known = !!current && groups.some((g) => g.options.some((o) => o.value === current));
  const [choice, setChoice] = useState(!current ? "" : known ? current : "url");
  const urlInput = useRef<HTMLInputElement>(null);

  return (
    <Field
      label="Länk"
      name="link"
      hint="Dit man kommer när man klickar på händelsen i kalendern. Välj en sida, ett av våra lopp eller en nyhet – eller klistra in en webbadress, till exempel till anmälan."
    >
      {({ id, describedBy, invalid }) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <select
              id={id}
              name="link"
              value={choice}
              aria-describedby={describedBy}
              aria-invalid={choice !== "url" ? invalid : undefined}
              onChange={(e) => {
                setChoice(e.target.value);
                if (e.target.value === "url") requestAnimationFrame(() => urlInput.current?.focus());
              }}
              className={`${fieldClass} min-w-0 flex-1 cursor-pointer`}
            >
              <option value="">Ingen länk</option>
              <option value="url">Klistra in en webbadress …</option>
              {groups.map(
                (g) =>
                  g.options.length > 0 && (
                    <optgroup key={g.label} label={g.label}>
                      {g.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </optgroup>
                  ),
              )}
            </select>
            {choice && choice !== "url" && (
              <a
                href={choice}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-11 flex-none items-center gap-1 px-1 text-[14px] font-semibold text-orange-dark"
              >
                Öppna <IconExternal size={14} />
                <span className="sr-only">sidan i en ny flik</span>
              </a>
            )}
          </div>
          {choice === "url" && (
            <input
              ref={urlInput}
              name="linkUrl"
              type="url"
              inputMode="url"
              defaultValue={known ? "" : current}
              placeholder="https://"
              aria-label="Webbadress"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              className={fieldClass}
            />
          )}
        </div>
      )}
    </Field>
  );
}
