"use client";

import { useTryPlan } from "@/components/ui/plan-offer";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Sheet, SheetLabel } from "@/components/ui/sheet";
import { ProductThumb } from "@/components/illustrations/product-thumb";
import { ScoreRing } from "@/components/health/score-ring";
import { CitationList, LegalNote } from "@/components/legal/citation-list";
import type { Issue } from "@/lib/content/issues";
import { useDemo } from "@/lib/demo-store";
import { useCloudTransition } from "@/components/motion/cloud-transition";
import { useLang } from "@/lib/i18n";

export function IssuesSection({ limit = 4 }: { limit?: number }) {
  const [active, setActive] = useState<Issue | null>(null);
  const { openIssues: issues } = useDemo();
  const { t } = useLang();
  if (issues.length === 0) return null;

  return (
    <section className="px-5">
      <SectionTitle>{t("เรื่องที่ควรแก้", "To fix")}</SectionTitle>
      <div className="overflow-hidden rounded-card bg-surface shadow-soft">
        {issues.slice(0, limit).map((issue, i) => (
          <div key={issue.id}>
            {i > 0 && <div className="ml-[80px] h-px bg-line" />}
            <IssueRow issue={issue} onClick={() => setActive(issue)} />
          </div>
        ))}
      </div>
      <IssueSheet issue={active} onClose={() => setActive(null)} />
    </section>
  );
}

export function IssueRow({
  issue,
  onClick,
}: {
  issue: Issue;
  onClick: () => void;
}) {
  const { tr } = useLang();
  return (
    <button
      onClick={onClick}
      className="chrome flex w-full items-center gap-4 px-4 py-3 text-left transition-colors active:bg-glow"
    >
      <IssueLead issue={issue} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold">
          {tr(issue.title)}
        </span>
        <span className="block truncate text-[13px] text-muted">
          {tr(issue.sub)}
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-subtle" />
    </button>
  );
}

/** Product photo, or a mini ring for non-product issues (e.g. penalty points). */
export function IssueLead({
  issue,
  size = 48,
}: {
  issue: Issue;
  size?: number;
}) {
  if (issue.product) {
    return (
      <ProductThumb
        kind={issue.product.kind}
        urgent={issue.status === "danger"}
        platform={issue.platform}
        size={size}
      />
    );
  }
  if (issue.meter) {
    const pct = (issue.meter.value / issue.meter.max) * 100;
    return (
      <span
        className="grid shrink-0 place-items-center rounded-[28%] bg-canvas"
        style={{ width: size, height: size }}
      >
        <ScoreRing
          score={pct}
          status={issue.status}
          size={size - 14}
          stroke={4.5}
        >
          <span className="num relative text-[14px] font-bold">
            {issue.meter.value}
          </span>
        </ScoreRing>
      </span>
    );
  }
  return null;
}

export function IssueSheet({
  issue,
  onClose,
}: {
  issue: Issue | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const cloud = useCloudTransition();
  const { t, tr } = useLang();
  const plus = useDemo().has("plus");
  const tryPlan = useTryPlan();
  // keep the last issue rendered while the sheet animates closed
  const [shown, setShown] = useState<Issue | null>(issue);
  if (issue && issue !== shown) setShown(issue);
  const i = issue ?? shown;

  return (
    <Sheet
      open={!!issue}
      onOpenChange={(o) => !o && onClose()}
      footer={
        i?.fix && (
          <button
            onClick={() => {
              const href = i.fix!.href;
              onClose();
              cloud({
                caption: t("ไปแก้กัน", "Let's fix it"),
                onCovered: () => router.push(href),
                hold: 600,
              });
            }}
            className="pressable h-12 w-full rounded-full bg-ocean text-[15px] font-semibold text-white shadow-lift"
          >
            {tr(i.fix.label)}
          </button>
        )
      }
    >
      {i && (
        <>
          <div className="flex items-center gap-4">
            <IssueLead issue={i} size={56} />
            <div className="min-w-0">
              <h2 className="text-[19px] leading-tight font-bold tracking-tight">
                {tr(i.title)}
              </h2>
              <p className="mt-0.5 truncate text-[14px] text-muted">
                {tr(i.sub)}
              </p>
            </div>
          </div>

          <p className="mt-5 text-[15px] leading-relaxed">{tr(i.detail)}</p>

          {i.quote && (
            <>
              <SheetLabel>
                {i.quote.marks.length
                  ? t("ข้อความใน listing", "Listing text")
                  : t("รีวิว", "Review")}
              </SheetLabel>
              <blockquote className="rounded-[20px] bg-canvas px-4 py-3.5 text-[14px] leading-relaxed">
                <Marked text={i.quote.text} marks={i.quote.marks} />
              </blockquote>
            </>
          )}

          {!plus ? (
            <div className="mt-6 flex items-center gap-3 rounded-[20px] bg-glow px-4 py-3.5">
              <p className="min-w-0 flex-1 text-[14px] leading-snug">
                {t(
                  "ให้ AI บอกว่าต้องทำอะไร และข้อกฎหมายที่เกี่ยว",
                  "See what to do and the law behind it",
                )}
              </p>
              <button
                onClick={() => tryPlan("plus")}
                className="pressable flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-ocean px-4 text-[14px] font-semibold text-white"
              >
                {t("ลองฟรี", "Try free")}
              </button>
            </div>
          ) : (
            <>
              {i.steps && (
                <>
                  <SheetLabel>{t("ทำอะไรต่อ", "What to do")}</SheetLabel>
                  <ol className="flex flex-col gap-2.5">
                    {i.steps.map((s, n) => (
                      <li
                        key={s.en}
                        className="flex gap-3 text-[14px] leading-snug"
                      >
                        <span className="num grid size-6 shrink-0 place-items-center rounded-full bg-glow text-[12px] font-bold text-ocean">
                          {n + 1}
                        </span>
                        <span className="pt-0.5">{tr(s)}</span>
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {i.cites.length > 0 && (
                <>
                  <SheetLabel>{t("อ้างอิง", "Sources")}</SheetLabel>
                  <CitationList ids={i.cites} />
                  <LegalNote />
                </>
              )}
            </>
          )}
        </>
      )}
    </Sheet>
  );
}

/** Highlights risky phrases with a soft red underline. */
export function Marked({ text, marks }: { text: string; marks: string[] }) {
  if (!marks.length) return <>{text}</>;
  const re = new RegExp(
    `(${marks.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g",
  );
  return (
    <>
      {text.split(re).map((part, k) =>
        marks.includes(part) ? (
          <mark
            key={k}
            className="rounded-[4px] bg-danger-soft px-0.5 text-danger-ink decoration-danger decoration-2 underline-offset-4"
          >
            {part}
          </mark>
        ) : (
          <span key={k}>{part}</span>
        ),
      )}
    </>
  );
}

export function SectionTitle({
  children,
  count,
}: {
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <h2 className="chrome mb-3 flex items-baseline gap-2 px-1 text-[17px] font-bold tracking-tight">
      {children}
      {count !== undefined && (
        <span className="num text-[15px] font-semibold text-subtle">
          {count}
        </span>
      )}
    </h2>
  );
}
