"use client";

import { Mascot, type MascotStyle } from "@/components/mascot/mascot";
import { PlanBadge } from "@/components/ui/plan-badge";
import { useToast } from "@/components/ui/toast";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import { PLAN_NAME, type Plan } from "@/lib/plans";

/** Start a trial of `need` and say so. */
export function useTryPlan() {
  const { upgrade } = useDemo();
  const toast = useToast();
  const { t, tr } = useLang();
  return (need: Plan) => {
    upgrade(need);
    toast(t(`ยินดีต้อนรับสู่ ${tr(PLAN_NAME[need])}`, `Welcome to ${tr(PLAN_NAME[need])}`), t("ทดลองฟรี 7 วัน", "7-day free trial"));
  };
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
            tryPlan(need);
            onTried?.();
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
