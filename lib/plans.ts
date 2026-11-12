import { l, type L } from "@/lib/i18n-core";

/**
 * Four plans, from the owner's tier table (2569-11):
 *  - Check up (free): the daily health score, one platform
 *  - Care (Tier 1, ฿199): score analysis, customer insight, 10 one-tap fixes a month, 3 platforms
 *  - Coach (Tier 2, ฿1,199): unlimited fixes, every platform, Live Coach, Shield included, 3 seats
 *  - Business (฿11,999): many shops, unlimited seats, reseller listing checks, monthly
 *    report with an account manager
 * Code keeps the ids free / plus / pro / business; only PLAN_NAME / PLAN_SHORT are shown.
 */
export type Plan = "free" | "plus" | "pro" | "business";
export type PaidPlan = Exclude<Plan, "free">;

export const PLAN_RANK: Record<Plan, number> = { free: 0, plus: 1, pro: 2, business: 3 };
export const atLeast = (have: Plan, need: Plan) => PLAN_RANK[have] >= PLAN_RANK[need];

/** Badge names: no icon. The same in Thai and English. */
export const PLAN_SHORT: Record<Plan, L> = {
  free: l("Check up", "Check up"),
  plus: l("Care", "Care"),
  pro: l("Coach", "Coach"),
  business: l("Business", "Business"),
};

/** Names in copy ("comes with Care"). */
export const PLAN_NAME: Record<Plan, L> = PLAN_SHORT;

/** Limits per plan. `Infinity` = unlimited. */
export const PLATFORM_LIMIT: Record<Plan, number> = { free: 1, plus: 3, pro: Infinity, business: Infinity };
export const FIX_LIMIT: Record<Plan, number> = { free: 0, plus: 10, pro: Infinity, business: Infinity };
export const SEAT_LIMIT: Record<Plan, number> = { free: 1, plus: 1, pro: 3, business: Infinity };
/** cheapest plan whose limit is above `used` */
export const planFor = (limits: Record<Plan, number>, used: number): PaidPlan =>
  (["plus", "pro", "business"] as PaidPlan[]).find((p) => limits[p] > used) ?? "business";

export const FREE_SCANS = 10;
/** Shield on Check up and Care: paid per case */
export const SHIELD_CASE_PRICE = 499;

export type PlanInfo = {
  id: Plan;
  price: L;
  forWho: L;
  /** what this tier adds on top of the one below */
  features: L[];
};

export const PLANS: PlanInfo[] = [
  {
    id: "free",
    price: l("ฟรี", "Free"),
    forWho: l("ร้านเริ่มต้น หรืออาชีพเสริม", "New shops or side businesses"),
    features: [
      l("Health Score 4 ด้าน", "Health Score, 4 parts"),
      l("เชื่อม 1 แพลตฟอร์ม", "Connect 1 platform"),
      l("รายงานปัญหาตรงไหน", "Shows where the problems are"),
      l("Legal Checklist", "Legal Checklist"),
      l("ตรวจข้อความ 10 ครั้งต่อเดือน", "10 copy checks a month"),
      l(`Shield จ่ายรายครั้ง ~฿${SHIELD_CASE_PRICE}/เคส`, `Shield pay per case, ~฿${SHIELD_CASE_PRICE}`),
    ],
  },
  {
    id: "plus",
    price: l("฿199/เดือน", "฿199 / month"),
    forWho: l("ร้านขายจริงจัง (Solo)", "Serious solo sellers"),
    features: [
      l("Fix-it 10 ครั้ง/เดือน", "Fix-it, 10 a month"),
      l("เชื่อม 3 แพลตฟอร์ม", "Connect 3 platforms"),
      l("Customer Insight", "Customer Insight"),
      l("AI วิเคราะห์ว่าคะแนนขึ้นลงเพราะอะไร", "AI explains why the score moved"),
      l("สรุปทุกเช้าทาง LINE และแจ้งเตือนด่วน", "Morning brief on LINE and urgent alerts"),
      l("ตรวจข้อความไม่จำกัด", "Unlimited copy checks"),
      l("ถาม Merchie AI และหน้าตาน้องทุกแบบ", "Ask Merchie AI, and every Merchie look"),
      l("คะแนนย้อนหลัง 12 เดือน", "12-month score history"),
    ],
  },
  {
    id: "pro",
    price: l("฿1,199/เดือน", "฿1,199 / month"),
    forWho: l("ร้านไลฟ์ หรือมีแอดมิน", "Live sellers or shops with admins"),
    features: [
      l("Fix-it ไม่จำกัด", "Unlimited Fix-it"),
      l("เชื่อมทุกแพลตฟอร์ม", "Connect every platform"),
      l("Live Coach", "Live Coach"),
      l("Shield รวมในแพ็กเกจ", "Shield included"),
      l("ทีม 3 ที่นั่ง", "3 team seats"),
      l("รับมือดราม่า (Crisis Mode) AI ร่างโพสต์ชี้แจง", "Crisis Mode with AI statement"),
      l("ภาษีร้านออนไลน์", "Online-shop tax"),
      l("น้อง Merchie ราชินีสายรุ้ง สวมมงกุฎ", "Rainbow Royal Merchie"),
    ],
  },
  {
    id: "business",
    price: l("฿11,999/เดือน", "฿11,999 / month"),
    forWho: l("SME หรือแบรนด์ที่มีตัวแทนขาย", "SMEs and brands with resellers"),
    features: [
      l("ทุกแพลตฟอร์ม หลายร้าน", "Every platform, many shops"),
      l("ทีมไม่จำกัดที่นั่ง", "Unlimited team seats"),
      l("ตรวจ listing ของตัวแทนขาย", "Reseller listing checks"),
      l("รายงานรายเดือนและผู้ดูแลบัญชี", "Monthly report and an account manager"),
    ],
  },
];
