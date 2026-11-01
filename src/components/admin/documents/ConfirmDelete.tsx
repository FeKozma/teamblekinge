"use client";

import { useId, useRef, useTransition, type ReactNode } from "react";
import { IconTrash } from "@/components/icons";
import { toast } from "@/components/documents/Toaster";
import type { FormState } from "@/components/admin/form-state";
import "../admin.css";

/**
 * "Ta bort" with a confirmation dialog. `action` deletes and redirects; if it
 * returns instead, its message is shown. With `blocked`, the dialog only
 * explains why it can't be done yet (clearer than a greyed-out button).
 */
export function ConfirmDelete({
  label,
  title,
  children,
  confirmLabel = "Ja, ta bort",
  action,
  blocked,
}: {
  label: string;
  title: string;
  /** What will happen, in plain words. */
  children?: ReactNode;
  confirmLabel?: string;
  action: () => Promise<FormState>;
  blocked?: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const res = await action();
      if (res && !res.ok) {
        dialog.current?.close();
        toast(res.message ?? "Det gick inte att ta bort.", "info");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="btn btn-outline min-h-12 rounded-[10px] border-[#e5c3c0] bg-white text-[#b3261e] hover:border-[#b3261e] hover:text-[#b3261e]"
      >
        <IconTrash size={18} /> {label}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={`${id}-t`}
        className="confirm-dialog m-auto w-[calc(100%-32px)] max-w-[460px] rounded-2xl border-0 bg-white p-0 text-ink shadow-[0_30px_60px_rgba(34,30,31,0.35)] backdrop:bg-ink/55"
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 id={`${id}-t`} className="m-0 flex items-center gap-3 text-[21px] leading-tight font-extrabold">
            <span aria-hidden="true" className="skew-bar h-3.5 w-5 flex-none bg-[#b3261e]" />
            {blocked ? "Det går inte än" : title}
          </h2>
          <div className="flex flex-col gap-2 text-[15px] text-muted">{blocked ?? children}</div>
          <div className="flex flex-wrap justify-end gap-2.5 pt-1">
            <button
              type="button"
              autoFocus
              onClick={() => dialog.current?.close()}
              className="btn btn-outline min-h-12 rounded-[10px] bg-white"
            >
              {blocked ? "Okej" : "Avbryt"}
            </button>
            {!blocked && (
              <button
                type="button"
                onClick={confirm}
                disabled={pending}
                className="btn min-h-12 rounded-[10px] bg-[#b3261e] px-5 font-extrabold text-white hover:text-white disabled:cursor-wait disabled:opacity-80"
              >
                {pending && (
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white motion-safe:animate-spin"
                  />
                )}
                {pending ? "Tar bort …" : confirmLabel}
              </button>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
