"use client";

import { AiMark } from "@/components/ui/ai-mark";

import { useMemo, useState } from "react";
import { Check, FileText } from "lucide-react";
import { Segmented } from "@/components/ui/segmented";
import { SectionTitle } from "@/components/health/issue-list";
import { CitationList } from "@/components/legal/citation-list";
import { Mascot } from "@/components/mascot/mascot";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import {
  DEADLINES,
  DEDUCTIONS,
  DOCUMENTS,
  FLAT_EXPENSE,
  PERSONAL_ALLOWANCE,
  daysUntil,
  taxOn,
} from "@/lib/content/tax";
import { cn } from "@/lib/utils";

const baht = (n: number) => Math.round(n).toLocaleString("th-TH");
const parse = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;
const VAT_LINE = 1_800_000;

/** Online-seller income tax: estimate, tips, documents, deadlines. The seller types the numbers. */
export function TaxTool() {
  const { t, tr, lang } = useLang();
  const { mascotStyle, outfit } = useDemo();
  const [revenue, setRevenue] = useState("1,650,000");
  const [method, setMethod] = useState<"flat" | "actual">("flat");
  const [actual, setActual] = useState("900,000");
  const [on, setOn] = useState<Record<string, boolean>>(Object.fromEntries(DEDUCTIONS.map((d) => [d.id, d.on])));

  const calc = useMemo(() => {
    const rev = parse(revenue);
    const deductions = PERSONAL_ALLOWANCE + DEDUCTIONS.filter((d) => on[d.id]).reduce((s, d) => s + d.amount, 0);
    const run = (expense: number) => {
      const net = Math.max(0, rev - expense - deductions);
      return { net, ...taxOn(net) };
    };
    const flat = run(rev * FLAT_EXPENSE);
    const act = run(Math.min(parse(actual), rev));
    return { rev, deductions, flat, act, use: method === "flat" ? flat : act };
  }, [revenue, actual, method, on]);

  const { rev, use } = calc;
  const effective = rev > 0 ? (use.tax / rev) * 100 : 0;

  // Merchie's tips, computed from the numbers above
  const tips: string[] = [];
  const saving = Math.abs(calc.flat.tax - calc.act.tax);
  if (saving > 0) {
    tips.push(
      calc.flat.tax <= calc.act.tax
        ? t(`หักเหมา 60% ประหยัดกว่าหักตามจริง ฿${baht(saving)}`, `The flat 60% saves ฿${baht(saving)} over actual costs`)
        : t(
            `หักตามจริงประหยัดกว่า ฿${baht(saving)} แต่ต้องเก็บใบเสร็จให้ครบ`,
            `Actual costs save ฿${baht(saving)}, but keep every receipt`,
          ),
    );
  }
  if (rev > VAT_LINE) {
    tips.push(t("รายได้เกิน 1.8 ล้าน ต้องจด VAT ภายใน 30 วัน", "Revenue is over 1.8M: register for VAT within 30 days"));
  } else if (rev > VAT_LINE * 0.8) {
    tips.push(
      t(
        `อีก ฿${baht(VAT_LINE - rev)} จะถึงเพดาน VAT เตรียมเอกสารจดไว้ก่อน`,
        `฿${baht(VAT_LINE - rev)} to the VAT line; get the paperwork ready`,
      ),
    );
  }
  if (use.topRate >= 0.1) {
    tips.push(
      t(
        `อยู่ขั้นภาษี ${use.topRate * 100}% ลดหย่อนเพิ่มทุก ฿10,000 ประหยัดได้ราว ฿${baht(10_000 * use.topRate)}`,
        `You're in the ${use.topRate * 100}% bracket: each extra ฿10,000 of deductions saves about ฿${baht(10_000 * use.topRate)}`,
      ),
    );
  }
  if (!on.fund && use.topRate >= 0.1) {
    tips.push(t("ลองดู SSF / RMF ลดหย่อนได้และเก็บเงินไปด้วย", "Consider SSF / RMF: a deduction and savings in one"));
  }

  return (
    <div className="flex flex-col gap-7">
      {/* inputs */}
      <section className="rounded-card bg-surface p-4 shadow-soft">
        <Field label={t("รายได้ทั้งปี (ประมาณ)", "Yearly revenue (estimate)")}>
          <MoneyInput value={revenue} onChange={setRevenue} />
        </Field>
        <p className="mt-3 mb-2 text-[13px] font-semibold text-muted">{t("หักค่าใช้จ่าย", "Expenses")}</p>
        <Segmented<"flat" | "actual">
          value={method}
          onChange={setMethod}
          inset
          options={[
            { value: "flat", label: t("เหมา 60%", "Flat 60%") },
            { value: "actual", label: t("ตามจริง", "Actual") },
          ]}
        />
        {method === "actual" && (
          <div className="mt-3">
            <Field label={t("ค่าใช้จ่ายจริงทั้งปี", "Actual yearly expenses")}>
              <MoneyInput value={actual} onChange={setActual} />
            </Field>
          </div>
        )}

        <p className="mt-4 mb-1 text-[13px] font-semibold text-muted">{t("ลดหย่อน", "Deductions")}</p>
        <ul>
          <li className="flex min-h-11 items-center justify-between text-[14px]">
            <span>{t("ส่วนตัว", "Personal allowance")}</span>
            <span className="num text-muted">฿{baht(PERSONAL_ALLOWANCE)}</span>
          </li>
          {DEDUCTIONS.map((d) => (
            <li key={d.id}>
              <button
                onClick={() => setOn((o) => ({ ...o, [d.id]: !o[d.id] }))}
                role="checkbox"
                aria-checked={on[d.id]}
                className="flex min-h-11 w-full items-center gap-3 text-left text-[14px]"
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-[6px] transition-colors",
                    on[d.id] ? "bg-ocean text-white" : "bg-line",
                  )}
                >
                  {on[d.id] && <Check className="size-3.5" strokeWidth={3.2} />}
                </span>
                <span className="flex-1">{tr(d.label)}</span>
                <span className={cn("num", on[d.id] ? "text-ink" : "text-subtle")}>฿{baht(d.amount)}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* result */}
      <section className="rounded-card bg-surface p-5 shadow-soft">
        <p className="text-[13px] font-semibold text-muted">{t("ภาษีที่ต้องจ่ายโดยประมาณ", "Estimated tax")}</p>
        <p className="num mt-1 text-[34px] leading-none font-bold">฿{baht(use.tax)}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-[12px] text-muted">
          <Mini label={t("เงินได้สุทธิ", "Net income")} value={`฿${baht(use.net)}`} />
          <Mini label={t("ขั้นสูงสุด", "Top bracket")} value={`${use.topRate * 100}%`} />
          <Mini label={t("เฉลี่ยจริง", "Effective")} value={`${effective.toFixed(1)}%`} />
        </div>
      </section>

      {/* Merchie's advice */}
      {tips.length > 0 && (
        <section className="flex items-start gap-2">
          <Mascot mood="happy" variant={mascotStyle} outfit={outfit} size={64} interactive={false} className="shrink-0" />
          <div className="flex-1 rounded-[22px] rounded-tl-[8px] bg-surface px-4 py-3 shadow-soft">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-ocean">
              {t("Merchie แนะนำ", "Merchie suggests")}
              <AiMark />
            </p>
            <ul className="mt-1.5 flex flex-col gap-2.5 text-[14px] leading-snug">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* deadlines */}
      <section>
        <SectionTitle>{t("กำหนดยื่น", "Filing deadlines")}</SectionTitle>
        <div className="overflow-hidden rounded-card bg-surface shadow-soft">
          {DEADLINES.map((d, i) => {
            const days = daysUntil(d.online ?? d.due);
            const past = days < 0;
            return (
              <div key={d.form} className={cn("flex items-center gap-3 px-4 py-3.5", i > 0 && "border-t border-line")}>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{d.form}</span>
                  <span className="block text-[13px] text-muted">{tr(d.what)}</span>
                  <span className="block text-[13px] text-muted">
                    {t("ออนไลน์ถึง", "Online by")} {fmtDate(d.online ?? d.due, lang)}
                  </span>
                </span>
                <span
                  className={cn(
                    "num shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold",
                    past ? "bg-canvas text-subtle" : days <= 30 ? "bg-danger-soft text-danger-ink" : "bg-glow text-ocean",
                  )}
                >
                  {past ? t("ผ่านแล้ว", "Passed") : t(`อีก ${days} วัน`, `${days} days`)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* documents */}
      <section>
        <SectionTitle>{t("เอกสารที่ต้องเตรียม", "Documents to keep")}</SectionTitle>
        <ul className="overflow-hidden rounded-card bg-surface shadow-soft">
          {DOCUMENTS.map((doc, i) => (
            <li key={doc.en} className={cn("flex items-center gap-3 px-4 py-3 text-[14px]", i > 0 && "border-t border-line")}>
              <FileText className="size-4 shrink-0 text-muted" strokeWidth={2} />
              <span>{tr(doc)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <CitationList ids={["income-408", "pit-rates", "pit-filing", "vat"]} />
        <p className="mt-4 text-center text-[12px] text-muted">
          {t("ตัวเลขเป็นการประมาณ ไม่ใช่คำปรึกษาด้านภาษี", "Estimates only. Not tax advice.")}
        </p>
      </section>
    </div>
  );
}

function fmtDate(be: string, lang: "th" | "en") {
  const [y, m, d] = be.split("-").map(Number);
  const th = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const en = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return lang === "th" ? `${d} ${th[m - 1]} ${String(y).slice(2)}` : `${en[m - 1]} ${d}, ${y - 543}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}

function MoneyInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <span className="flex h-12 items-center gap-1 rounded-[16px] bg-canvas px-4">
      <span className="text-[16px] font-semibold text-muted">฿</span>
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = parse(e.target.value);
          onChange(n ? n.toLocaleString("th-TH") : "");
        }}
        className="num min-w-0 flex-1 bg-transparent text-[16px] font-semibold outline-none"
      />
    </span>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-canvas px-3 py-2">
      <p>{label}</p>
      <p className="num mt-0.5 text-[14px] font-bold text-ink">{value}</p>
    </div>
  );
}
