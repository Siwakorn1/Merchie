"use client";

import { useLang } from "@/lib/i18n";
import { PLAN_SHORT, type Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

/**
 * The plan as a short badge that ranks at a glance: Check up is plain, Care is brushed silver,
 * Coach is gold, Business is deep navy. No icon. Metal colors come from --plan-* tokens.
 */
export function PlanBadge({
  plan = "pro",
  small = false,
  className,
}: {
  plan?: Plan;
  small?: boolean;
  className?: string;
}) {
  const { tr } = useLang();
  const metal =
    plan === "business"
      ? {
          background: "linear-gradient(135deg, var(--plan-biz-1), var(--plan-biz-2))",
          color: "var(--plan-biz-ink)",
        }
      : plan === "pro"
      ? { background: "linear-gradient(135deg, var(--plan-gold-1), var(--plan-gold-2))", color: "var(--plan-gold-ink)" }
      : plan === "plus"
        ? { background: "linear-gradient(135deg, var(--plan-silver-1), var(--plan-silver-2))", color: "var(--plan-silver-ink)" }
        : undefined;
  return (
    <span
      style={metal}
      className={cn(
        "chrome inline-flex shrink-0 items-center rounded-full font-bold whitespace-nowrap",
        small ? "h-[18px] px-2 text-[10px] tracking-[0.06em]" : "h-6 px-3 text-[12px] tracking-[0.06em]",
        plan !== "free" && "shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_2px_6px_-2px_rgb(0_0_0/0.25)]",
        plan === "free" && "bg-glow text-ocean",
        className,
      )}
    >
      {tr(PLAN_SHORT[plan])}
    </span>
  );
}
