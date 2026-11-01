"use client";

import { useRef, useTransition } from "react";
import { resetAllContent } from "@/app/admin/actions";
import { toast } from "@/components/documents/Toaster";

/** Demo only: puts every text, news item and event back as it was for this visitor. Asks first. */
export function ResetContentButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className="btn btn-outline bg-white">
        Återställ allt innehåll
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="reset-h"
        className="m-auto w-[min(460px,calc(100vw-24px))] rounded-2xl border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/50"
      >
        <div className="flex flex-col gap-3 p-6">
          <h2 id="reset-h" className="m-0 text-[20px] font-extrabold">
            Återställa allt innehåll?
          </h2>
          <p className="m-0 text-muted">
            Allt du har ändrat och laddat upp i administrationen – nyheter, kalender, dokument, texter – försvinner,
            och webbplatsen ser ut som från början igen.
          </p>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => dialog.current?.close()} className="btn btn-outline">
              Avbryt
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await resetAllContent();
                  dialog.current?.close();
                  toast("Innehållet är återställt.");
                })
              }
              className="btn btn-dark disabled:opacity-70"
            >
              {pending ? "Återställer …" : "Ja, återställ"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
