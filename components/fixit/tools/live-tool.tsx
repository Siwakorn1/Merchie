"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Marked, SectionTitle } from "@/components/health/issue-list";
import { useCiteLine, LegalNote } from "@/components/legal/citation-list";
import { PlatformLogo } from "@/components/brand/platform-logo";
import { ScoreRing } from "@/components/health/score-ring";
import { AiMark } from "@/components/ui/ai-mark";
import { useLang } from "@/lib/i18n";
import { LIVE_SESSION, findRisks } from "@/lib/content/live";
import { cn } from "@/lib/utils";

const STEP_MS = 1700;

/**
 * Live analysis (simulated): Merchie listens to the live as it happens. Each line the seller
 * says appears in the transcript; risky ones are flagged right away with what to say instead.
 */
export function LiveTool() {
  const { t, tr } = useLang();
  const citeLine = useCiteLine();
  const [shown, setShown] = useState(0);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const total = LIVE_SESSION.lines.length;
  const done = shown >= total;

  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    const step = setInterval(() => setShown((n) => Math.min(total, n + 1)), STEP_MS);
    return () => {
      clearInterval(tick);
      clearInterval(step);
    };
  }, [running, total]);

  // stop when the transcript is complete (derived during render, not in an effect)
  if (running && done) setRunning(false);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [shown]);

  const heard = LIVE_SESSION.lines.slice(0, shown);
  const flagged = heard.filter((line) => findRisks(line).length > 0).length;
  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-6">
      {/* the live */}
      <section className="rounded-card bg-surface p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <PlatformLogo id="tiktok" size={40} className="rounded-[12px]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold">{LIVE_SESSION.title}</p>
            <p className="text-[13px] text-muted">
              {running
                ? t(`กำลังฟัง ${mmss}`, `Listening ${mmss}`)
                : done
                  ? t("ไลฟ์จบแล้ว", "Live ended")
                  : t(`ผู้ชม ${LIVE_SESSION.viewers.toLocaleString()} คน`, `${LIVE_SESSION.viewers.toLocaleString()} watching`)}
            </p>
          </div>
          <ScoreRing score={(flagged / total) * 100} size={46} stroke={5} status={flagged ? "danger" : "good"}>
            <span className="num relative text-[14px] font-bold">{flagged}</span>
          </ScoreRing>
        </div>
        <button
          onClick={() => {
            if (done) {
              setShown(0);
              setSeconds(0);
            }
            setRunning(!running);
          }}
          className={cn(
            "pressable mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold",
            running ? "bg-canvas text-ink" : "bg-ocean text-white shadow-lift",
          )}
        >
          {!running && <AiMark light />}
          {running ? t("หยุดฟัง", "Stop listening") : done ? t("ฟังใหม่อีกครั้ง", "Listen again") : t("ให้ AI ฟังไลฟ์", "Let AI listen")}
        </button>
      </section>

      {/* transcript, flags inline */}
      {shown > 0 && (
        <section>
          <SectionTitle>{t("สิ่งที่พูดในไลฟ์", "What was said")}</SectionTitle>
          <div ref={listRef} className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {heard.map((line, i) => {
                const risks = findRisks(line);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "rounded-[20px] px-4 py-3",
                      risks.length ? "bg-surface shadow-soft ring-2 ring-danger/60" : "bg-canvas",
                    )}
                  >
                    <p className="text-[14px] leading-relaxed">
                      <Marked text={line} marks={risks.map((r) => r.phrase)} />
                    </p>
                    {risks.map((r) => (
                      <div key={r.phrase} className="mt-2.5 border-t border-line pt-2.5">
                        <p className="text-[13px] font-semibold text-danger-ink">{tr(r.why)}</p>
                        <p className="mt-1 text-[13px] leading-snug">
                          <span className="text-muted">{t("พูดแทนว่า", "Say instead")} </span>
                          <span className="font-semibold text-good-ink">“{r.safer}”</span>
                        </p>
                        <p className="mt-0.5 text-[12px] text-muted">{citeLine(r.cite)}</p>
                      </div>
                    ))}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      )}

      {done && (
        <p className="rounded-[20px] bg-glow px-4 py-3 text-[14px] leading-relaxed">
          {t(
            `ไลฟ์นี้มีประโยคเสี่ยง ${flagged} จาก ${total} ประโยค ตรวจสคริปต์ก่อนไลฟ์ครั้งหน้าได้ที่ Script check`,
            `${flagged} of ${total} lines were risky. Check your next script before going live in Script check.`,
          )}
        </p>
      )}
      {shown > 0 && <LegalNote />}
    </div>
  );
}
