"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { scoreColor, statusTone, type Status } from "@/lib/health/status";

/**
 * WHOOP-style ring: arc length = score (100 = full circle), color = status.
 * Draws itself in on mount and animates when the score changes.
 */
export function ScoreRing({
  score,
  size = 120,
  stroke = 10,
  showNumber = true,
  status,
  className,
  children,
}: {
  score: number;
  size?: number;
  stroke?: number;
  showNumber?: boolean;
  /** Override the color, e.g. for "usage" meters where a fuller ring is worse. */
  status?: Status;
  className?: string;
  children?: React.ReactNode;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const r = (size - stroke) / 2;
  const color = status ? statusTone[status].hex : scoreColor(clamped);

  return (
    <div className={cn("chrome relative grid shrink-0 place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-line" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0, stroke: color }}
          animate={{ pathLength: clamped / 100, stroke: color }}
          // Deterministic tween (not a spring): springs can blow up when frames are dropped.
          transition={{ pathLength: { duration: 1.1, ease: [0.22, 1, 0.36, 1] }, stroke: { duration: 0.4 } }}
        />
      </svg>
      {children ??
        (showNumber && (
          <span className="num relative font-bold" style={{ fontSize: size * 0.34, lineHeight: 1 }}>
            {Math.round(clamped)}
          </span>
        ))}
    </div>
  );
}
