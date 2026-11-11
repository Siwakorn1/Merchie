"use client";

import { useEffect, useRef } from "react";
import { useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.65, 0, 0.35, 1] as const; // quick in-out
const MS = 0.32;

/**
 * iOS-style segmented control. One pill slides between options with a touch of motion blur
 * and stretch while it moves, so the switch feels fast.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  inset = false,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  /** flat style for use inside sheets and cards (no floating shadow) */
  inset?: boolean;
}) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const [pill, animate] = useAnimate<HTMLSpanElement>();
  const first = useRef(true);

  useEffect(() => {
    const x = `${index * 100}%`;
    if (first.current) {
      // place without animating on first render
      first.current = false;
      animate(pill.current, { x }, { duration: 0 });
      return;
    }
    animate(
      pill.current,
      { x, filter: ["blur(0px)", "blur(2.5px)", "blur(0px)"], scaleX: [1, 1.14, 1] },
      { duration: MS, ease: EASE },
    );
  }, [index, animate, pill]);

  return (
    <div
      className={cn(
        "chrome relative flex rounded-full p-1",
        inset ? "bg-canvas" : "bg-surface/70 shadow-soft backdrop-blur",
      )}
    >
      <span
        ref={pill}
        aria-hidden
        className="absolute top-1 bottom-1 left-1 rounded-full bg-ocean shadow-soft"
        style={{ width: `calc((100% - 8px) / ${options.length})` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={o.value === value}
          className="relative h-10 flex-1 rounded-full text-[14px] font-semibold"
        >
          <span
            className={cn(
              "relative transition-colors duration-200",
              o.value === value ? "text-white" : "text-muted",
            )}
          >
            {o.label}
          </span>
        </button>
      ))}
    </div>
  );
}
