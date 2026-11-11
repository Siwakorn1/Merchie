"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Mascot, type Mood } from "@/components/mascot/mascot";
import { useDemo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

type PlayOptions = {
  /** runs while the screen is fully covered (navigate, swap state…) */
  onCovered?: () => void;
  mood?: Mood;
  caption?: string;
  /** how long the clouds stay closed, ms */
  hold?: number;
};

type Phase = "idle" | "closing" | "closed" | "opening";

const MOVE_MS = 520;

const CloudCtx = createContext<(o?: PlayOptions) => void>(() => {});

/**
 * Special-event transition: two plain cloud panels with scalloped inner edges slide
 * shut, Merchie appears, the app changes underneath, then the panels part.
 *
 * Phases run on timers (not animation callbacks) so the curtain always opens, and the
 * server renders it closed so the first paint doubles as the splash. Tap to open early.
 */
export function CloudTransitionProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [opts, setOpts] = useState<PlayOptions>({ caption: "Merchie" });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const open = useCallback(() => {
    clear();
    setPhase("opening");
    later(() => setPhase("idle"), MOVE_MS + 40);
  }, [clear, later]);

  // Splash: open shortly after hydration
  useEffect(() => {
    later(open, 900);
    return clear;
  }, [open, later, clear]);

  const play = useCallback(
    (o: PlayOptions = {}) => {
      clear();
      setOpts(o);
      setPhase("closing");
      later(() => {
        setPhase("closed");
        o.onCovered?.();
        later(open, o.hold ?? 900);
      }, MOVE_MS);
    },
    [open, later, clear],
  );

  const covered = phase === "closing" || phase === "closed";

  return (
    <CloudCtx.Provider value={play}>
      {children}
      <div
        className={cn("chrome absolute inset-0 z-[70] overflow-hidden", phase === "idle" && "pointer-events-none")}
        onClick={() => phase === "closed" && open()}
        aria-hidden={!covered}
      >
        <Panel side="left" covered={covered} />
        <Panel side="right" covered={covered} />
        {/* hides the seam where the two scalloped edges overlap once fully shut */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-surface transition-opacity duration-200",
            phase === "closed" ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex flex-col items-center justify-center transition-all duration-300",
            phase === "closed" ? "scale-100 opacity-100" : "scale-90 opacity-0",
          )}
        >
          {phase !== "idle" && <ThemedMascot mood={opts.mood ?? "happy"} />}
          {opts.caption && (
            <p className="mt-5 max-w-[80%] text-center text-[19px] leading-snug font-bold tracking-tight text-ink">
              {opts.caption}
            </p>
          )}
        </div>
      </div>
    </CloudCtx.Provider>
  );
}

export function useCloudTransition() {
  return useContext(CloudCtx);
}

function ThemedMascot({ mood }: { mood: Mood }) {
  const { mascotStyle, outfit } = useDemo();
  return <Mascot mood={mood} variant={mascotStyle} outfit={outfit} size={170} interactive={false} />;
}

// Irregular puff sizes, different rhythm on each side so the two edges never mirror.
const PUFFS: Record<"left" | "right", number[]> = {
  left: [34, 22, 40, 26, 30, 44, 20, 36, 28, 42, 24, 32],
  right: [26, 40, 20, 34, 46, 24, 30, 38, 22, 44, 28, 36],
};
const MAX_R = 46;

/** Edge circles stacked down the panel, each overlapping the next a little. */
function puffs(side: "left" | "right", height = 1400) {
  const list = PUFFS[side];
  const out: { cy: number; r: number }[] = [];
  let y = side === "left" ? -10 : 8;
  for (let i = 0; y < height; i++) {
    const r = list[i % list.length];
    out.push({ cy: y + r * 0.7, r });
    y += r * 1.35;
  }
  return out;
}

/** One flat white panel; its inner edge is a row of uneven half-circle puffs. No shading. */
function Panel({ side, covered }: { side: "left" | "right"; covered: boolean }) {
  const left = side === "left";

  return (
    <div
      className={cn("absolute inset-y-0 w-[50%] bg-surface", left ? "left-0" : "right-0")}
      style={{
        transform: covered ? "translateX(0)" : `translateX(calc(${left ? "-100% -" : "100% +"} ${MAX_R + 4}px))`,
        transition: `transform ${MOVE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
      }}
    >
      <svg
        aria-hidden
        className="absolute inset-y-0 h-full overflow-hidden"
        style={{ width: MAX_R, [left ? "right" : "left"]: -MAX_R + 1 }}
      >
        {puffs(side).map(({ cy, r }) => (
          <circle key={cy} cx={left ? 0 : MAX_R} cy={cy} r={r} fill="var(--color-surface)" />
        ))}
      </svg>
    </div>
  );
}
