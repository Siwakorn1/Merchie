"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

const TRACK = 38; // track height, like an iOS switch
const KNOB = 30;
const INSET = (TRACK - KNOB) / 2; // same gap above, below, left and right of the knob

/**
 * A chunky slider in the iOS-switch style: a fat rounded track that fills with `color`
 * and a white knob you drag. Pointer (touch and mouse) and arrow keys.
 */
export function ThickSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  color,
  label,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  color: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pct = (value - min) / (max - min);

  const fromPointer = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    const usable = r.width - KNOB - INSET * 2;
    const t = Math.max(0, Math.min(1, (clientX - r.left - INSET - KNOB / 2) / usable));
    onChange(Math.round(min + t * (max - min)));
  };

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e.clientX);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(Math.min(max, value + 1));
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(Math.max(min, value - 1));
      }}
      className={cn("chrome relative w-full cursor-pointer touch-none rounded-full bg-line outline-none", className)}
      style={{ height: TRACK }}
    >
      {/* fill wraps the knob with the same inset on every side, like an iOS switch */}
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[background-color] duration-300"
        style={{ width: `calc(${pct} * (100% - ${KNOB + INSET * 2}px) + ${KNOB + INSET * 2}px)`, background: color }}
      />
      <div
        className="absolute rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/0.22)]"
        style={{ top: INSET, width: KNOB, height: KNOB, left: `calc(${INSET}px + ${pct} * (100% - ${KNOB + INSET * 2}px))` }}
      />
    </div>
  );
}
