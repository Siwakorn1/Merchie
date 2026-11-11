"use client";

import { useSyncExternalStore } from "react";

/**
 * Light / dark mode, stored per viewer. The <html data-theme> attribute is also set by an
 * inline script in app/layout.tsx before first paint, so dark mode never flashes white.
 * The accent (blue / green / yellow) follows Merchie's look and is set by DemoProvider.
 */
export type Mode = "light" | "dark";

const KEY = "merchie.theme";
const EVENT = "merchie:theme";

function read(): Mode {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function setMode(mode: Mode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {}
  document.documentElement.dataset.theme = mode;
  window.dispatchEvent(new Event(EVENT));
}

export function useMode() {
  const mode = useSyncExternalStore(subscribe, read, () => "light" as Mode);
  return { mode, setMode };
}
