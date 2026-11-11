"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Check } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { PlanBadge } from "@/components/ui/plan-badge";
import { useToast } from "@/components/ui/toast";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import { PLANS, PLAN_NAME, PLAN_RANK, type Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

type Paid = Exclude<Plan, "free">;
type Request = { need: Paid; onDone?: () => void };

const Ctx = createContext<((need: Paid, onDone?: () => void) => void) | null>(null);

/**
 * Every "Try" in the app opens this one popup: the paid plans side by side, the cheapest one
 * that unlocks the feature preselected, then a single "start free trial" button. Nothing
 * upgrades until the shop chooses here.
 */
export function PlanPickerProvider({ children }: { children: React.ReactNode }) {
  const [req, setReq] = useState<Request | null>(null);
  const [shown, setShown] = useState<Request | null>(null);
  if (req && req !== shown) setShown(req);
  const open = useCallback((need: Paid, onDone?: () => void) => setReq({ need, onDone }), []);

  return (
    <Ctx.Provider value={open}>
      {children}
      <Sheet open={!!req} onOpenChange={(o) => !o && setReq(null)}>
        {shown && (
          <PlanChooser
            key={`${shown.need}-${!!req}`}
            need={shown.need}
            onDone={() => {
              setReq(null);
              shown.onDone?.();
            }}
            onLater={() => setReq(null)}
          />
        )}
      </Sheet>
    </Ctx.Provider>
  );
}

/** Open the plan popup for a feature that needs at least `need`. */
export function usePlanPicker() {
  // outside the app shell (e.g. the /dev/preview page) there is no popup: do nothing
  return useContext(Ctx) ?? noop;
}
const noop = () => {};

/**
 * The plan choice itself: paid plans as selectable cards, then "Try X free".
 * Used inside the global popup and inside locked screens (ProGate).
 */
export function PlanChooser({
  need,
  heading,
  onDone,
  onLater,
}: {
  need: Paid;
  /** optional lead-in (e.g. Merchie + why this screen is locked) */
  heading?: React.ReactNode;
  onDone?: () => void;
  onLater?: () => void;
}) {
  const { upgrade, plan } = useDemo();
  const toast = useToast();
  const { t, tr } = useLang();
  const [pick, setPick] = useState<Paid>(need);
  const paid = PLANS.filter((p) => p.id !== "free");

  const start = () => {
    upgrade(pick);
    toast(t(`ยินดีต้อนรับสู่ ${tr(PLAN_NAME[pick])}`, `Welcome to ${tr(PLAN_NAME[pick])}`), t("ทดลองฟรีก่อนเลย", "Free to try"));
    onDone?.();
  };

  return (
    <div className="flex flex-col">
      {heading ?? (
        <h2 className="text-center text-[19px] font-bold tracking-tight">{t("เลือกแพ็กเกจ", "Choose a plan")}</h2>
      )}

      <div className="mt-4 flex flex-col gap-2.5">
        {paid.map((p) => {
          const id = p.id as Paid;
          const enough = PLAN_RANK[id] >= PLAN_RANK[need];
          const on = pick === id;
          return (
            <button
              key={id}
              disabled={!enough}
              onClick={() => setPick(id)}
              aria-pressed={on}
              className={cn(
                "chrome w-full rounded-[22px] px-4 py-3.5 text-left transition-[box-shadow,opacity]",
                on ? "bg-surface shadow-lift ring-2 ring-ocean" : "bg-canvas",
                !enough && "opacity-45",
              )}
            >
              <span className="flex items-center gap-2">
                <PlanBadge plan={id} />
                <span className="num flex-1 text-right text-[15px] font-bold">{tr(p.price)}</span>
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full",
                    on ? "bg-ocean text-white" : "ring-2 ring-line",
                  )}
                >
                  {on && <Check className="size-4" strokeWidth={3} />}
                </span>
              </span>
              {!enough ? (
                <span className="mt-2 block text-[13px] text-muted">
                  {t("ยังไม่มีฟีเจอร์นี้", "Doesn't include this feature")}
                </span>
              ) : (
                <span className="mt-2.5 flex flex-col gap-1.5">
                  {id === "pro" && (
                    <span className="text-[12px] font-semibold text-muted">
                      {t(`ทุกอย่างใน ${tr(PLAN_NAME.plus)} และ`, `Everything in ${tr(PLAN_NAME.plus)}, plus`)}
                    </span>
                  )}
                  {p.features.slice(0, 3).map((f) => (
                    <span key={f.en} className="flex items-start gap-2 text-[13px] leading-snug">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-good-ink" strokeWidth={3} />
                      {tr(f)}
                    </span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={start}
        className="pressable mt-5 h-12 w-full rounded-full bg-ocean text-[15px] font-semibold text-white shadow-lift"
      >
        {plan === "free" || PLAN_RANK[pick] > PLAN_RANK[plan]
          ? t(`ทดลอง ${tr(PLAN_NAME[pick])} ฟรีก่อนเลย`, `Try ${tr(PLAN_NAME[pick])} free`)
          : t(`ใช้ ${tr(PLAN_NAME[pick])}`, `Use ${tr(PLAN_NAME[pick])}`)}
      </button>
      {onLater && (
        <button onClick={onLater} className="pressable mt-1 h-11 w-full rounded-full text-[15px] font-semibold text-muted">
          {t("ไว้ก่อน", "Not now")}
        </button>
      )}
    </div>
  );
}
