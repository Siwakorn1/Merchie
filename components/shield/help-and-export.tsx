"use client";

import { useState } from "react";
import { Check, ChevronRight, Copy, Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { Sheet, SheetLabel } from "@/components/ui/sheet";
import { Segmented } from "@/components/ui/segmented";
import { useToast } from "@/components/ui/toast";
import { SectionTitle } from "@/components/health/issue-list";
import { CitationList, LegalNote } from "@/components/legal/citation-list";
import { helpCases, type HelpCase } from "@/lib/content/shield-help";
import type { VaultEntry } from "@/lib/content/shield";
import { daysUntil } from "@/lib/content/tax";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------- get help */

/** "Something went wrong?" Pick a case; suspension opens the existing appeal sheet. */
export function HelpSection({
  onAppeal,
  gate = (_id, then) => then(),
}: {
  onAppeal: () => void;
  /** pay-per-case check before a case opens (Check-up / Care) */
  gate?: (caseId: string, then: () => void) => void;
}) {
  const { t, tr } = useLang();
  const [active, setActive] = useState<HelpCase | null>(null);
  const [shown, setShown] = useState<HelpCase | null>(null);
  if (active && active !== shown) setShown(active);

  return (
    <section>
      <SectionTitle>{t("มีปัญหาอะไร", "Need help with")}</SectionTitle>
      <div className="overflow-hidden rounded-card bg-surface shadow-soft">
        {helpCases.map((c, i) => (
          <button
            key={c.id}
            onClick={() => gate(c.id, () => (c.id === "suspended" ? onAppeal() : setActive(c)))}
            className={cn(
              "chrome flex min-h-[64px] w-full items-center gap-3 px-5 py-3 text-left transition-colors active:bg-glow",
              i > 0 && "border-t border-line",
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">{tr(c.title)}</span>
              <span className="block truncate text-[13px] text-muted">{tr(c.sub)}</span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-subtle" />
          </button>
        ))}
      </div>
      <HelpSheet help={active ?? shown} open={!!active} onClose={() => setActive(null)} />
    </section>
  );
}

function HelpSheet({ help, open, onClose }: { help: HelpCase | null; open: boolean; onClose: () => void }) {
  const { t, tr } = useLang();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setCopied(false);
        }
      }}
      title={help ? tr(help.title) : undefined}
      footer={
        help?.draft && (
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(tr(help.draft!));
              } catch {}
              setCopied(true);
              toast(t("คัดลอกแล้ว", "Copied"), t("หลักฐานแนบจาก Vault ให้แล้ว", "Evidence attached from the Vault"));
            }}
            className="pressable flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ocean text-[15px] font-semibold text-white shadow-lift"
          >
            {copied ? <Check className="size-5" strokeWidth={2.6} /> : <Copy className="size-5" strokeWidth={2.2} />}
            {copied ? t("คัดลอกแล้ว", "Copied") : t("คัดลอกเอกสาร", "Copy document")}
          </button>
        )
      }
    >
      {help && (
        <>
          {help.draft && (
            <>
              <SheetLabel>{t("เอกสารที่ Merchie ร่างให้", "Merchie's draft")}</SheetLabel>
              <article className="rounded-[20px] bg-canvas px-4 py-3.5 text-[14px] leading-relaxed select-text">
                {tr(help.draft)}
              </article>
            </>
          )}

          <SheetLabel>{t("หลักฐานที่แนบให้", "Evidence attached")}</SheetLabel>
          <ul className="overflow-hidden rounded-[20px] bg-canvas">
            {help.evidence.map((e, i) => (
              <li key={e.en} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-line")}>
                <span className="flex-1 text-[14px]">{tr(e)}</span>
                <Check className="size-5 text-good-ink" strokeWidth={2.5} />
              </li>
            ))}
          </ul>

          <SheetLabel>{t("ขั้นตอนต่อไป", "Next steps")}</SheetLabel>
          <ol className="flex flex-col gap-2.5">
            {help.steps.map((s, n) => (
              <li key={s.en} className="flex gap-3 text-[14px] leading-snug">
                <span className="num grid size-6 shrink-0 place-items-center rounded-full bg-glow text-[12px] font-bold text-ocean">
                  {n + 1}
                </span>
                <span className="pt-0.5">{tr(s)}</span>
              </li>
            ))}
          </ol>

          <SheetLabel>{t("อ้างอิง", "Sources")}</SheetLabel>
          <CitationList ids={help.cites} />
          <p className="mt-4 text-[12px] text-muted">
            {t("Merchie เตรียมเอกสารให้เท่านั้น ไม่ได้ว่าความแทน", "Merchie prepares documents only and does not represent you")}
          </p>
          <LegalNote />
        </>
      )}
    </Sheet>
  );
}

/* --------------------------------------------------------------- export */

type Day = { day: { th: string; en: string }; date: string; entries: VaultEntry[] };
type Range = "7" | "30" | "all";

/** Download the Evidence Vault as CSV, JSON or a plain-text report. Real files, made in the browser. */
export function ExportSheet({ open, onOpenChange, days }: { open: boolean; onOpenChange: (o: boolean) => void; days: Day[] }) {
  const { t, tr, lang } = useLang();
  const toast = useToast();
  const [range, setRange] = useState<Range>("30");

  const picked = days.filter((d) => range === "all" || -daysUntil(d.date) < Number(range));
  const rows = picked.flatMap((d) =>
    d.entries.map((e) => ({ date: d.date, time: e.time, title: tr(e.title), detail: tr(e.sub), score: e.score ?? "" })),
  );

  const save = (name: string, body: string, type: string) => {
    const url = URL.createObjectURL(new Blob([body], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(t("ดาวน์โหลดแล้ว", "Downloaded"), name);
  };

  const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const formats = [
    {
      id: "csv",
      icon: FileSpreadsheet,
      label: "CSV",
      sub: t("เปิดใน Excel หรือ Google Sheets", "Open in Excel or Google Sheets"),
      run: () =>
        save(
          "merchie-evidence.csv",
          "﻿" +
            [["date", "time", "title", "detail", "score"], ...rows.map((r) => [r.date, r.time, r.title, r.detail, r.score])]
              .map((r) => r.map(csvCell).join(","))
              .join("\n"),
          "text/csv;charset=utf-8",
        ),
    },
    {
      id: "json",
      icon: FileJson,
      label: "JSON",
      sub: t("สำหรับนำเข้าระบบอื่น", "For other systems"),
      run: () =>
        save(
          "merchie-evidence.json",
          JSON.stringify({ shop: "ใสใส สกินแคร์", exported: "2569-11-11", range, records: rows }, null, 2),
          "application/json",
        ),
    },
    {
      id: "txt",
      icon: FileText,
      label: t("รายงานสรุป", "Summary report"),
      sub: t("แนบกับเอกสารอุทธรณ์ได้เลย", "Ready to attach to an appeal"),
      run: () =>
        save(
          "merchie-evidence-report.txt",
          [
            t("รายงานหลักฐานร้าน ใสใส สกินแคร์", "Evidence report for ใสใส สกินแคร์"),
            t(`ทั้งหมด ${rows.length} รายการ`, `${rows.length} records`),
            "",
            ...picked.flatMap((d) => [
              tr(d.day) + ` (${d.date})`,
              ...d.entries.map((e) => `  ${e.time}  ${tr(e.title)}: ${tr(e.sub)}${e.score !== undefined ? ` [${e.score}]` : ""}`),
              "",
            ]),
          ].join("\n"),
          "text/plain;charset=utf-8",
        ),
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t("Export ข้อมูล", "Export data")}>
      <Segmented<Range>
        value={range}
        onChange={setRange}
        inset
        options={[
          { value: "7", label: t("7 วัน", "7 days") },
          { value: "30", label: t("30 วัน", "30 days") },
          { value: "all", label: t("ทั้งหมด", "All") },
        ]}
      />
      <p className="num mt-3 px-1 text-[13px] text-muted">
        {lang === "th" ? `${rows.length} รายการ` : `${rows.length} records`}
      </p>
      <div className="mt-3 overflow-hidden rounded-[20px] bg-canvas">
        {formats.map((f, i) => (
          <button
            key={f.id}
            onClick={f.run}
            className={cn(
              "chrome flex min-h-[60px] w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-glow",
              i > 0 && "border-t border-line",
            )}
          >
            <f.icon className="size-5 shrink-0 text-muted" strokeWidth={2} />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">{f.label}</span>
              <span className="block text-[13px] text-muted">{f.sub}</span>
            </span>
            <Download className="size-5 shrink-0 text-ocean" strokeWidth={2.2} />
          </button>
        ))}
      </div>
    </Sheet>
  );
}
