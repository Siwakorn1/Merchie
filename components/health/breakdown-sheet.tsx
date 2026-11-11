"use client";

import { AiMark } from "@/components/ui/ai-mark";
import { useTryPlan } from "@/components/ui/plan-offer";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { ScoreRing } from "@/components/health/score-ring";
import { LegalNote, useCiteLine } from "@/components/legal/citation-list";
import { PART_MAX, type Part, partsForScore } from "@/lib/health/score";
import { scoreColor, scoreInk } from "@/lib/health/status";
import { useLang } from "@/lib/i18n";
import { useDemo, useShopScore } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export function BreakdownSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const analysis = useDemo().has("plus");
  const tryPlan = useTryPlan();
  const { health, override } = useDemo();
  const total = useShopScore();
  const [expanded, setExpanded] = useState<string | null>("legal");
  const { t, tr } = useLang();
  const citeLine = useCiteLine();
  const parts = partsForScore(health.parts, total);
  const demo = override !== null && override !== health.score;
  const pct = (p: Part) => (p.score / PART_MAX) * 100;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("ที่มาของคะแนน", "Score breakdown")}
    >
      {/* total = the four parts added up */}
      <div className="mb-5 rounded-[22px] bg-canvas px-4 pt-4 pb-3.5">
        <p className="flex items-baseline gap-1.5">
          <span
            className="num font-round text-[40px] leading-none"
            style={{ color: scoreInk(total) }}
          >
            {total}
          </span>
          <span className="text-[14px] font-semibold text-muted">/ 100</span>
        </p>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {parts.map((p) => (
            <div key={p.id}>
              <div className="h-2 overflow-hidden rounded-full bg-line">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: scoreColor(pct(p)) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct(p)}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="mt-1.5 truncate text-[11px] text-muted">
                {tr(p.label)}
              </p>
              <p className="num text-[14px] font-bold">
                {p.score}
                <span className="font-medium text-subtle">/{PART_MAX}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {parts.map((p) => {
          const isOpen = expanded === p.id;
          return (
            <div
              key={p.id}
              className="overflow-hidden rounded-[22px] bg-canvas"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : p.id)}
                className="flex w-full items-center gap-4 px-4 py-3 text-left"
              >
                <ScoreRing score={pct(p)} size={48} stroke={5}>
                  <span className="num relative text-[15px] font-bold">
                    {p.score}
                  </span>
                </ScoreRing>
                <span className="flex-1 text-[15px] font-semibold">
                  {tr(p.label)}
                </span>
                <span className="num text-[13px] font-semibold text-muted">
                  {p.score}/{PART_MAX}
                </span>
                <ChevronDown
                  className={cn(
                    "size-5 text-subtle transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 38 }}
                    className="px-4"
                  >
                    {!analysis ? (
                      // Check up: the score is shown, the analysis of why comes with Care
                      <li className="flex items-center gap-3 border-t border-line py-3">
                        <AiMark className="text-[16px]" />
                        <span className="flex-1 text-[13px] leading-snug">
                          {t(
                            "AI วิเคราะห์ว่าส่วนนี้โดนหักเพราะอะไร",
                            "AI explains what this part lost points for",
                          )}
                        </span>
                        <button
                          onClick={() => tryPlan("plus")}
                          className="pressable h-9 shrink-0 rounded-full bg-ocean px-3.5 text-[13px] font-semibold text-white"
                        >
                          {t("ลองฟรี", "Try free")}
                        </button>
                      </li>
                    ) : (
                      <>
                        {/* full marks, then each deduction, so the column adds up to the part score */}
                        <li className="flex items-center gap-3 py-2.5 text-[13px] text-muted">
                          <span className="flex-1">
                            {t("คะแนนเต็ม", "Full marks")}
                          </span>
                          <span className="num font-semibold">{PART_MAX}</span>
                        </li>
                        {p.factors.map((f) => (
                          <li
                            key={f.label.en}
                            className="flex items-start gap-3 border-t border-line py-3"
                          >
                            <span className="flex-1">
                              <span className="block text-[14px] font-medium">
                                {tr(f.label)}
                              </span>
                              {f.cite && (
                                <span className="block text-[12px] text-muted">
                                  {citeLine(f.cite)}
                                </span>
                              )}
                            </span>
                            {!demo && (
                              <span
                                className={cn(
                                  "num text-[14px] font-semibold",
                                  f.delta < 0
                                    ? "text-danger-ink"
                                    : "text-muted",
                                )}
                              >
                                {f.delta < 0 ? `−${Math.abs(f.delta)}` : "0"}
                              </span>
                            )}
                          </li>
                        ))}
                        <li className="flex items-center gap-3 border-t border-line py-2.5">
                          <span className="flex-1 text-[14px] font-semibold">
                            {t("ได้", "Score")}
                          </span>
                          <span className="num text-[15px] font-bold">
                            {p.score}/{PART_MAX}
                          </span>
                        </li>
                      </>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {demo && (
        <p className="mt-4 text-[12px] text-muted">
          {t(
            "โหมดเดโม: แบ่งคะแนนตามสัดส่วนจริง",
            "Demo mode: parts scaled from the real breakdown",
          )}
        </p>
      )}
      <LegalNote />
    </Sheet>
  );
}
