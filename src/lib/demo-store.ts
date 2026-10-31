"use client";

import { useCallback, useSyncExternalStore } from "react";

// Tiny persistent store for the demo's interactive bits (likes, "jag hänger
// med", comments, sign-ups). Lives in localStorage so a visitor can click
// around and keep their changes; nothing reaches a server. Swap for server
// actions once there is a database.

const PREFIX = "tb:";
const EVENT = "tb-demo-store";

const cache = new Map<string, { raw: string | null; value: unknown }>();
const serverCache = new Map<string, unknown>();

function read<T>(key: string, initial: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PREFIX + key);
  } catch {
    // Storage blocked (private mode etc.) — fall back to the initial value.
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value = initial;
  if (raw != null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = initial;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function useDemoState<T>(key: string, initial: T) {
  if (!serverCache.has(key)) serverCache.set(key, initial);
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, initial),
    () => serverCache.get(key) as T,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, initial);
      const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(v));
      } catch {
        cache.set(key, { raw: JSON.stringify(v), value: v });
      }
      window.dispatchEvent(new Event(EVENT));
    },
    // `initial` is only a fallback; callers often pass a fresh literal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, set] as const;
}

/** Forget every demo interaction (used by "Återställ demo" in the footer). */
export function resetDemoState() {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith(PREFIX)) localStorage.removeItem(k);
  } catch {
    // ignore
  }
  cache.clear();
  window.dispatchEvent(new Event(EVENT));
}
