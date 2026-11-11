"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { SectionTitle } from "@/components/health/issue-list";
import { ProductThumb } from "@/components/illustrations/product-thumb";
import { PlatformLogo } from "@/components/brand/platform-logo";
import { ScoreRing } from "@/components/health/score-ring";
import { Segmented } from "@/components/ui/segmented";
import { useToast } from "@/components/ui/toast";
import { useLang } from "@/lib/i18n";
import { LIVE_COMMENTS, LIVE_ENDED, LIVE_PRODUCTS, parseCF } from "@/lib/content/live";
import { cn } from "@/lib/utils";

type View = "products" | "orders";
const baht = (n: number) => `฿${n.toLocaleString("th-TH")}`;

/**
 * CF data: every "CF A1 x2" comment from the live becomes an order line. Totals per product,
 * who has paid, and a reminder for the ones who haven't. Usernames stay masked (PDPA).
 */
export function CfTool() {
  const { t } = useLang();
  const toast = useToast();
  const [view, setView] = useState<View>("products");
  const [reminded, setReminded] = useState<string[]>([]);

  const orders = useMemo(
    () =>
      LIVE_COMMENTS.flatMap((c) => {
        const cf = parseCF(c.text);
        const product = cf && LIVE_PRODUCTS.find((p) => p.code === cf.code);
        return cf && product ? [{ ...c, ...cf, product, total: product.price * cf.qty }] : [];
      }),
    [],
  );
  const skipped = LIVE_COMMENTS.length - orders.length;
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const paid = orders.filter((o) => o.paid);
  const paidPct = Math.round((paid.length / orders.length) * 100);
  const unpaid = orders.filter((o) => !o.paid);

  const exportCsv = () => {
    const rows = [
      ["time", "buyer", "code", "product", "qty", "amount", "paid"],
      ...orders.map((o) => [o.time, o.user, o.code, o.product.name, o.qty, o.total, o.paid ? "yes" : "no"]),
    ];
    const csv = "﻿" + rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "merchie-cf-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast(t("ดาวน์โหลดออเดอร์แล้ว", "Orders downloaded"), "merchie-cf-orders.csv");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* the live, summed up */}
      <section className="rounded-card bg-surface p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <PlatformLogo id="tiktok" size={40} className="rounded-[12px]" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">{t("ไลฟ์คืนนี้", "Tonight's live")}</p>
            <p className="text-[13px] text-muted">{t(`จบ ${LIVE_ENDED}`, `Ended ${LIVE_ENDED}`)}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Tile value={String(orders.length)} label={t("ออเดอร์ CF", "CF orders")} />
          <Tile value={baht(revenue)} label={t("ยอดรวม", "Total")} />
          <div className="flex flex-col items-center rounded-[18px] bg-canvas px-2 py-2.5 text-center">
            <ScoreRing score={paidPct} size={44} stroke={5}>
              <span className="num relative text-[12px] font-bold">{paidPct}%</span>
            </ScoreRing>
            <p className="mt-1 text-[12px] text-muted">{t("โอนแล้ว", "Paid")}</p>
          </div>
        </div>
        {skipped > 0 && (
          <p className="mt-3 text-[12px] text-muted">
            {t(`ข้ามคอมเมนต์ที่ไม่ใช่ CF ${skipped} รายการ`, `Skipped ${skipped} comments that weren't CFs`)}
          </p>
        )}
      </section>

      <Segmented<View>
        value={view}
        onChange={setView}
        inset
        options={[
          { value: "products", label: t("ตามสินค้า", "By product") },
          { value: "orders", label: t("ตามลูกค้า", "By buyer") },
        ]}
      />

      {view === "products" ? (
        <section className="overflow-hidden rounded-card bg-surface shadow-soft">
          {LIVE_PRODUCTS.map((p, i) => {
            const mine = orders.filter((o) => o.code === p.code);
            const qty = mine.reduce((s, o) => s + o.qty, 0);
            return (
              <div key={p.code} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-line")}>
                <ProductThumb kind={p.kind} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">{p.name}</p>
                  <p className="text-[13px] text-muted">
                    {p.code} {baht(p.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="num text-[17px] font-bold">{qty}</p>
                  <p className="num text-[12px] text-muted">{baht(qty * p.price)}</p>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="overflow-hidden rounded-card bg-surface shadow-soft">
          {orders.map((o, i) => (
            <div key={`${o.user}-${o.time}`} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-line")}>
              <span className="num w-11 shrink-0 text-[13px] text-muted">{o.time}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">{o.user}</p>
                <p className="text-[13px] text-muted">
                  {o.code} x{o.qty}
                </p>
              </div>
              <span className="num text-[14px] font-semibold">{baht(o.total)}</span>
              <span className={cn("w-12 text-right text-[12px] font-semibold", o.paid ? "text-good-ink" : "text-watch-ink")}>
                {o.paid ? t("โอนแล้ว", "Paid") : t("รอโอน", "Unpaid")}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* the ones who CF'd but haven't paid */}
      {unpaid.length > 0 && (
        <section>
          <SectionTitle>{t("ยังไม่โอน", "Not paid yet")}</SectionTitle>
          <div className="overflow-hidden rounded-card bg-surface shadow-soft">
            {unpaid.map((o, i) => {
              const key = `${o.user}-${o.time}`;
              const sent = reminded.includes(key);
              return (
                <div key={key} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-line")}>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">{o.user}</p>
                    <p className="text-[13px] text-muted">
                      {o.code} x{o.qty} {baht(o.total)}
                    </p>
                  </div>
                  <button
                    disabled={sent}
                    onClick={() => {
                      setReminded((r) => [...r, key]);
                      toast(t("ส่งลิงก์ชำระเงินทางแชทแล้ว", "Payment link sent in chat"), o.user);
                    }}
                    className={cn(
                      "pressable h-10 shrink-0 rounded-full px-4 text-[13px] font-semibold",
                      sent ? "text-subtle" : "bg-glow text-ocean",
                    )}
                  >
                    {sent ? t("ส่งแล้ว", "Sent") : t("ส่งลิงก์ชำระ", "Send pay link")}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <button
        onClick={exportCsv}
        className="pressable flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ocean text-[15px] font-semibold text-white shadow-lift"
      >
        <Download className="size-4" strokeWidth={2.4} />
        {t("ดาวน์โหลดออเดอร์ (CSV)", "Download orders (CSV)")}
      </button>
      <p className="-mt-3 text-center text-[12px] text-muted">
        {t("ชื่อลูกค้าแสดงแบบปิดบางส่วนตาม PDPA", "Buyer names stay masked (PDPA)")}
      </p>
    </div>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[18px] bg-canvas px-2 py-2.5 text-center">
      <p className="num text-[17px] leading-none font-bold">{value}</p>
      <p className="mt-1.5 text-[12px] text-muted">{label}</p>
    </div>
  );
}
