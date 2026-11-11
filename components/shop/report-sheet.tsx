"use client";

import { Download, MessageCircle, CalendarDays } from "lucide-react";
import { Sheet, SheetLabel } from "@/components/ui/sheet";
import { Mascot } from "@/components/mascot/mascot";
import { ScoreRing } from "@/components/health/score-ring";
import { useToast } from "@/components/ui/toast";
import { useDemo, useShopScore } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import { REPORT, RESELLERS } from "@/lib/content/business";
import { findRisks } from "@/lib/content/live";
import { scoreInk } from "@/lib/health/status";
import merchie from "@/mock/merchie/shop.json";

/** Business: the month in one page, a downloadable report, and the shop's account manager. */
export function ReportSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t, tr } = useLang();
  const toast = useToast();
  const { resolved, mascotStyle } = useDemo();
  const score = useShopScore();
  const months = merchie.score_history.months;
  const avg = Math.round(months.reduce((s, m) => s + m.score, 0) / months.length);
  const riskyResellers = RESELLERS.filter((r) => findRisks(r.text).length).length;

  const download = () => {
    const lines = [
      `Merchie monthly report: ${merchie.shop.name}`,
      `${tr(REPORT.month)}`,
      "",
      `${t("คะแนนวันนี้", "Score today")}: ${score}`,
      `${t("เฉลี่ย 12 เดือน", "12-month average")}: ${avg}`,
      `${t("เรื่องที่แก้แล้ว", "Issues fixed")}: ${resolved.length}`,
      `${t("ตัวแทนที่มีคำเสี่ยง", "Resellers with risky claims")}: ${riskyResellers}/${RESELLERS.length}`,
      "",
      t("ไฮไลต์", "Highlights"),
      ...REPORT.highlights.map((h) => `- ${tr(h)}`),
      "",
      t("เดือนหน้า", "Next month"),
      ...REPORT.next.map((h) => `- ${tr(h)}`),
    ];
    const url = URL.createObjectURL(new Blob(["﻿" + lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "merchie-monthly-report.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast(t("ดาวน์โหลดรายงานแล้ว", "Report downloaded"));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t("รายงานรายเดือน", "Monthly report")}>
      <p className="-mt-2 mb-4 text-[14px] text-muted">{tr(REPORT.month)}</p>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center rounded-[18px] bg-canvas px-2 py-3 text-center">
          <ScoreRing score={score} size={48} stroke={5}>
            <span className="num relative text-[14px] font-bold" style={{ color: scoreInk(score) }}>
              {score}
            </span>
          </ScoreRing>
          <p className="mt-1.5 text-[12px] text-muted">{t("วันนี้", "Today")}</p>
        </div>
        <Stat value={String(resolved.length)} label={t("แก้แล้ว", "Fixed")} />
        <Stat value={`${riskyResellers}/${RESELLERS.length}`} label={t("ตัวแทนเสี่ยง", "Risky resellers")} />
      </div>

      <SheetLabel>{t("ไฮไลต์", "Highlights")}</SheetLabel>
      <div className="flex flex-col gap-2 rounded-[20px] bg-canvas px-4 py-3.5">
        {REPORT.highlights.map((h) => (
          <p key={h.en} className="text-[14px] leading-snug">
            {tr(h)}
          </p>
        ))}
      </div>
      <SheetLabel>{t("เดือนหน้า", "Next month")}</SheetLabel>
      <div className="flex flex-col gap-2 rounded-[20px] bg-canvas px-4 py-3.5">
        {REPORT.next.map((h) => (
          <p key={h.en} className="text-[14px] leading-snug">
            {tr(h)}
          </p>
        ))}
      </div>

      <button
        onClick={download}
        className="pressable mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ocean text-[15px] font-semibold text-white shadow-lift"
      >
        <Download className="size-4" strokeWidth={2.4} />
        {t("ดาวน์โหลดรายงาน", "Download report")}
      </button>

      {/* the shop's account manager */}
      <SheetLabel>{t("ผู้ดูแลบัญชี", "Account manager")}</SheetLabel>
      <div className="rounded-[20px] bg-canvas px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-glow">
            <Mascot variant={mascotStyle} size={44} interactive={false} />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold">{t("ผู้ดูแลบัญชีของร้าน", "Your account manager")}</p>
            <p className="text-[13px] text-muted">{t("ทีม Merchie", "Team Merchie")}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => toast(t("เปิดแชทกับผู้ดูแลบัญชี", "Opening chat with your account manager"))}
            className="pressable flex h-11 items-center justify-center gap-1.5 rounded-full bg-surface text-[14px] font-semibold text-ocean"
          >
            <MessageCircle className="size-4" strokeWidth={2.4} />
            {t("แชท", "Chat")}
          </button>
          <button
            onClick={() => toast(t("ส่งคำขอนัดคุยแล้ว", "Meeting request sent"))}
            className="pressable flex h-11 items-center justify-center gap-1.5 rounded-full bg-surface text-[14px] font-semibold text-ocean"
          >
            <CalendarDays className="size-4" strokeWidth={2.4} />
            {t("นัดคุย", "Book a call")}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[18px] bg-canvas px-2 py-3 text-center">
      <p className="num text-[20px] leading-none font-bold">{value}</p>
      <p className="mt-1.5 text-[12px] text-muted">{label}</p>
    </div>
  );
}
