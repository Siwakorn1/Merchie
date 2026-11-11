/**
 * Language primitives with no React: safe to import from server components and data files.
 * Hooks live in lib/i18n.ts (client only).
 */
export type Lang = "th" | "en";
export type L = { th: string; en: string };

export const l = (th: string, en: string): L => ({ th, en });
