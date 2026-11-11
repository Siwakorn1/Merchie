export type Status = "good" | "watch" | "danger";

/**
 * Score bands: red only when it's really bad (under 30). Everything above is "watch"
 * until 70, then "good". The ring and numbers don't jump between three colors: they
 * blend continuously from amber at 30 to green at 85 (see scoreColor / scoreInk).
 */
export const DANGER_BELOW = 30;
export function scoreToStatus(score: number): Status {
  if (score >= 70) return "good";
  if (score >= DANGER_BELOW) return "watch";
  return "danger";
}

const RAMP_FROM = DANGER_BELOW; // amber here
const RAMP_TO = 85; // fully green here
const rampT = (score: number) => Math.max(0, Math.min(1, (score - RAMP_FROM) / (RAMP_TO - RAMP_FROM)));

/** Ring/fill color for a 0–100 score: red under 30, then amber blending into green (OKLCH, so no muddy olive). */
export function scoreColor(score: number): string {
  if (score < DANGER_BELOW) return statusTone.danger.hex;
  return mixOklch(statusTone.watch.hex, statusTone.good.hex, rampT(score));
}

/** Text color for a score number: the same ramp on the theme's readable ink tokens. */
export function scoreInk(score: number): string {
  if (score < DANGER_BELOW) return "var(--color-danger-ink)";
  const p = Math.round(rampT(score) * 100);
  return `color-mix(in oklch, var(--color-good-ink) ${p}%, var(--color-watch-ink))`;
}

/* ---- tiny OKLCH mixer (hex in, hex out) so motion can animate the stroke ---- */
function hexToOklch(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c: number) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const r = lin((n >> 16) & 255), g = lin((n >> 8) & 255), b = lin(n & 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), Math.atan2(B, A)];
}
function oklchToHex([L, C, h]: [number, number, number]): string {
  const A = C * Math.cos(h), B = C * Math.sin(h);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0");
  });
  return `#${rgb.join("")}`;
}
function mixOklch(a: string, b: string, t: number): string {
  const x = hexToOklch(a), y = hexToOklch(b);
  let dh = y[2] - x[2];
  if (dh > Math.PI) dh -= 2 * Math.PI;
  if (dh < -Math.PI) dh += 2 * Math.PI;
  return oklchToHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + dh * t]);
}

/**
 * Merchie's face follows the score in finer steps than the ring color, so it only looks
 * sad when things are really bad. "shocked" is reserved for Crisis Mode / suspension.
 */
export function scoreToMood(score: number): "sad" | "worried" | "okay" | "happy" | "delighted" {
  if (score < 30) return "sad";
  if (score < 55) return "worried";
  if (score < 75) return "okay";
  if (score < 90) return "happy";
  return "delighted";
}

/** Short, human words. Shown sparingly — color does most of the talking. */
export const statusLabel: Record<Status, string> = {
  good: "สบายดี",
  watch: "ต้องดูหน่อย",
  danger: "ต้องแก้",
};

/** Tailwind classes per status. Never reuse brand blues here. */
export const statusTone: Record<Status, { base: string; soft: string; ink: string; hex: string }> = {
  good: { base: "bg-good", soft: "bg-good-soft", ink: "text-good-ink", hex: "#2FBF71" },
  watch: { base: "bg-watch", soft: "bg-watch-soft", ink: "text-watch-ink", hex: "#FFB547" },
  danger: { base: "bg-danger", soft: "bg-danger-soft", ink: "text-danger-ink", hex: "#FF5D5D" },
};
