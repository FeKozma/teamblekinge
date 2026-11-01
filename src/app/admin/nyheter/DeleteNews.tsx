"use client";

import { useId, useRef, useTransition } from "react";
import { IconTrash } from "@/components/icons";
import { deleteNewsAction } from "./actions";

/** "Ta bort" in the editor's save bar. Asks first; the action returns to the list. */
export function DeleteNewsButton({ slug, title, comments }: { slug: string; title: string; comments: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const headingId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="btn btn-outline min-h-12 bg-white text-[#b3261e] hover:border-[#b3261e] hover:text-[#b3261e]"
      >
        <IconTrash size={18} /> Ta bort
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={headingId}
        className="m-auto w-[min(480px,calc(100vw-24px))] rounded-2xl border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/50"
      >
        <div className="flex flex-col gap-3 p-6">
          <h2 id={headingId} className="m-0 flex items-center gap-3 text-[20px] font-extrabold">
            <span aria-hidden="true" className="skew-bar h-3 w-5 bg-[#b3261e]" />
            Ta bort nyheten?
          </h2>
          <p className="m-0">
            <strong>”{title}”</strong> försvinner från webbplatsen
            {comments > 0 ? `, tillsammans med ${comments === 1 ? "kommentaren" : `de ${comments} kommentarerna`}` : ""}.
            Länkar som har delats leder då ingenstans.
          </p>
          <p className="m-0 text-[14px] text-muted">Det går inte att ångra.</p>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <button type="button" autoFocus onClick={() => dialog.current?.close()} className="btn btn-outline">
              Nej, behåll den
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => deleteNewsAction(slug))}
              className="btn border-[#b3261e] bg-[#b3261e] font-extrabold text-white hover:text-white disabled:opacity-70"
            >
              {pending ? "Tar bort …" : "Ja, ta bort"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
