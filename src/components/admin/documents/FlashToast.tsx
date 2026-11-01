"use client";

import { useEffect } from "react";
import { toast } from "@/components/documents/Toaster";

/**
 * A toast for something that happened on the previous page (an upload, a
 * delete) and came here through a redirect with ?ny= / ?borttaget= …. The
 * query is dropped afterwards so a reload doesn't repeat it.
 */
export function FlashToast({ message }: { message: string }) {
  useEffect(() => {
    toast(message);
    window.history.replaceState(null, "", window.location.pathname);
  }, [message]);
  return null;
}
