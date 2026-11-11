import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Marks an AI feature: a four-point star with soft concave sides and a sky-to-violet
 * gradient. Icon only, no text, no pill. `light` draws it white for use on filled buttons.
 */
export function AiMark({ className, light }: { className?: string; light?: boolean }) {
  const id = `ai-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label="AI"
      className={cn("inline-block size-[1em] shrink-0 align-[-0.125em]", className)}
    >
      {!light && (
        <defs>
          <linearGradient id={id} x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4C8DF6" />
            <stop offset="0.55" stopColor="#7B6CF2" />
            <stop offset="1" stopColor="#C07BE8" />
          </linearGradient>
        </defs>
      )}
      {/* each side bows inward from tip to tip, so the star reads soft rather than spiky */}
      <path
        d="M12 1.5 C12.9 7.4 16.6 11.1 22.5 12 C16.6 12.9 12.9 16.6 12 22.5 C11.1 16.6 7.4 12.9 1.5 12 C7.4 11.1 11.1 7.4 12 1.5 Z"
        fill={light ? "#FFFFFF" : `url(#${id})`}
      />
    </svg>
  );
}
