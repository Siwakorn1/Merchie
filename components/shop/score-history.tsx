"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { PlanBadge } from "@/components/ui/plan-badge";
import { useTryPlan } from "@/components/ui/plan-offer";
import { Sheet } from "@/components/ui/sheet";
import { Segmented } from "@/components/ui/segmented";
import { scoreInk } from "@/lib/health/status";
import { useDemo, useShopScore } from "@/lib/demo-store";
import { useLang, type Lang } from "@/lib/i18n";
import merchie from "@/mock/merchie/shop.json";
import { cn } from "@/lib/utils";
import { ScoreInsights } from "@/components/shop/score-insights";

/*
 * Monthly score has two distinct designs:
 *  - ฟรี: this month vs last month, nothing locked or blurred.
 *  - Coach: the full 12-month chart and table.
 */

const MONTHS: Record<Lang, string[]> = {
  th: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/** "2569-11" → "พ.ย." / "Nov", optionally with the year */
function monthLabel(ym: string, lang: Lang, withYear = false) {
  const [y, m] = ym.split("-").map(Number);
  const name = MONTHS[lang][m - 1];
  if (!withYear) return name;
  return lang === "th" ? `${name} ${String(y).slice(2)}` : `${name} ${y - 543}`;
}

/** Monthly averages, with the current month replaced by today's live score. */
function useHistory() {
  const live = useShopScore();
  const months = merchie.score_history.months;
  return months.map((m, i) => (i === months.length - 1 ? { ...m, score: live } : m));
}

function Delta({ diff, className }: { diff: number; className?: string }) {
  return (
    <span className={cn("num font-semibold", diff >= 0 ? "text-good-ink" : "text-danger-ink", className)}>
      {diff >= 0 ? "+" : "−"}
      {Math.abs(diff)}
    </span>
  );
}

/* ------------------------------------------------------------------ card */

export function ScoreHistoryCard() {
  const { t, lang } = useLang();
  const { has } = useDemo();
  const pro = has("plus");
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const cur = history[history.length - 1];
  const prev = history[history.length - 2];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="pressable chrome block w-full rounded-card bg-surface p-5 text-left shadow-soft"
      >
        <p className="flex items-center text-[15px] font-semibold text-muted">
          <span className="flex-1">{t("คะแนนรายเดือน", "Monthly score")}</span>
          <ChevronRight className="size-5 text-subtle" />
        </p>

        {pro ? (
          // Coach: score + 12-month mini bars
          <div className="mt-1 flex items-end justify-between gap-4">
            <p className="flex items-baseline gap-2">
              <span className="num font-round text-[36px] leading-none" style={{ color: scoreInk(cur.score) }}>
                {cur.score}
              </span>
              <Delta diff={cur.score - prev.score} className="text-[14px]" />
            </p>
            <span aria-hidden className="flex h-9 items-end gap-[2px]">
              {history.map((m, i) => (
                <span
                  key={m.month}
                  className="w-[5px] rounded-t-[2px]"
                  style={{
                    height: `${Math.max(12, m.score)}%`,
                    background: "var(--chart-1)",
                    opacity: i === history.length - 1 ? 1 : 0.35,
                  }}
                />
              ))}
            </span>
          </div>
        ) : (
          // ฟรี: last month → this month
          <div className="mt-2 flex items-center gap-3">
            <span>
              <span className="block text-[13px] text-muted">{monthLabel(prev.month, lang)}</span>
              <span className="num font-round text-[24px] leading-none" style={{ color: scoreInk(prev.score) }}>
                {prev.score}
              </span>
            </span>
            <ArrowRight className="mt-4 size-4 text-subtle" strokeWidth={2.4} />
            <span>
              <span className="block text-[13px] text-muted">{t("เดือนนี้", "This month")}</span>
              <span className="num font-round text-[36px] leading-none" style={{ color: scoreInk(cur.score) }}>
                {cur.score}
              </span>
            </span>
            <Delta diff={cur.score - prev.score} className="mt-5 text-[14px]" />
          </div>
        )}
      </button>
      <Sheet open={open} onOpenChange={setOpen} title={t("คะแนนรายเดือน", "Monthly score")}>
        {pro ? <ProHistory onGo={() => setOpen(false)} /> : <FreeCompare />}
      </Sheet>
    </>
  );
}

/* --------------------------------------------------------------- ฟรี view */

function FreeCompare() {
  const { t, lang } = useLang();
  const tryPlan = useTryPlan();
  const history = useHistory();
  const cur = history[history.length - 1];
  const prev = history[history.length - 2];
  const diff = cur.score - prev.score;

  const rows = [
    { label: monthLabel(prev.month, lang, true), score: prev.score, now: false },
    { label: t("เดือนนี้", "This month"), score: cur.score, now: true },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* two months, side by side */}
      <div className="grid grid-cols-2 gap-3">
        {rows.map((r) => (
          <div key={r.label} className={cn("rounded-[22px] px-4 py-4", r.now ? "bg-glow" : "bg-canvas")}>
            <p className="text-[15px] font-semibold text-muted">{r.label}</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="num font-round text-[40px] leading-none" style={{ color: scoreInk(r.score) }}>
                {r.score}
              </span>
              {r.now && <Delta diff={diff} className="text-[14px]" />}
            </p>
          </div>
        ))}
      </div>

      {/* quiet upsell, not a locked teaser */}
      <button
        onClick={() => tryPlan("plus")}
        className="pressable flex min-h-12 items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-ocean"
      >
        {t("ดูย้อนหลัง 12 เดือนกับ", "See 12 months with")}
        <PlanBadge plan="plus" small />
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- Coach view */

function ProHistory({ onGo }: { onGo: () => void }) {
  const { t, lang } = useLang();
  const history = useHistory();
  const [sel, setSel] = useState(history.length - 1);
  const [view, setView] = useState<"chart" | "table">("chart");
  const cur = history[sel];
  const prev = history[sel - 1];

  return (
    <>
      <ScoreInsights history={history} onGo={onGo} />
      <div className="h-5" />
      <Segmented<"chart" | "table">
        value={view}
        onChange={setView}
        inset
        options={[
          { value: "chart", label: t("กราฟ", "Chart") },
          { value: "table", label: t("ตาราง", "Table") },
        ]}
      />

      {/* fixed-height stage so the toggle never jumps; views slide + blur through */}
      <div className="relative mt-1 h-[330px] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={view === "table" ? 1 : -1}>
          <motion.div
            key={view}
            custom={view === "table" ? 1 : -1}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 36, filter: "blur(6px)" }),
              center: { opacity: 1, x: 0, filter: "blur(0px)" },
              exit: (d: number) => ({ opacity: 0, x: d * -36, filter: "blur(6px)" }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.26, ease: [0.65, 0, 0.35, 1] }}
            className="no-scrollbar absolute inset-0 overflow-y-auto"
          >
            {view === "chart" ? (
              <>
                <div className="mt-4">
                  <p className="text-[15px] font-semibold text-muted">
                    {monthLabel(cur.month, lang, true)}
                  </p>
                  <p className="mt-0.5 flex items-baseline gap-2">
                    <span
                      className="num font-round text-[36px] leading-none" style={{ color: scoreInk(cur.score) }}
                    >
                      {cur.score}
                    </span>
                    {prev && <Delta diff={cur.score - prev.score} className="text-[14px]" />}
                  </p>
                </div>

                {/* one 0–100 axis; dashed lines mark "watch" (60) and "good" (80) */}
                <div className="relative mt-5 h-[190px] pl-8">
                  {[0, 60, 80, 100].map((v) => (
                    <div
                      key={v}
                      className={cn(
                        "absolute right-0 left-8",
                        v === 0 || v === 100 ? "border-t border-line" : "border-t border-dashed border-subtle/50",
                      )}
                      style={{ bottom: `calc(${v}% * 0.86 + 22px)` }}
                    >
                      <span className="num absolute -top-2 -left-8 w-7 text-right text-[12px] text-subtle">{v}</span>
                    </div>
                  ))}
                  <div className="absolute inset-x-0 top-0 bottom-0 left-8 flex items-end gap-[3px] pb-[22px]">
                    {history.map((m, i) => {
                      const on = i === sel;
                      return (
                        <button
                          key={m.month}
                          onClick={() => setSel(i)}
                          aria-label={`${monthLabel(m.month, lang, true)} ${m.score}`}
                          aria-pressed={on}
                          className="relative flex h-full flex-1 flex-col justify-end"
                        >
                          <motion.span
                            className="w-full rounded-t-[4px]"
                            style={{ background: "var(--chart-1)" }}
                            initial={{ height: 0 }}
                            animate={{ height: `${m.score * 0.86}%`, opacity: on ? 1 : 0.4 }}
                            transition={{
                              height: { duration: 0.6, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] },
                              opacity: { duration: 0.2 },
                            }}
                          />
                          <span
                            className={cn(
                              "absolute -bottom-[20px] left-1/2 -translate-x-1/2 text-[12px] whitespace-nowrap",
                              on ? "font-bold text-ink" : "text-subtle",
                            )}
                          >
                            {monthLabel(m.month, lang)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <table className="mt-4 w-full text-[14px]">
                <thead>
                  <tr className="text-left text-[13px] text-muted">
                    <th className="pb-2 font-semibold">{t("เดือน", "Month")}</th>
                    <th className="pb-2 text-right font-semibold">{t("คะแนน", "Score")}</th>
                    <th className="pb-2 text-right font-semibold">{t("เทียบเดือนก่อน", "Change")}</th>
                  </tr>
                </thead>
                <tbody className="num">
                  {history
                    .map((m, i) => ({ m, d: i > 0 ? m.score - history[i - 1].score : null }))
                    .reverse()
                    .map(({ m, d }) => (
                      <tr key={m.month} className="border-t border-line">
                        <td className="py-2.5">{monthLabel(m.month, lang, true)}</td>
                        <td className="py-2.5 text-right font-semibold" style={{ color: scoreInk(m.score) }}>
                          {m.score}
                        </td>
                        <td className="py-2.5 text-right">{d === null ? <span className="text-subtle">–</span> : <Delta diff={d} />}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

