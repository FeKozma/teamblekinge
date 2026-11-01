"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "@/components/documents/Toaster";

/**
 * A toast after an action that redirected here (e.g. ?borttagen=1), then the
 * flag is dropped from the address so a reload doesn't repeat it.
 */
export function FlashToast({ message }: { message: string }) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    // Next frame: the layout's <Toaster> starts listening in its own effect.
    // (A second run in dev's strict mode is harmless: the Toaster drops repeats.)
    requestAnimationFrame(() => toast(message));
    router.replace(pathname, { scroll: false });
  }, [message, pathname, router]);
  return null;
}
