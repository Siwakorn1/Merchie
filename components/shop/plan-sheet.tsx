"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Segmented } from "@/components/ui/segmented";
import { PlanBadge } from "@/components/ui/plan-badge";
import { useToast } from "@/components/ui/toast";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import { PLANS, PLAN_NAME, PLAN_RANK, type Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

/** Compare Check up / Care / Coach and switch plans (a trial in the demo). */
export function PlanSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { plan, setPlan } = useDemo();
  const { t, tr } = useLang();
  const toast = useToast();
  const [view, setView] = useState<Plan>(plan === "free" ? "plus" : plan);
  const info = PLANS.find((p) => p.id === view)!;
  const current = view === plan;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t("แพ็กเกจ", "Plans")}>
      <Segmented<Plan>
        value={view}
        onChange={setView}
        inset
        options={PLANS.map((p) => ({ value: p.id, label: tr(PLAN_NAME[p.id]) }))}
      />

      <div className="mt-5 rounded-[22px] bg-canvas px-5 py-5">
        <div className="flex items-center gap-2">
          <PlanBadge plan={view} />
          {current && <span className="text-[13px] font-semibold text-good-ink">{t("ใช้อยู่", "Current")}</span>}
        </div>
        <p className="num mt-3 text-[26px] leading-none font-bold">{tr(info.price)}</p>
        <p className="mt-1.5 text-[14px] text-muted">{tr(info.forWho)}</p>

        {view !== "free" && (
          <p className="mt-4 text-[12px] font-semibold text-muted">
            {t(`ทุกอย่างใน ${tr(PLAN_NAME[view === "plus" ? "free" : "plus"])} และ`, `Everything in ${tr(PLAN_NAME[view === "plus" ? "free" : "plus"])}, plus`)}
          </p>
        )}
        <ul className="mt-2 flex flex-col gap-2.5">
          {info.features.map((f) => (
            <li key={f.en} className="flex items-start gap-2.5 text-[14px] leading-snug">
              <Check className="mt-0.5 size-4 shrink-0 text-good-ink" strokeWidth={3} />
              <span>{tr(f)}</span>
            </li>
          ))}
          {info.soon?.map((f) => (
            <li key={f.en} className="flex items-start gap-2.5 text-[14px] leading-snug text-muted">
              <span className="mt-0.5 size-4 shrink-0" />
              <span>
                {tr(f)} <span className="text-[12px]">({t("เร็ว ๆ นี้", "coming soon")})</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button
        disabled={current}
        onClick={() => {
          setPlan(view);
          toast(
            t(`เปลี่ยนเป็น ${tr(PLAN_NAME[view])} แล้ว`, `Switched to ${tr(PLAN_NAME[view])}`),
            view === "free" ? undefined : t("ทดลองฟรี 7 วัน", "7-day free trial"),
          );
          onOpenChange(false);
        }}
        className={cn(
          "pressable mt-5 h-12 w-full rounded-full text-[15px] font-semibold transition-colors",
          current ? "bg-canvas text-subtle" : "bg-ocean text-white shadow-lift",
        )}
      >
        {current
          ? t("แพ็กเกจปัจจุบัน", "Current plan")
          : PLAN_RANK[view] > PLAN_RANK[plan]
            ? t(`ทดลอง ${tr(PLAN_NAME[view])} ฟรี 7 วัน`, `Try ${tr(PLAN_NAME[view])} free for 7 days`)
            : t(`เปลี่ยนเป็น ${tr(PLAN_NAME[view])}`, `Switch to ${tr(PLAN_NAME[view])}`)}
      </button>
    </Sheet>
  );
}
