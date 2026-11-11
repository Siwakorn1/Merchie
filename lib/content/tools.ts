import type { CitationId } from "@/lib/legal/citations";
import { l, type L } from "@/lib/i18n-core";

/* ---------------------------------------------------------- crisis mode */

/** Demo situation: negative comments spiking after the allergy review. */
export const crisis = {
  spike: { count: 18, hours: 2 },
  summary: l(
    "คอมเมนต์ลบพุ่ง 18 รายการใน 2 ชม. ส่วนใหญ่ถามเรื่องอาการแพ้หลังรีวิว 1 ดาวถูกแชร์",
    "18 negative comments in 2 hours, mostly about reactions after the 1-star review was shared",
  ),
  /** Public statement for Thai buyers: stays Thai in both UI languages. */
  statement:
    "ร้านใสใส สกินแคร์ขอโทษลูกค้าทุกท่านที่ได้รับผลกระทบค่ะ ตอนนี้ร้านพักการขายครีมไวท์เทนนิ่ง lot นี้ไว้ก่อน และกำลังตรวจสอบกับโรงงานผู้ผลิต ลูกค้าที่มีอาการระคายเคืองรบกวนหยุดใช้และทักแชทร้านพร้อมเลข lot ร้านยินดีคืนเงินเต็มจำนวนทุกกรณีค่ะ ร้านจะแจ้งผลตรวจสอบภายใน 48 ชั่วโมง",
  /** What the guardrail kept out of the statement. */
  avoided: [
    { text: l("โทษลูกค้าหรือคนที่รีวิว", "Blaming the reviewer"), cite: "defamation" as CitationId },
    { text: l("ระบุชื่อหรือข้อมูลลูกค้า", "Naming any customer"), cite: "pdpa" as CitationId },
    { text: l("บอกว่าสินค้าปลอดภัย 100% ก่อนตรวจสอบ", "Claiming “100% safe” before checking"), cite: "consumer-ad" as CitationId },
  ],
  /** First 24 hours, in order. */
  plan: [
    { when: l("ชั่วโมงแรก", "Hour 1"), what: l("โพสต์ชี้แจง และปักหมุดไว้บนสุด", "Post the statement and pin it") },
    { when: l("ชั่วโมงแรก", "Hour 1"), what: l("พักการขาย lot ที่มีปัญหา", "Pause sales of the affected lot") },
    { when: l("ภายใน 6 ชม.", "Within 6h"), what: l("ตอบคอมเมนต์ด้วยข้อความเดียวกัน ชวนคุยในแชท", "Reply to comments with the same line; move to chat") },
    { when: l("ภายใน 12 ชม.", "Within 12h"), what: l("ติดต่อโรงงาน ขอผลตรวจ lot", "Ask the manufacturer to test the lot") },
    { when: l("ภายใน 24 ชม.", "Within 24h"), what: l("คืนเงินทุกเคสที่แจ้ง และเก็บหลักฐานใน Vault", "Refund every report and save it to the Vault") },
  ] satisfies { when: L; what: L }[],
};

/* ------------------------------------------------------- copy checker */

export type RiskWord = { word: string; why: L; cite: CitationId };

/** Phrases that commonly get cosmetics listings flagged. */
export const RISK_WORDS: RiskWord[] = [
  { word: "รักษา", why: l("อ้างผลรักษา", "Treatment claim"), cite: "cosmetic-ad" },
  { word: "หายขาด", why: l("อ้างผลรักษา", "Cure claim"), cite: "cosmetic-ad" },
  { word: "ถาวร", why: l("เกินจริง", "Exaggerated"), cite: "consumer-ad" },
  { word: "100%", why: l("รับรองเกินจริง", "Absolute promise"), cite: "consumer-ad" },
  { word: "ขาวใน", why: l("ระบุผลและเวลาที่พิสูจน์ไม่ได้", "Promises a timed result"), cite: "consumer-ad" },
  { word: "เห็นผลทันที", why: l("เกินจริง", "Exaggerated"), cite: "consumer-ad" },
  { word: "ดีที่สุด", why: l("อ้างเหนือกว่าโดยไม่มีหลักฐาน", "Unproven superiority"), cite: "consumer-ad" },
  { word: "อันดับ 1", why: l("อ้างเหนือกว่าโดยไม่มีหลักฐาน", "Unproven superiority"), cite: "consumer-ad" },
  { word: "อย. รับรอง", why: l("อย. ไม่ได้ “รับรอง” เครื่องสำอาง แค่รับจดแจ้ง", "The FDA notifies cosmetics; it doesn't “certify” them"), cite: "cosmetic-notify" },
  { word: "ฝ้า", why: l("อ้างรักษาภาวะผิว", "Claims to treat a skin condition"), cite: "cosmetic-ad" },
  { word: "สิว", why: l("ระวังการอ้างรักษาสิว", "Careful with acne-treatment claims"), cite: "cosmetic-ad" },
];

export const CHECKER_SAMPLE = "ครีมกันแดดอันดับ 1 เห็นผลทันที ช่วยรักษาฝ้า อย. รับรอง ปลอดภัย 100%";
