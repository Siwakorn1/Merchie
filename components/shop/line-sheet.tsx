"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Segmented } from "@/components/ui/segmented";
import { PlanOffer } from "@/components/ui/plan-offer";
import { useToast } from "@/components/ui/toast";
import { PlatformLogo } from "@/components/brand/platform-logo";
import { Mascot } from "@/components/mascot/mascot";
import { useDemo, useShopScore } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LINE_GREEN = "#06C755";

/**
 * LINE morning brief and urgent alerts (Care). Simulated: no LINE Messaging API calls yet.
 * Shows what the message looks like, a connect step, then the settings.
 */
export function LineSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { has, line, setLine, mascotStyle } = useDemo();
  const { t } = useLang();
  const toast = useToast();
  const [connecting, setConnecting] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="LINE">
      {!has("plus") ? (
        <PlanOffer
          need="plus"
          look={mascotStyle}
          mascotSize={120}
          title={t("สรุปทาง LINE สำหรับ Care", "LINE briefs are a Care feature")}
          body={t("น้อง Merchie สรุปร้านให้ทุกเช้า และเตือนทันทีเมื่อมีเรื่องด่วน", "A morning summary every day, and instant alerts")}
        />
      ) : (
        <div className="flex flex-col gap-5">
          <BriefPreview />

          {!line.connected ? (
            <button
              disabled={connecting}
              onClick={() => {
                setConnecting(true);
                setTimeout(() => {
                  setLine({ connected: true });
                  setConnecting(false);
                  toast(t("เชื่อม LINE แล้ว", "LINE connected"), t("พรุ่งนี้ 08:00 รับสรุปเช้าได้เลย", "Your first brief arrives tomorrow at 08:00"));
                }, 900);
              }}
              className="pressable flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-white shadow-lift"
              style={{ background: LINE_GREEN }}
            >
              <PlatformLogo id="line" size={22} className="rounded-[6px]" />
              {connecting ? t("กำลังเชื่อม", "Connecting") : t("เพิ่มเพื่อน @merchie", "Add @merchie on LINE")}
            </button>
          ) : (
            <>
              <div className="overflow-hidden rounded-[20px] bg-canvas">
                <ToggleRow
                  label={t("สรุปทุกเช้า", "Morning brief")}
                  on={line.morning}
                  onChange={(v) => setLine({ morning: v })}
                />
                {line.morning && (
                  <div className="border-t border-line px-4 py-3">
                    <Segmented<string>
                      value={line.time}
                      onChange={(v) => setLine({ time: v })}
                      options={["07:00", "08:00", "09:00"].map((v) => ({ value: v, label: v }))}
                    />
                  </div>
                )}
                <ToggleRow
                  label={t("แจ้งเตือนด่วน", "Urgent alerts")}
                  on={line.urgent}
                  onChange={(v) => setLine({ urgent: v })}
                  border
                />
              </div>
              <button
                onClick={() => toast("Merchie", t("ทดสอบ: น้อง Merchie ส่งข้อความถึงคุณแล้ว", "Test: Merchie just messaged you"))}
                className="pressable h-12 w-full rounded-full bg-glow text-[15px] font-semibold text-ocean"
              >
                {t("ส่งข้อความทดสอบ", "Send a test message")}
              </button>
              <button
                onClick={() => {
                  setLine({ connected: false });
                  toast(t("ยกเลิกการเชื่อม LINE แล้ว", "LINE disconnected"));
                }}
                className="pressable h-11 w-full rounded-full text-[14px] font-semibold text-danger-ink"
              >
                {t("ยกเลิกการเชื่อมต่อ", "Disconnect")}
              </button>
            </>
          )}
        </div>
      )}
    </Sheet>
  );

  /** A LINE-style chat with tomorrow's morning brief from the live shop state. */
  function BriefPreview() {
    const score = useShopScore();
    const { openIssues } = useDemo();
    const urgent = openIssues.filter((i) => i.status === "danger");
    const { tr } = useLang();
    return (
      <div className="overflow-hidden rounded-[22px] bg-canvas">
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: LINE_GREEN }}>
          <span className="text-[14px] font-bold text-white">Merchie</span>
          <span className="text-[12px] text-white/80">{line.time}</span>
        </div>
        <div className="flex items-start gap-2 p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface">
            <Mascot variant={mascotStyle} size={30} interactive={false} />
          </span>
          <div className="rounded-[18px] rounded-tl-[6px] bg-surface px-3.5 py-2.5 text-[14px] leading-relaxed shadow-soft">
            <p className="font-semibold">{t("อรุณสวัสดิ์ค่ะ", "Good morning!")}</p>
            <p>
              {t(`วันนี้ร้านได้ ${score} คะแนน`, `The shop is at ${score} today`)}
            </p>
            {urgent.length > 0 && (
              <p className="mt-1 text-danger-ink">
                {t(`เรื่องด่วน ${urgent.length} เรื่อง`, `${urgent.length} urgent`)}:{" "}
                {urgent.map((u) => tr(u.title)).join(t(" และ ", " and "))}
              </p>
            )}
            <p className={cn("mt-1 font-semibold")} style={{ color: LINE_GREEN }}>
              {t("แตะเพื่อเปิด Merchie", "Tap to open Merchie")}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

function ToggleRow({ label, on, onChange, border }: { label: string; on: boolean; onChange: (v: boolean) => void; border?: boolean }) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className={cn("chrome flex min-h-14 w-full items-center gap-3 px-4 text-left", border && "border-t border-line")}
    >
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <span className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", on ? "bg-good" : "bg-line")}>
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-soft transition-transform duration-200",
            on && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}
