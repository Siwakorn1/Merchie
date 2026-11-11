"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Mascot, type MascotStyle } from "@/components/mascot/mascot";
import { Sheet } from "@/components/ui/sheet";
import { PlanChooser } from "@/components/ui/plan-picker";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import { PLAN_NAME, type Plan } from "@/lib/plans";

/**
 * Locks a paid feature (Care or Coach). Below that plan, the real screen sits blurred in the
 * background and the plan choice comes up as a popup over it, separate from the page. Closing
 * the popup leaves one small button to bring it back; the tab bar stays usable.
 */
export function ProGate({
  need = "pro",
  title,
  body,
  look = "guardian",
  children,
}: {
  need?: Exclude<Plan, "free">;
  title: string;
  body: string;
  /** which Merchie fronts the offer */
  look?: MascotStyle;
  children: React.ReactNode;
}) {
  const { has, outfit } = useDemo();
  const { t, tr } = useLang();
  const [open, setOpen] = useState(true);

  if (has(need)) return <>{children}</>;

  return (
    <div className="relative">
      {/* the real screen, blurred: a glimpse of what the plan gives you */}
      <div aria-hidden className="pointer-events-none blur-[6px] select-none opacity-60">
        {children}
      </div>

      {/* closed the popup? one quiet button brings it back */}
      {!open && (
        <div className="sticky bottom-[calc(50%-24px)] z-20 flex justify-center">
          <button
            onClick={() => setOpen(true)}
            className="pressable flex h-12 items-center gap-2 rounded-full bg-ocean px-5 text-[15px] font-semibold text-white shadow-lift"
          >
            <Lock className="size-4" strokeWidth={2.6} />
            {t(`ปลดล็อกด้วย ${tr(PLAN_NAME[need])}`, `Unlock with ${tr(PLAN_NAME[need])}`)}
          </button>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <PlanChooser
          need={need}
          heading={
            <div className="flex flex-col items-center text-center">
              <Mascot variant={look} outfit={outfit} size={110} />
              <h2 className="mt-1 text-[19px] font-bold tracking-tight text-balance">{title}</h2>
              <p className="mt-1 max-w-[280px] text-[14px] leading-relaxed text-balance text-muted">{body}</p>
            </div>
          }
          onLater={() => setOpen(false)}
        />
      </Sheet>
    </div>
  );
}
