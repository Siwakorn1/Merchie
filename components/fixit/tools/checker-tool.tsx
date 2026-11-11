"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Marked, SectionTitle } from "@/components/health/issue-list";
import { useCiteLine, LegalNote } from "@/components/legal/citation-list";
import { CHECKER_SAMPLE, RISK_WORDS } from "@/lib/content/tools";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ScoreRing } from "@/components/health/score-ring";
import { PlanOffer } from "@/components/ui/plan-offer";
import { useDemo } from "@/lib/demo-store";
import { FREE_SCANS } from "@/lib/plans";

/** Paste ad copy, see risky phrases highlighted with the law behind each one. */
export function CheckerTool() {
  const { t, tr } = useLang();
  const citeLine = useCiteLine();
  const { has, scansUsed, useScan: spendScan } = useDemo();
  const unlimited = has("plus");
  const left = Math.max(0, FREE_SCANS - scansUsed);
  const [text, setText] = useState(CHECKER_SAMPLE);
  // what was last checked: results follow this, not every keystroke, so each check counts once
  const [checked, setChecked] = useState<string | null>(null);
  const found = useMemo(() => (checked ? RISK_WORDS.filter((w) => checked.includes(w.word)) : []), [checked]);
  const stale = checked !== text;
  const run = () => {
    if (!unlimited) spendScan();
    setChecked(text);
  };

  if (!unlimited && left === 0 && stale) {
    return (
      <div className="rounded-card bg-surface px-6 py-6 shadow-soft">
        <PlanOffer
          need="plus"
          title={t("ตรวจครบ 10 ครั้งของเดือนนี้แล้ว", "That's all 10 checks this month")}
          body={t("Care ตรวจข้อความได้ไม่จำกัด", "Care gives you unlimited checks")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <section className="rounded-card bg-surface p-4 shadow-soft">
        <p className="mb-1.5 text-[13px] font-semibold text-muted">{t("วางข้อความโฆษณา", "Paste your ad copy")}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-[16px] bg-canvas px-4 py-3 text-[16px] leading-relaxed outline-none select-text"
        />
        {checked && !stale && (
          <div className="mt-3 rounded-[16px] bg-canvas px-4 py-3 text-[15px] leading-relaxed">
            <Marked text={checked} marks={found.map((f) => f.word)} />
          </div>
        )}
        <div className="mt-3 flex items-center gap-3">
          <button
            disabled={!text.trim() || !stale}
            onClick={run}
            className="pressable h-12 flex-1 rounded-full bg-ocean text-[15px] font-semibold text-white shadow-lift disabled:bg-canvas disabled:text-subtle disabled:shadow-none"
          >
            {t("ตรวจ", "Check")}
          </button>
          {!unlimited && (
            <span className="flex items-center gap-2" aria-label={t(`เหลือ ${left} ครั้ง`, `${left} left`)}>
              <ScoreRing
                score={(left / FREE_SCANS) * 100}
                size={26}
                stroke={4}
                showNumber={false}
                status={left > 3 ? "good" : left > 0 ? "watch" : "danger"}
              />
              <span className="num text-[13px] font-semibold text-muted">
                {left}/{FREE_SCANS}
              </span>
            </span>
          )}
        </div>
      </section>

      {checked && !stale && (
      <section>
        <SectionTitle>
          {found.length ? t(`เจอคำเสี่ยง ${found.length} คำ`, `${found.length} risky phrases`) : t("ผลตรวจ", "Result")}
        </SectionTitle>
        {found.length ? (
          <ul className="overflow-hidden rounded-card bg-surface shadow-soft">
            {found.map((f, i) => (
              <li key={f.word} className={cn("px-4 py-3.5", i > 0 && "border-t border-line")}>
                <p className="text-[14px] font-semibold">
                  <span className="text-danger-ink">“{f.word}”</span>
                </p>
                <p className="mt-0.5 text-[14px] text-muted">{tr(f.why)}</p>
                <p className="mt-0.5 text-[12px] text-muted">{citeLine(f.cite)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-card bg-surface px-4 py-4 shadow-soft">
            <span className="grid size-8 place-items-center rounded-full bg-good-soft text-good-ink">
              <Check className="size-5" strokeWidth={3} />
            </span>
            <p className="text-[14px] font-medium">{t("ไม่เจอคำเสี่ยง โพสต์ได้เลย", "No risky phrases found")}</p>
          </div>
        )}
      </section>
      )}

      {checked && !stale && <LegalNote />}
    </div>
  );
}
