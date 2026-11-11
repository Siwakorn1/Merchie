"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mascot } from "@/components/mascot/mascot";
import { SegmentedRing } from "@/components/health/segmented-ring";
import { PART_MAX, partsForScore } from "@/lib/health/score";
import { AnimatedNumber } from "@/components/health/animated-number";
import { BreakdownSheet } from "@/components/health/breakdown-sheet";
import { SpeechCloud } from "@/components/health/speech-cloud";
import { scoreInk, scoreToStatus, scoreToMood, type Status } from "@/lib/health/status";
import { useDemo, useShopScore } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Merchie "says" the score in a speech bubble centered above the ring.
 * The number takes the ring's color (its darker, readable shade).
 */
/** Hero ring size: a little smaller than the full width so the four labels have room on both sides. */
const RING = 248;

export function HeroScore() {
  const score = useShopScore();
  const { mascotStyle, outfit, openIssues, health } = useDemo();
  const { t, tr } = useLang();
  // each part out of 25; under a demo override the parts are re-split so they add up to the score
  const parts = partsForScore(health.parts, score).map((p) => ({ ...p, shown: p.score }));
  const [open, setOpen] = useState(false);
  const [pokes, setPokes] = useState(0);
  const status = scoreToStatus(score);
  const urgent = openIssues.filter((i) => i.status === "danger").length;

  // Merchie's own voice: short, warm, a little playful
  const lines: Record<Status, [string, string]> = {
    good: [t("เก่งมากเลย!", "Yay, we're good!"), t("วันนี้ร้านดูดีสุด ๆ", "The shop looks great today")],
    watch: [t("อีกนิดเดียวน้า", "Almost there!"), t("มีนิดหน่อยให้ช่วยกันดู", "Just a few bits to tidy up")],
    danger: [
      urgent > 0 ? t(`มี ${urgent} เรื่องด่วนน้า`, `${urgent} things need us!`) : t("มาดูร้านกันหน่อย", "Let's check on the shop"),
      t("แตะเลย เดี๋ยวช่วยดูให้", "Tap and I'll show you"),
    ],
  };
  const [head, sub] = lines[status];

  return (
    <section className="flex flex-col items-center pt-1">
      {/* Merchie "says" the score: a bubble centered just above the ring, so it never hides a
          segment, with its tail pointing down at Merchie */}
      <div className="relative pt-[96px]">
        <div className="relative">
        <SegmentedRing values={parts.map((p) => (p.shown / PART_MAX) * 100)} size={RING} stroke={12}>
          <Mascot
            mood={scoreToMood(score)}
            variant={mascotStyle}
            outfit={outfit}
            size={168}
            className="relative -mt-2"
            onPoke={() => setPokes((n) => n + 1)}
          />
        </SegmentedRing>
        {/* each part's score sits off the outer corner of its own arc. Number and its small label
            are centered on each other: label above the number for the top two, below it for the
            bottom two, so the narrow number is nearest the ring and the label sits outside. */}
        {parts.map((p, i) => {
          const right = i < 2; // legal (top-right), platform (bottom-right)
          const top = i === 0 || i === 3; // legal, business
          const c = RING / 2;
          const d = c * Math.SQRT1_2 + 12; // diagonal offset from the center, just past the ring
          const label = (
            <span className="text-[11px] leading-none whitespace-nowrap text-muted">{tr(p.label)}</span>
          );
          return (
            <span
              key={p.id}
              aria-hidden
              className={cn(
                "pointer-events-none absolute flex -translate-x-1/2 flex-col items-center gap-1",
                top && "-translate-y-full",
              )}
              style={{ left: c + (right ? d : -d), top: c + (top ? -d : d) }}
            >
              {top && label}
              <span
                className="num font-round text-[23px] leading-none"
                style={{ color: scoreInk((p.shown / PART_MAX) * 100) }}
              >
                {p.shown}
              </span>
              {!top && label}
            </span>
          );
        })}
        </div>
        {/* centered over the ring so it never runs past the screen edge on narrow phones */}
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center">
        <motion.div
          key={pokes}
          initial={{ scale: pokes === 0 ? 0.7 : 0.92, opacity: pokes === 0 ? 0 : 1 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 520, damping: 18, delay: pokes === 0 ? 0.35 : 0 }}
          style={{ transformOrigin: "50% 100%" }}
          className="w-max max-w-[calc(100vw-40px)]"
        >
          <SpeechCloud tailAt={50} onClick={() => setOpen(true)} label={t("ดูที่มาของคะแนน", "See score breakdown")}>
            <span style={{ color: scoreInk(score) }}>
              <AnimatedNumber value={score} className="num font-round text-[44px] leading-none" />
            </span>
            <span className="ml-3 text-left">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={status + head}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  <span className="block text-[15px] leading-tight font-bold">{head}</span>
                  <span className="mt-0.5 block text-[12px] leading-tight text-muted">{sub}</span>
                </motion.span>
              </AnimatePresence>
            </span>
          </SpeechCloud>
        </motion.div>
        </div>
      </div>

      <BreakdownSheet open={open} onOpenChange={setOpen} />
    </section>
  );
}
