"use client";

import { useState, useSyncExternalStore } from "react";
import { Mascot, type Mood, type MascotStyle } from "@/components/mascot/mascot";
import { cn } from "@/lib/utils";

const moods: Mood[] = ["delighted", "happy", "okay", "worried", "sad", "shocked"];
const styles: MascotStyle[] = ["jelly", "guardian", "money", "fantasy", "rainbow"];

export default function MascotLab() {
  const [mood, setMood] = useState<Mood>("happy");
  const fromUrl = useSyncExternalStore(
    () => () => {},
    () => (location.search.includes("jelly") ? "jelly" : "guardian") as MascotStyle,
    () => "guardian" as MascotStyle,
  );
  const [picked, setVariant] = useState<MascotStyle | null>(null);
  const variant = picked ?? fromUrl;
  const [eyes, setEyes] = useState<"dot" | "split" | "band">("dot");
  return (
    <div className="sky min-h-dvh">
      <main className="mx-auto flex max-w-md flex-col items-center px-5 pt-16 pb-16">
        <Mascot mood={mood} variant={variant} eyes={eyes} size={280} />

        <Pills value={variant} options={styles} onChange={setVariant} className="mt-12" />
        <Pills value={mood} options={moods} onChange={setMood} className="mt-3" />
        <Pills value={eyes} options={["dot", "split", "band"]} onChange={setEyes} className="mt-3" />

        <div className="mt-10 grid w-full grid-cols-2 gap-3">
          {moods.map((m) => (
            <div key={m} className="grid place-items-center rounded-card bg-surface/70 py-5">
              <Mascot mood={m} variant={variant} eyes={eyes} size={150} interactive={false} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Pills<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full gap-2 rounded-full bg-surface p-1.5 shadow-soft", className)}>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "pressable h-11 flex-1 rounded-full text-sm font-semibold capitalize transition-colors",
            o === value ? "bg-ocean text-white" : "text-muted",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
