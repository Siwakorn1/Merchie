"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Marked, SectionTitle } from "@/components/health/issue-list";
import { useCiteLine, LegalNote } from "@/components/legal/citation-list";
import { AiMark } from "@/components/ui/ai-mark";
import { useToast } from "@/components/ui/toast";
import { useLang } from "@/lib/i18n";
import { SCRIPT_SAMPLE, findRisks, saferText } from "@/lib/content/live";
import { cn } from "@/lib/utils";

/** Script check: paste a live or clip script, see risky lines, swap in safer wording. */
export function ScriptTool() {
  const { t, tr } = useLang();
  const toast = useToast();
  const citeLine = useCiteLine();
  const [text, setText] = useState(SCRIPT_SAMPLE);
  const [checked, setChecked] = useState<string | null>(null);
  const lines = (checked ?? "").split("\n").filter((x) => x.trim());
  const flaggedCount = lines.filter((x) => findRisks(x).length).length;
  const stale = checked !== text;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-card bg-surface p-4 shadow-soft">
        <p className="mb-1.5 text-[13px] font-semibold text-muted">{t("สคริปต์ไลฟ์หรือคลิป", "Live or clip script")}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full resize-none rounded-[16px] bg-canvas px-4 py-3 text-[16px] leading-relaxed outline-none select-text"
        />
        <button
          disabled={!text.trim() || !stale}
          onClick={() => setChecked(text)}
          className="pressable mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ocean text-[15px] font-semibold text-white shadow-lift disabled:bg-canvas disabled:text-subtle disabled:shadow-none"
        >
          <AiMark light={!!text.trim() && stale} />
          {t("ตรวจสคริปต์", "Check script")}
        </button>
      </section>

      {checked && !stale && (
        <>
          <section>
            <SectionTitle>
              {flaggedCount
                ? t(`เสี่ยง ${flaggedCount} จาก ${lines.length} บรรทัด`, `${flaggedCount} of ${lines.length} lines are risky`)
                : t("ผลตรวจ", "Result")}
            </SectionTitle>
            <div className="flex flex-col gap-2">
              {lines.map((line, i) => {
                const risks = findRisks(line);
                return (
                  <div
                    key={i}
                    className={cn("rounded-[20px] px-4 py-3", risks.length ? "bg-surface shadow-soft" : "bg-canvas")}
                  >
                    <p className="flex items-start gap-2 text-[14px] leading-relaxed">
                      {!risks.length && <Check className="mt-1 size-4 shrink-0 text-good-ink" strokeWidth={3} />}
                      <span>
                        <Marked text={line} marks={risks.map((r) => r.phrase)} />
                      </span>
                    </p>
                    {risks.length > 0 && (
                      <>
                        <p className="mt-2 text-[13px] leading-snug">
                          <span className="text-muted">{t("แนะนำ", "Suggested")} </span>
                          <span className="font-semibold text-good-ink">{saferText(line)}</span>
                        </p>
                        {risks.map((r) => (
                          <p key={r.phrase} className="mt-1 text-[12px] text-muted">
                            “{r.phrase}” {tr(r.why)}. {citeLine(r.cite)}
                          </p>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {flaggedCount > 0 && (
            <button
              onClick={() => {
                const safe = saferText(text);
                setText(safe);
                setChecked(safe);
                toast(t("เปลี่ยนเป็นเวอร์ชันปลอดภัยแล้ว", "Switched to the safe version"));
              }}
              className="pressable h-12 w-full rounded-full bg-glow text-[15px] font-semibold text-ocean"
            >
              {t("ใช้เวอร์ชันปลอดภัยทั้งหมด", "Use the safe version")}
            </button>
          )}
          <LegalNote />
        </>
      )}
    </div>
  );
}
