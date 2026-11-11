"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { MascotStyle } from "@/components/mascot/mascot";
import { PlanOffer } from "@/components/ui/plan-offer";
import { useDemo } from "@/lib/demo-store";
import type { Plan } from "@/lib/plans";

/**
 * Locks a paid feature (PLUS or PRO). Below that plan, the real screen scrolls blurred
 * underneath while the offer card stays pinned in the middle of the screen.
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
  const { has } = useDemo();
  const router = useRouter();

  if (has(need)) return <>{children}</>;

  return (
    <div className="relative">
      {/* zero-height sticky anchor at the middle of the visible area (a little above center,
          to balance the floating tab bar); the card is centered on it and follows the scroll */}
      <div className="sticky top-[calc(50%-36px)] z-20 h-0">
        <div className="absolute inset-x-5 top-0 -translate-y-1/2">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="rounded-[32px] bg-surface px-6 pt-5 pb-5 shadow-lift"
          >
            <PlanOffer need={need} look={look} title={title} body={body} onLater={() => router.push("/")} />
          </motion.div>
        </div>
      </div>

      {/* the real screen, blurred: a glimpse of what the plan gives you */}
      <div aria-hidden className="pointer-events-none blur-[6px] select-none opacity-60">
        {children}
      </div>
    </div>
  );
}
