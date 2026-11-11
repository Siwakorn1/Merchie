import { l, type L } from "@/lib/i18n-core";

/**
 * Three plans, from the owner's tier sheet (2569-11):
 *  - Check up (free): the daily health score, one platform
 *  - Care (Tier 1): score analysis, customer insight, every platform
 *  - Coach (Tier 2): live-commerce tools (live analysis, script check, CF orders) and Shield
 * Code keeps the ids free / plus / pro; only PLAN_NAME / PLAN_SHORT are shown.
 */
export type Plan = "free" | "plus" | "pro";

export const PLAN_RANK: Record<Plan, number> = { free: 0, plus: 1, pro: 2 };
export const atLeast = (have: Plan, need: Plan) => PLAN_RANK[have] >= PLAN_RANK[need];

/** Badge names: no icon, one or two words. The same in Thai and English. */
export const PLAN_SHORT: Record<Plan, L> = {
  free: l("Check up", "Check up"),
  plus: l("Care", "Care"),
  pro: l("Coach", "Coach"),
};

/** Names in copy ("comes with Care"). */
export const PLAN_NAME: Record<Plan, L> = PLAN_SHORT;

/** Free plan limits */
export const FREE_PLATFORMS = 1;
export const FREE_SCANS = 10;

export type PlanInfo = {
  id: Plan;
  price: L;
  forWho: L;
  /** what this tier adds on top of the one below */
  features: L[];
  soon?: L[];
};

export const PLANS: PlanInfo[] = [
  {
    id: "free",
    price: l("ฟรี", "Free"),
    forWho: l("ร้านที่เพิ่งเริ่ม หรือขายเป็นอาชีพเสริม", "Shops just starting out or selling on the side"),
    features: [
      l("คะแนนสุขภาพร้าน 4 วง ทุกวัน", "Daily shop health score, 4 rings"),
      l("เชื่อมได้ 1 แพลตฟอร์ม", "Connect 1 platform"),
      l("บอกว่ามีปัญหาตรงไหน", "Shows where there's a problem"),
      l("Legal Checklist พื้นฐาน", "Basic Legal Checklist"),
      l("ตรวจข้อความ 10 ครั้งต่อเดือน", "10 copy checks a month"),
    ],
  },
  {
    id: "plus",
    price: l("390 บาท/เดือน", "฿390 / month"),
    forWho: l("ร้านที่ขายจริงจัง หลายแพลตฟอร์ม", "Serious sellers on several platforms"),
    features: [
      l("AI วิเคราะห์คะแนนสุขภาพร้าน ว่าขึ้นลงเพราะอะไร", "AI health score analysis: why it went up or down"),
      l("Customer insight: สรุปรีวิวและความรู้สึกลูกค้า", "Customer insight: reviews and sentiment, summarized"),
      l("เชื่อมได้หลายแพลตฟอร์ม", "Connect more platforms"),
      l("Fix-it: AI แก้ listing และร่างคำตอบด้วยปุ่มเดียว", "Fix-it: one-tap AI listing fixes and safe replies"),
      l("สรุปทุกเช้าทาง LINE และแจ้งเตือนด่วน", "Morning brief on LINE and urgent alerts"),
      l("ตรวจข้อความไม่จำกัด", "Unlimited copy checks"),
      l("ถาม Merchie AI และหน้าตาน้องทุกแบบ", "Ask Merchie AI, and every Merchie look"),
      l("คะแนนย้อนหลัง 12 เดือน", "12-month score history"),
    ],
  },
  {
    id: "pro",
    price: l("990 บาท/เดือน", "฿990 / month"),
    forWho: l("ร้านที่ไลฟ์ขาย ร้านใหญ่ หรือมีทีม", "Live sellers, big shops, or a team"),
    features: [
      l("Live analysis: AI ฟังไลฟ์ และชี้คำพูดเสี่ยง", "Live analysis: AI listens to your live and flags risky lines"),
      l("Script check: ตรวจสคริปต์ไลฟ์และคลิปก่อนพูด", "Script check: vet live and clip scripts before you say them"),
      l("CF data: รวมยอด CF จากไลฟ์เป็นออเดอร์", "CF data: turn live “CF” comments into orders"),
      l("Shield: เก็บหลักฐานอัตโนมัติ และ Export", "Shield: evidence and export"),
      l("เอกสารอุทธรณ์ และช่วยเมื่อร้านมีปัญหา", "Appeal letters and help"),
      l("รับมือดราม่า (Crisis Mode) AI ร่างโพสต์ชี้แจง", "Crisis Mode with AI statement"),
      l("ภาษีร้านออนไลน์", "Online-shop tax"),
      l("หลายร้าน หลายแอดมิน", "Multiple shops and admins"),
      l("น้อง Merchie ราชินีสายรุ้ง สวมมงกุฎ", "Rainbow Royal Merchie"),
    ],
  },
];
