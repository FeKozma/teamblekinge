"use client";

import { useFieldError } from "@/components/admin/form";

/** An error about a whole list ("Lägg till minst en distans"), shown under it. */
export function ListError({ name }: { name: string }) {
  const error = useFieldError(name);
  return (
    <p data-field={name} role={error ? "alert" : undefined} className="m-0 text-[13px] font-semibold text-[#b3261e] empty:hidden">
      {error}
    </p>
  );
}
