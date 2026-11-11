"use client";

import { AiMark } from "@/components/ui/ai-mark";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { SectionTitle } from "@/components/health/issue-list";
import { useCiteLine, LegalNote } from "@/components/legal/citation-list";
import { useToast } from "@/components/ui/toast";
import { crisis } from "@/lib/content/tools";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Crisis Mode: what's happening, a ready statement, and the first 24 hours. */
export function CrisisTool() {
  const { t, tr } = useLang();
  const citeLine = useCiteLine();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState<number[]>([]);

  return (
    <div className="flex flex-col gap-7">
      {/* the spike */}
      <section className="rounded-card bg-surface p-5 shadow-soft ring-2 ring-danger/30">
        <p className="flex items-baseline gap-2">
          <span className="num text-[34px] leading-none font-bold text-danger-ink">{crisis.spike.count}</span>
          <span className="text-[14px] font-semibold text-muted">
            {t(`คอมเมนต์ลบใน ${crisis.spike.hours} ชม.`, `negative comments in ${crisis.spike.hours}h`)}
          </span>
        </p>
        <p className="mt-2 text-[14px] leading-relaxed">{tr(crisis.summary)}</p>
      </section>

      {/* statement */}
      <section>
        <SectionTitle>
          <span className="flex items-center gap-2">
            {t("ร่างโพสต์ชี้แจง", "Draft statement")}
            <AiMark className="text-[15px]" />
          </span>
        </SectionTitle>
        <div className="rounded-card bg-surface p-4 shadow-soft">
          <p className="text-[15px] leading-relaxed">{crisis.statement}</p>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(crisis.statement);
              } catch {}
              setCopied(true);
              toast(t("คัดลอกแล้ว", "Copied"), t("โพสต์และปักหมุดได้เลย", "Post it and pin it"));
            }}
            className="pressable mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ocean text-[15px] font-semibold text-white shadow-lift"
          >
            {copied ? <Check className="size-5" strokeWidth={2.6} /> : <Copy className="size-5" strokeWidth={2.2} />}
            {copied ? t("คัดลอกแล้ว", "Copied") : t("คัดลอกโพสต์", "Copy statement")}
          </button>
        </div>
        <ul className="mt-3 flex flex-col gap-1.5 px-1">
          {crisis.avoided.map((a) => (
            <li key={a.text.en} className="text-[13px] text-muted">
              <span className="font-semibold text-danger-ink">{t("ไม่ใส่", "Left out")}:</span> {tr(a.text)}
              <span className="block text-[12px]">{citeLine(a.cite)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 24h plan, tick off as you go */}
      <section>
        <SectionTitle>{t("24 ชม. แรก", "First 24 hours")}</SectionTitle>
        <ul className="overflow-hidden rounded-card bg-surface shadow-soft">
          {crisis.plan.map((step, i) => {
            const on = done.includes(i);
            return (
              <li key={step.what.en} className={cn(i > 0 && "border-t border-line")}>
                <button
                  onClick={() => setDone((d) => (on ? d.filter((x) => x !== i) : [...d, i]))}
                  role="checkbox"
                  aria-checked={on}
                  className="flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left"
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full transition-colors",
                      on ? "bg-good text-white" : "bg-line",
                    )}
                  >
                    {on && <Check className="size-4" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[14px] font-medium", on && "text-subtle line-through")}>
                      {tr(step.what)}
                    </span>
                    <span className="block text-[12px] text-muted">{tr(step.when)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <LegalNote />
    </div>
  );
}
