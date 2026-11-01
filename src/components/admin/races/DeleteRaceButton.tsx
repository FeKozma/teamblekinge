"use client";

import { useRef, useTransition } from "react";

/** "Ta bort loppet" in the editor's save bar. Asks first; the action redirects to the list. */
export function DeleteRaceButton({ name, action }: { name: string; action: () => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="cursor-pointer px-2 text-[14px] font-semibold text-muted underline underline-offset-2 hover:text-[#b3261e]"
      >
        Ta bort loppet
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="delete-race-h"
        className="m-auto w-[min(460px,calc(100vw-24px))] rounded-2xl border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/50"
      >
        <div className="flex flex-col gap-3 p-6">
          <h2 id="delete-race-h" className="m-0 text-[20px] font-extrabold">
            Ta bort {name}?
          </h2>
          <p className="m-0 text-muted">
            Loppet försvinner från Tävla och startsidan, och länkar till loppets sida slutar fungera. Det går inte att
            ångra.
          </p>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => dialog.current?.close()} className="btn btn-outline">
              Avbryt
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => action())}
              className="btn bg-[#b3261e] text-white hover:bg-[#8f1e18] hover:text-white disabled:opacity-70"
            >
              {pending ? "Tar bort …" : "Ja, ta bort"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
