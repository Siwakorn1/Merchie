"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Marked, SectionTitle } from "@/components/health/issue-list";
import { useCiteLine, LegalNote } from "@/components/legal/citation-list";
import { ProductThumb } from "@/components/illustrations/product-thumb";
import { ScoreRing } from "@/components/health/score-ring";
import { useToast } from "@/components/ui/toast";
import { useLang } from "@/lib/i18n";
import { RESELLERS } from "@/lib/content/business";
import { findRisks, saferText } from "@/lib/content/live";
import { cn } from "@/lib/utils";

/**
 * Business: Merchie scans the brand's resellers' listings for the same risky claims it checks
 * in the shop's own listings, and drafts a note asking each reseller to fix theirs.
 */
export function ResellerTool() {
  const { t, tr } = useLang();
  const toast = useToast();
  const citeLine = useCiteLine();
  const [notified, setNotified] = useState<string[]>([]);
  const scanned = RESELLERS.map((r) => ({ ...r, risks: findRisks(r.text) }));
  const risky = scanned.filter((r) => r.risks.length > 0);
  const okPct = Math.round(((scanned.length - risky.length) / scanned.length) * 100);

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-3 gap-2">
        <Tile value={String(scanned.length)} label={t("ตัวแทน", "Resellers")} />
        <Tile value={String(risky.length)} label={t("มีคำเสี่ยง", "Risky")} />
        <div className="flex flex-col items-center rounded-[18px] bg-surface px-2 py-2.5 text-center shadow-soft">
          <ScoreRing score={okPct} size={44} stroke={5}>
            <span className="num relative text-[12px] font-bold">{okPct}%</span>
          </ScoreRing>
          <p className="mt-1 text-[12px] text-muted">{t("ผ่าน", "Clean")}</p>
        </div>
      </section>

      <section>
        <SectionTitle>{t("listing ของตัวแทน", "Reseller listings")}</SectionTitle>
        <div className="flex flex-col gap-2.5">
          {scanned.map((r) => {
            const sent = notified.includes(r.id);
            return (
              <div
                key={r.id}
                className={cn("rounded-[20px] bg-surface px-4 py-3.5 shadow-soft", r.risks.length && !sent && "ring-2 ring-danger/50")}
              >
                <div className="flex items-center gap-3">
                  <ProductThumb kind={r.kind} size={40} platform={r.platform} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">{r.shop}</p>
                    <p className="truncate text-[12px] text-muted">{r.product}</p>
                  </div>
                </div>
                <p className="mt-2.5 text-[14px] leading-relaxed">
                  <Marked text={r.text} marks={r.risks.map((x) => x.phrase)} />
                </p>

                {r.risks.length === 0 ? (
                  <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-good-ink">
                    <Check className="size-4" strokeWidth={3} />
                    {t("ไม่เจอคำเสี่ยง", "No risky claims")}
                  </p>
                ) : (
                  <>
                    <p className="mt-2 text-[13px] leading-snug">
                      <span className="text-muted">{t("ให้แก้เป็น", "Suggested")} </span>
                      <span className="font-semibold text-good-ink">{saferText(r.text)}</span>
                    </p>
                    {r.risks.map((x) => (
                      <p key={x.phrase} className="mt-1 text-[12px] text-muted">
                        “{x.phrase}” {tr(x.why)}. {citeLine(x.cite)}
                      </p>
                    ))}
                    <button
                      disabled={sent}
                      onClick={() => {
                        setNotified((n) => [...n, r.id]);
                        toast(t("ส่งข้อความถึงตัวแทนแล้ว", "Message sent to reseller"), r.shop);
                      }}
                      className={cn(
                        "pressable mt-3 h-11 w-full rounded-full text-[14px] font-semibold",
                        sent ? "bg-canvas text-subtle" : "bg-ocean text-white",
                      )}
                    >
                      {sent ? t("แจ้งตัวแทนแล้ว", "Reseller notified") : t("ส่งข้อความให้ตัวแทนแก้", "Ask the reseller to fix it")}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <LegalNote />
    </div>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[18px] bg-surface px-2 py-2.5 text-center shadow-soft">
      <p className="num text-[22px] leading-none font-bold">{value}</p>
      <p className="mt-1.5 text-[12px] text-muted">{label}</p>
    </div>
  );
}
