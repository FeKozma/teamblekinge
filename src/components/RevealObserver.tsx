"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Adds `.is-in` to [data-reveal] / [data-settle] elements as they scroll into
 * view, which plays their entrance (globals.css). Elements already on screen
 * at load get it immediately. Re-scans after every navigation and whenever
 * new content is added, so client-rendered lists animate too.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const scan = () =>
      document
        .querySelectorAll("[data-reveal]:not(.is-in), [data-settle]:not(.is-in)")
        .forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
