"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useTransition, type ReactNode } from "react";
import type { FormState } from "@/components/admin/form-state";
import { toast } from "@/components/documents/Toaster";
import { IconTrash } from "@/components/icons";

/**
 * "Ta bort" that asks first, then goes back to the list. Safe inside an
 * <AdminForm>: none of its buttons submit the form.
 */
export function DeleteButton({
  action,
  question,
  children,
  confirmLabel = "Ja, ta bort",
  backTo,
}: {
  action: () => Promise<FormState>;
  /** "Ta bort Styrelsemöte från kalendern?" */
  question: string;
  /** What happens, and what to do instead. */
  children: ReactNode;
  confirmLabel?: string;
  backTo: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const id = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="btn min-h-12 rounded-[10px] px-3 text-[#b3261e] hover:bg-[#fdf1f0]"
      >
        <IconTrash size={18} /> Ta bort
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={`${id}-h`}
        className="m-auto w-[min(460px,calc(100vw-24px))] rounded-2xl border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/50"
      >
        <div className="flex flex-col gap-3 p-6">
          <h2 id={`${id}-h`} className="m-0 text-[20px] font-extrabold">
            {question}
          </h2>
          <div className="flex flex-col gap-2 text-muted">{children}</div>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => dialog.current?.close()} className="btn btn-outline">
              Avbryt
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await action();
                  dialog.current?.close();
                  if (res?.ok) {
                    if (res.message) toast(res.message);
                    router.push(backTo);
                  } else {
                    toast(res?.message ?? "Det gick inte att ta bort.", "info");
                  }
                })
              }
              className="btn bg-[#b3261e] text-white hover:bg-[#8f1e18] hover:text-white disabled:opacity-70"
            >
              {pending ? "Tar bort …" : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
