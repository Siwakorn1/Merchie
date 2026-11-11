"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { ExportSheet, HelpSection } from "@/components/shield/help-and-export";
import { PlatformLogo } from "@/components/brand/platform-logo";
import { ScoreRing } from "@/components/health/score-ring";
import { CitationList, LegalNote } from "@/components/legal/citation-list";
import { Sheet, SheetLabel } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { appeal, incident, ladder, vault, vaultStats, type VaultEntry } from "@/lib/content/shield";
import { useDemo } from "@/lib/demo-store";
import { useTryPlan } from "@/components/ui/plan-offer";
import { Mascot } from "@/components/mascot/mascot";
import { PLAN_NAME, SHIELD_CASE_PRICE } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { l, useLang } from "@/lib/i18n";

/**
 * Shield is open to everyone: the Evidence Vault fills up on every plan. Preparing a case
 * document (appeal or help case) is included on Coach and Business; on Check-up and Care it is
 * paid per case. Export is part of the included Shield (Coach and up).
 */
export function ShieldScreen() {
  return <ShieldContent />;
}

function ShieldContent() {
  const { suspended, resolved, has, shieldCases } = useDemo();
  const [appealOpen, setAppealOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [paying, setPaying] = useState<{ id: string; then: () => void } | null>(null);
  const tryPlan = useTryPlan();
  // Coach+ includes Shield; otherwise each case is paid once, then stays open
  const gate = (id: string, then: () => void) =>
    has("pro") || shieldCases.includes(id) ? then() : setPaying({ id, then });
  const days = withFixes(resolved);
  const { t, tr } = useLang();

  return (
    <div className="flex flex-col gap-8 px-5 pt-1">
      {suspended ? (
        <section className="rounded-card bg-surface p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <PlatformLogo id="shopee" size={48} className="rounded-[14px]" />
            <div className="min-w-0 flex-1">
              <p className="text-[17px] leading-tight font-bold">{tr(incident.title)}</p>
              <p className="mt-0.5 text-[14px] text-muted">{tr(incident.sub)}</p>
            </div>
          </div>
          <Ladder current={0} />
          <button
            onClick={() => gate("suspended", () => setAppealOpen(true))}
            className="pressable mt-5 h-12 w-full rounded-full bg-ocean text-[15px] font-semibold text-white shadow-lift"
          >
            {t("สร้างเอกสารอุทธรณ์", "Draft an appeal")}
          </button>
        </section>
      ) : null}

      {/* when something goes wrong, Shield turns the log into help */}
      <HelpSection onAppeal={() => setAppealOpen(true)} gate={gate} />

      {/* Evidence Vault */}
      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="chrome text-[17px] font-bold tracking-tight">Evidence Vault</h2>
          <button
            onClick={() => (has("pro") ? setExportOpen(true) : tryPlan("pro", () => setExportOpen(true)))}
            className="pressable flex h-9 items-center gap-1.5 rounded-full bg-surface px-3.5 text-[13px] font-semibold text-ocean shadow-soft"
          >
            <Download className="size-4" strokeWidth={2.4} />
            Export
          </button>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <Stat value={vaultStats.days} label={t("วันที่เก็บ", "Days kept")} />
          <Stat value={vaultStats.items + resolved.length} label={t("รายการ", "Records")} />
        </div>
        <div className="flex flex-col gap-5">
          {days.map((d) => (
            <div key={d.day.en}>
              <p className="mb-2 px-1 text-[14px] font-semibold text-muted">{tr(d.day)}</p>
              <div className="overflow-hidden rounded-card bg-surface shadow-soft">
                {d.entries.map((e, i) => (
                  <div key={e.title.en + e.time} className={cn("flex items-center gap-4 px-4 py-3.5", i > 0 && "border-t border-line")}>
                    <span className="num w-11 shrink-0 text-[14px] font-semibold text-muted">{e.time}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{tr(e.title)}</span>
                      <span className="block truncate text-[13px] text-muted">{tr(e.sub)}</span>
                    </span>
                    {e.score !== undefined && <ScoreRing score={e.score} size={38} stroke={4} />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <AppealSheet open={appealOpen} onOpenChange={setAppealOpen} />
      <PayCaseSheet request={paying} onClose={() => setPaying(null)} />
      <ExportSheet open={exportOpen} onOpenChange={setExportOpen} days={days} />
    </div>
  );
}

/** Fixes made in this session show up in today's vault entries. */
function withFixes(resolved: string[]) {
  const extra = [
    resolved.includes("listing-claim") && {
      time: "09:14",
      title: l("แก้ listing", "Listing fixed"),
      sub: l("เก็บข้อความก่อนและหลังแก้", "Before and after saved"),
    },
    resolved.includes("review-allergy") && {
      time: "09:20",
      title: l("ตอบรีวิว 1 ดาว", "Replied to 1-star review"),
      sub: l("เก็บคำตอบและข้อความที่ guardrail ตัด", "Reply and guardrail cuts saved"),
    },
  ].filter(Boolean) as VaultEntry[];
  return vault.map((d, i) => (i === 0 ? { ...d, entries: [...extra.reverse(), ...d.entries] } : d));
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-card bg-surface px-5 py-4 shadow-soft">
      <p className="num text-[26px] leading-none font-bold">{value}</p>
      <p className="mt-1.5 text-[14px] text-muted">{label}</p>
    </div>
  );
}

/** Escalation ladder. The current step is filled; later steps are quiet. */
function Ladder({ current }: { current: number }) {
  const { tr } = useLang();
  return (
    <ol className="mt-5 flex flex-col">
      {ladder.map((step, i) => (
        <li key={step.title.en} className="flex gap-3">
          <span className="flex flex-col items-center">
            <span
              className={cn(
                "num grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold",
                i === current ? "bg-ocean text-white" : "bg-canvas text-muted",
              )}
            >
              {i + 1}
            </span>
            {i < ladder.length - 1 && <span className="w-0.5 flex-1 bg-line" />}
          </span>
          <span className="pb-4">
            <span className={cn("block text-[14px] font-semibold", i !== current && "text-muted")}>{tr(step.title)}</span>
            <span className="block text-[12px] text-muted">{tr(step.sub)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function AppealSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const { t, tr } = useLang();
  const text = [
    `${tr(appeal.greeting)} ${tr(appeal.to)}`,
    `${tr(appeal.subjectLabel)} ${tr(appeal.subject)}`,
    ...appeal.body.map(tr),
  ].join("\n\n");

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("เอกสารอุทธรณ์", "Appeal")}
      footer={
        <div className="flex gap-3">
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
              } catch {}
              setCopied(true);
              toast(t("คัดลอกแล้ว", "Copied"), t("วางในหน้าอุทธรณ์ของ Shopee ได้เลย", "Paste it into Shopee's appeal form"));
            }}
            className="pressable flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ocean text-[15px] font-semibold text-white shadow-lift"
          >
            {copied ? <Check className="size-5" strokeWidth={2.6} /> : <Copy className="size-5" strokeWidth={2.2} />}
            {copied ? t("คัดลอกแล้ว", "Copied") : t("คัดลอก", "Copy")}
          </button>
          <button
            onClick={() =>
              toast(t("เตรียมไฟล์สำหรับทนายแล้ว", "Ready for your lawyer"), t("แนบเอกสารนี้ไปปรึกษาทนายได้เลย", "Take this document to your lawyer"))
            }
            className="pressable h-12 flex-1 rounded-full bg-glow text-[15px] font-semibold text-ocean"
          >
            {t("เตรียมให้ทนาย", "Prepare for a lawyer")}
          </button>
        </div>
      }
    >
      <article className="rounded-[20px] bg-canvas px-5 py-4 text-[14px] leading-relaxed">
        <p className="text-muted">
          {tr(appeal.greeting)} {tr(appeal.to)}
        </p>
        <p className="mt-2 font-semibold">
          {tr(appeal.subjectLabel)} {tr(appeal.subject)}
        </p>
        {appeal.body.map((p) => (
          <p key={p.en} className="mt-3">
            {tr(p)}
          </p>
        ))}
      </article>

      <SheetLabel>{t("แนบหลักฐาน", "Evidence")}</SheetLabel>
      <ul className="overflow-hidden rounded-[20px] bg-canvas">
        {appeal.evidence.map((e, i) => (
          <li key={e.en} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-line")}>
            <span className="flex-1 text-[14px]">{tr(e)}</span>
            <Check className="size-5 text-good-ink" strokeWidth={2.5} />
          </li>
        ))}
      </ul>

      <SheetLabel>{t("อ้างอิง", "Sources")}</SheetLabel>
      <CitationList ids={appeal.cites} />
      <p className="mt-4 text-[12px] text-muted">
        {t("Merchie เตรียมเอกสารให้เท่านั้น ไม่ได้ว่าความแทน", "Merchie prepares documents only and does not represent you")}
      </p>
      <LegalNote />
    </Sheet>
  );
}

/**
 * Pay-per-case Shield (Check-up / Care): one case for ~SHIELD_CASE_PRICE, simulated checkout,
 * or switch to Coach where Shield is included.
 */
function PayCaseSheet({ request, onClose }: { request: { id: string; then: () => void } | null; onClose: () => void }) {
  const { payShieldCase } = useDemo();
  const { t, tr } = useLang();
  const toast = useToast();
  const tryPlan = useTryPlan();
  const [shown, setShown] = useState(request);
  if (request && request !== shown) setShown(request);
  const price = SHIELD_CASE_PRICE.toLocaleString("th-TH");

  return (
    <Sheet open={!!request} onOpenChange={(o) => !o && onClose()}>
      {shown && (
        <div className="flex flex-col items-center text-center">
          <Mascot variant="guardian" size={110} />
          <h2 className="mt-1 text-[19px] font-bold tracking-tight">{t("ใช้ Shield เคสนี้", "Use Shield for this case")}</h2>
          <p className="mt-1 max-w-[280px] text-[14px] leading-relaxed text-balance text-muted">
            {t(
              "Merchie ร่างเอกสาร แนบหลักฐานจาก Vault และบอกขั้นตอนต่อไปให้ครบ",
              "Merchie drafts the document, attaches evidence from the Vault, and lays out the next steps",
            )}
          </p>
          <p className="num mt-4 text-[28px] leading-none font-bold">~฿{price}</p>
          <p className="mt-1 text-[13px] text-muted">{t("ต่อเคส", "per case")}</p>

          <button
            onClick={() => {
              const then = shown.then;
              payShieldCase(shown.id);
              onClose();
              toast(t("ชำระแล้ว (จำลอง)", "Paid (simulated)"), t("เปิดเคสนี้ได้เลย", "This case is open"));
              setTimeout(then, 350);
            }}
            className="pressable mt-5 h-12 w-full rounded-full bg-ocean text-[15px] font-semibold text-white shadow-lift"
          >
            {t(`จ่าย ~฿${price} สำหรับเคสนี้`, `Pay ~฿${price} for this case`)}
          </button>
          <button
            onClick={() => {
              const then = shown.then;
              onClose();
              setTimeout(() => tryPlan("pro", then), 350);
            }}
            className="pressable mt-2 h-12 w-full rounded-full bg-glow text-[15px] font-semibold text-ocean"
          >
            {t(`หรือ ${tr(PLAN_NAME.pro)} รวม Shield ทุกเคส`, `Or ${tr(PLAN_NAME.pro)}: Shield for every case`)}
          </button>
          <button onClick={onClose} className="pressable mt-1 h-11 w-full rounded-full text-[15px] font-semibold text-muted">
            {t("ไว้ก่อน", "Not now")}
          </button>
        </div>
      )}
    </Sheet>
  );
}
