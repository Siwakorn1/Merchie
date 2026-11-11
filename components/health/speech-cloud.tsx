"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const R = 22; // corner radius
const TAIL_H = 10;
const TAIL_W = 22;

/** Box and tail as ONE outline, so the glass and the rim run around both without a seam. */
function bubblePath(w: number, h: number, tailAt: number) {
  const tx = Math.min(w - R - TAIL_W / 2, Math.max(R + TAIL_W / 2, (w * tailAt) / 100));
  const l = tx - TAIL_W / 2;
  const r = tx + TAIL_W / 2;
  return [
    `M ${R} 0 H ${w - R} A ${R} ${R} 0 0 1 ${w} ${R} V ${h - R} A ${R} ${R} 0 0 1 ${w - R} ${h}`,
    // tail: eases out of the box edge and ends in a soft rounded tip
    `H ${r + 4} Q ${r} ${h} ${tx + 2.2} ${h + TAIL_H - 1.6} Q ${tx} ${h + TAIL_H + 0.6} ${tx - 2.2} ${h + TAIL_H - 1.6} Q ${l} ${h} ${l - 4} ${h}`,
    `H ${R} A ${R} ${R} 0 0 1 0 ${h - R} V ${R} A ${R} ${R} 0 0 1 ${R} 0 Z`,
  ].join(" ");
}

/**
 * Merchie's speech bubble: a translucent rounded box (you can just see the ring behind it)
 * with one tail pointing down at Merchie, drawn as a single outline with no shadow box
 * around it. Floats gently so it feels alive.
 * `tailAt` places the tail along the bottom edge (0–100%).
 */
export function SpeechCloud({
  children,
  onClick,
  label,
  tailAt = 50,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label?: string;
  tailAt?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const d = size ? bubblePath(size.w, size.h, tailAt) : null;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      animate={reduce ? undefined : { y: [0, -3, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      className={cn("pressable relative block", className)}
    >
      {d && size && (
        <>
          {/* the bubble: one SVG path for fill and outline. No backdrop-filter: Safari ignores
              clip-path on it and paints the blur as a square box behind the bubble. */}
          <svg
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 overflow-visible"
            width={size.w}
            height={size.h + TAIL_H}
          >
            <path
              d={d}
              fill="var(--color-surface)"
              fillOpacity={0.95}
              stroke="var(--color-surface)"
              strokeOpacity={0.95}
              strokeWidth={1.25}
            />
          </svg>
        </>
      )}
      <span ref={boxRef} className="relative flex items-center rounded-[22px] px-5 py-3">
        {children}
      </span>
    </motion.button>
  );
}
