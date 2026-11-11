"use client";

import { Mascot, type MascotStyle } from "@/components/mascot/mascot";
import { PlanBadge } from "@/components/ui/plan-badge";
import { usePlanPicker } from "@/components/ui/plan-picker";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import { type Plan } from "@/lib/plans";

/**
 * "Try" anywhere: opens the plan popup (plans side by side, the cheapest one that unlocks the
 * feature preselected). Nothing upgrades until the shop confirms there; then `onDone` runs.
 */
export function useTryPlan() {
  const open = usePlanPicker();
  return (need: Exclude<Plan, "free">, onDone?: () => void) => open(need, onDone);
}

/** The one upgrade offer used everywhere: Merchie, plan badge, title, one line, Try / Not now. */
export function PlanOffer({
  need,
  look = "jelly",
  title,
  body,
  onLater,
  onTried,
  mascotSize = 150,
}: {
  need: Exclude<Plan, "free">;
  look?: MascotStyle;
  title: string;
  body: string;
  onLater?: () => void;
  /** runs after the trial starts (e.g. apply the look that was tapped) */
  onTried?: () => void;
  mascotSize?: number;
}) {
  const { outfit } = useDemo();
  const { t } = useLang();
  const tryPlan = useTryPlan();
  return (
    <div className="flex flex-col items-center text-center">
      <Mascot variant={look} outfit={outfit} size={mascotSize} />
      <PlanBadge plan={need} className="mt-3" />
      <h2 className="mt-3 text-[19px] font-bold tracking-tight text-balance">{title}</h2>
      <p className="mt-1.5 max-w-[260px] text-[14px] leading-relaxed text-balance text-muted">{body}</p>
      <div className="mt-5 flex w-full flex-col gap-2">
        <button
          onClick={() => {
            tryPlan(need, onTried);
          }}
          className="pressable h-12 w-full rounded-full bg-ocean text-[15px] font-semibold text-white shadow-lift"
        >
          {t("ลองเลย", "Try it")}
        </button>
        {onLater && (
          <button onClick={onLater} className="pressable h-12 w-full rounded-full text-[15px] font-semibold text-muted">
            {t("ไว้ก่อน", "Not now")}
          </button>
        )}
      </div>
    </div>
  );
}
