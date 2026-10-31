"use client";

import { resetDemoState } from "@/lib/demo-store";

export function ResetDemoButton() {
  return (
    <button type="button" onClick={resetDemoState} className="underline underline-offset-2 hover:text-white">
      Återställ demons klick
    </button>
  );
}
