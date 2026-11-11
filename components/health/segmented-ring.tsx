"use client";

import { motion } from "motion/react";
import { scoreColor } from "@/lib/health/status";
import { cn } from "@/lib/utils";

/** Visible gap between segments, in degrees (round caps are accounted for separately). */
const GAP_DEG = 4;

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180; // 0° = 12 o'clock, clockwise
  // round so server and client produce the identical path string (no hydration mismatch)
  const round = (v: number) => Math.round(v * 100) / 100;
  return [round(cx + r * Math.cos(a)), round(cy + r * Math.sin(a))] as const;
}
function arc(cx: number, cy: number, r: number, from: number, to: number) {
  const [x0, y0] = polar(cx, cy, r, from);
  const [x1, y1] = polar(cx, cy, r, to);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

/**
 * The hero ring split into one arc per part, clockwise from 12 o'clock. Each arc's length is
 * that part's share of its own quarter, and its color is that part's status.
 * `values` are 0–100 per segment.
 */
export function SegmentedRing({
  values,
  size,
  stroke,
  className,
  children,
}: {
  values: number[];
  size: number;
  stroke: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = size / 2;
  const n = values.length;
  const span = 360 / n;
  // round caps stick out by stroke/2 at each end; widen the gap so the visible gap is GAP_DEG
  const capDeg = ((stroke / 2 / r) * 180) / Math.PI;
  const pad = GAP_DEG / 2 + capDeg;

  return (
    <div className={cn("chrome relative grid shrink-0 place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 overflow-visible">
        {values.map((v, i) => {
          const from = i * span + pad;
          const to = (i + 1) * span - pad;
          const d = arc(c, c, r, from, to);
          const pct = Math.max(0, Math.min(100, v));
          return (
            <g key={i}>
              <path d={d} fill="none" strokeWidth={stroke} strokeLinecap="round" className="stroke-line" />
              <motion.path
                d={d}
                fill="none"
                strokeWidth={stroke}
                strokeLinecap="round"
                initial={{ pathLength: 0, stroke: scoreColor(pct) }}
                animate={{ pathLength: pct / 100, stroke: scoreColor(pct), opacity: pct > 0 ? 1 : 0 }}
                transition={{
                  pathLength: { duration: 1, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] },
                  stroke: { duration: 0.4 },
                }}
              />
            </g>
          );
        })}
      </svg>
      {children}
    </div>
  );
}

/** A tiny four-quarter ring with one quarter lit: says which segment of the big ring this is. */
export function QuarterGlyph({ index, value, size = 16 }: { index: number; value: number; size?: number }) {
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const capDeg = ((stroke / 2 / r) * 180) / Math.PI;
  const pad = 12 + capDeg;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="shrink-0">
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={arc(c, c, r, i * 90 + pad, (i + 1) * 90 - pad)}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={i === index ? undefined : "stroke-line"}
          stroke={i === index ? scoreColor(value) : undefined}
        />
      ))}
    </svg>
  );
}
