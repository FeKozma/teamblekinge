"use client";

import { IconDownload } from "./bits";
import { toast } from "./Toaster";

/** "Ladda ner (demo)" — there is no file behind the demo, so it says so. */
export function DownloadButton({ fileName, size }: { fileName: string; size: string }) {
  return (
    <button
      type="button"
      onClick={() =>
        toast(`Demo: på riktiga webbplatsen laddas ”${fileName}” (${size}) ner här.`, "info")
      }
      className="btn btn-primary"
    >
      <IconDownload size={18} strokeWidth={2.4} />
      Ladda ner <span className="font-medium">(demo)</span>
    </button>
  );
}
