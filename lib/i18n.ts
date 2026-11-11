"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny TH/EN switch. No library: UI strings sit next to their usage as t("ไทย", "English"),
 * content strings are { th, en } objects. Data that comes from the marketplace
 * (product names, listing text, customer reviews) stays in its original language.
 */
import type { Lang, L } from "./i18n-core";
export { l, type Lang, type L } from "./i18n-core";

const KEY = "merchie.lang";
const EVENT = "merchie:lang";

function read(): Lang {
  try {
    return localStorage.getItem(KEY) === "en" ? "en" : "th";
  } catch {
    return "th";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function setLang(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {}
  document.documentElement.lang = lang;
  window.dispatchEvent(new Event(EVENT));
}

export function useLang() {
  const lang = useSyncExternalStore(subscribe, read, () => "th" as Lang);
  /** t("ไทย", "English") */
  const t = useCallback((th: string, en: string) => (lang === "th" ? th : en), [lang]);
  /** tr({ th, en }) */
  const tr = useCallback((x: L) => x[lang], [lang]);
  return { lang, setLang, t, tr };
}
