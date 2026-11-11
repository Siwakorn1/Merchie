import { l, type L } from "@/lib/i18n-core";

/**
 * Thai personal income tax for an online seller (individual, s.40(8) income).
 * Figures are general knowledge for the demo; the team should confirm them before the pitch.
 */

/** Progressive brackets: [upper limit of net income, rate] */
export const BRACKETS: [number, number][] = [
  [150_000, 0],
  [300_000, 0.05],
  [500_000, 0.1],
  [750_000, 0.15],
  [1_000_000, 0.2],
  [2_000_000, 0.25],
  [5_000_000, 0.3],
  [Infinity, 0.35],
];

export const FLAT_EXPENSE = 0.6; // s.40(8) trading: flat 60%
export const PERSONAL_ALLOWANCE = 60_000;

export type Deduction = { id: string; label: L; amount: number; max: number; on: boolean };

export const DEDUCTIONS: Deduction[] = [
  { id: "sso", label: l("ประกันสังคม (ม.40)", "Social security (s.40)"), amount: 3_600, max: 9_000, on: true },
  { id: "life", label: l("เบี้ยประกันชีวิต", "Life insurance premiums"), amount: 30_000, max: 100_000, on: false },
  { id: "health", label: l("เบี้ยประกันสุขภาพตัวเอง", "Own health insurance"), amount: 15_000, max: 25_000, on: false },
  { id: "fund", label: l("กองทุน SSF / RMF", "SSF / RMF funds"), amount: 50_000, max: 200_000, on: false },
];

export function taxOn(net: number) {
  let tax = 0;
  let lower = 0;
  let top = 0;
  for (const [upper, rate] of BRACKETS) {
    if (net <= lower) break;
    tax += (Math.min(net, upper) - lower) * rate;
    top = rate;
    lower = upper;
  }
  return { tax: Math.round(tax), topRate: top };
}

/** Documents to keep, in plain words. */
export const DOCUMENTS: L[] = [
  l("รายงานยอดขายรายเดือนจากทุกแพลตฟอร์ม", "Monthly sales reports from every platform"),
  l("หลักฐานรับเงินโอน / statement บัญชีร้าน", "Bank statements for the shop account"),
  l("ใบเสร็จค่าสินค้า ค่าแพ็ก ค่าส่ง (ถ้าหักตามจริง)", "Receipts for stock, packaging and shipping (if deducting actual costs)"),
  l("หนังสือรับรองเบี้ยประกัน / กองทุนที่ใช้ลดหย่อน", "Certificates for insurance and funds you deduct"),
  l("หนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ) ถ้ามี", "Withholding tax certificates (50 Tawi), if any"),
];

/** Filing calendar for income year 2569 (Gregorian 2026). */
export const DEADLINES: { form: string; what: L; due: string; online?: string }[] = [
  {
    form: "ภ.ง.ด.94",
    what: l("เงินได้ครึ่งปีแรก (ม.ค.–มิ.ย.)", "First-half income (Jan–Jun)"),
    due: "2569-09-30",
    online: "2569-10-08",
  },
  {
    form: "ภ.ง.ด.90",
    what: l("เงินได้ทั้งปี", "Full-year income"),
    due: "2570-03-31",
    online: "2570-04-08",
  },
];

/** Today in the demo, Buddhist-era ISO date. */
export const TODAY = "2569-11-11";

export function daysUntil(beDate: string, today = TODAY) {
  const toDate = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y - 543, m - 1, d);
  };
  return Math.round((toDate(beDate) - toDate(today)) / 86_400_000);
}
