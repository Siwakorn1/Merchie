import { l, type L } from "@/lib/i18n-core";
import type { PlatformId } from "@/components/brand/platform-logo";
import type { ProductKind } from "@/lib/content/issues";

/**
 * Business plan demo data. Reseller shop names are fictional; listing text is marketplace
 * data, so it stays in Thai in both UI languages.
 */
export type Reseller = {
  id: string;
  shop: string;
  platform: PlatformId;
  product: string;
  kind: ProductKind;
  text: string;
};

export const RESELLERS: Reseller[] = [
  {
    id: "r1",
    shop: "น้ำหวานบิวตี้ (ตัวแทน)",
    platform: "shopee",
    product: "ครีมไวท์เทนนิ่ง ใสใส 30 ml",
    kind: "jar",
    text: "ของแท้จากบริษัท ขาวใน 7 วัน รักษาฝ้า หายขาด ปลอดภัย 100%",
  },
  {
    id: "r2",
    shop: "ใสใสตัวแทนภาคเหนือ",
    platform: "tiktok",
    product: "เซรั่มไฮยา ใสใส 15 ml",
    kind: "dropper",
    text: "ผิวชุ่มชื้น อิ่มน้ำ ใช้ได้ทุกวัน จดแจ้ง อย. ถูกต้อง",
  },
  {
    id: "r3",
    shop: "Glow Corner",
    platform: "lazada",
    product: "กันแดด ใสใส SPF50 PA++++",
    kind: "tube",
    text: "กันแดดดีที่สุดในไทย เห็นผลทันที อย. รับรอง",
  },
  {
    id: "r4",
    shop: "ครีมดีบอกต่อ",
    platform: "shopee",
    product: "ครีมไวท์เทนนิ่ง ใสใส 30 ml",
    kind: "jar",
    text: "เนื้อบางเบา ซึมไว ไม่เหนอะหนะ ส่งไวทุกวัน",
  },
];

export const REPORT = {
  month: l("พฤศจิกายน 2569", "November 2026"),
  highlights: [
    l("แก้ listing เสี่ยงผิดกฎหมาย 2 รายการ", "Fixed 2 risky listings"),
    l("ตอบรีวิวแย่ทุกรายการภายใน 24 ชม.", "Answered every bad review within 24 hours"),
    l("ตัวแทน 2 ร้านยังใช้คำเกินจริง แจ้งแก้แล้ว", "2 resellers still overclaim; asked to fix"),
  ] satisfies L[],
  next: [
    l("ต่ออายุเลขจดแจ้ง อย. ก่อน มี.ค. 70", "Renew the FDA notification before Mar 2027"),
    l("ยอดขายใกล้เพดาน VAT เตรียมจดทะเบียน", "Revenue nears the VAT threshold: get ready to register"),
  ] satisfies L[],
};
