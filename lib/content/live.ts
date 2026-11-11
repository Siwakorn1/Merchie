import { l, type L } from "@/lib/i18n-core";
import type { CitationId } from "@/lib/legal/citations";

/**
 * Live-commerce tools (Coach): live analysis, script check, CF orders. Plain data.
 * What sellers say live stays in Thai in both UI languages (it's the seller's own words).
 */

/** Phrases that get live sellers in trouble, each with what to say instead. */
export type ScriptRisk = { phrase: string; why: L; cite: CitationId; safer: string };

export const SCRIPT_RISKS: ScriptRisk[] = [
  { phrase: "ขาวใน 7 วัน", why: l("สัญญาผลลัพธ์และเวลาที่พิสูจน์ไม่ได้", "Promises a timed result"), cite: "consumer-ad", safer: "ผิวดูกระจ่างใสขึ้นเมื่อใช้ต่อเนื่อง" },
  { phrase: "หายขาด", why: l("อ้างผลรักษา", "Cure claim"), cite: "cosmetic-ad", safer: "ดูจางลง" },
  { phrase: "รักษาฝ้า", why: l("อ้างรักษาภาวะผิว", "Claims to treat a skin condition"), cite: "cosmetic-ad", safer: "บำรุงผิวให้ดูสม่ำเสมอ" },
  { phrase: "ดีที่สุดในไทย", why: l("อ้างเหนือกว่าโดยไม่มีหลักฐาน", "Unproven superiority"), cite: "consumer-ad", safer: "ลูกค้าหลายคนซื้อซ้ำ" },
  { phrase: "ปลอดภัย 100%", why: l("รับรองเกินจริง", "Absolute promise"), cite: "consumer-ad", safer: "จดแจ้ง อย. ถูกต้อง" },
  { phrase: "อย. รับรอง", why: l("อย. ไม่ได้ “รับรอง” เครื่องสำอาง แค่รับจดแจ้ง", "The FDA notifies cosmetics; it doesn't “certify” them"), cite: "cosmetic-notify", safer: "จดแจ้ง อย. แล้ว" },
  { phrase: "เห็นผลทันที", why: l("เกินจริง", "Exaggerated"), cite: "consumer-ad", safer: "รู้สึกได้ถึงความชุ่มชื้น" },
  { phrase: "ใช้ผิดวิธีเอง", why: l("กล่าวโทษลูกค้าต่อสาธารณะ เสี่ยงหมิ่นประมาท", "Publicly blames a customer: defamation risk"), cite: "defamation", safer: "ใครมีอาการระคายเคือง ทักแชทร้านได้เลย ร้านดูแลให้" },
];

export function findRisks(text: string) {
  return SCRIPT_RISKS.filter((r) => text.includes(r.phrase));
}

/** Replace every risky phrase with its safer line. */
export function saferText(text: string) {
  return SCRIPT_RISKS.reduce((s, r) => s.split(r.phrase).join(r.safer), text);
}

/* ------------------------------------------------------------ live analysis */

export const LIVE_SESSION = {
  title: "ไลฟ์ครีมใสใส ลด 50% คืนนี้เท่านั้น",
  viewers: 1284,
  /** what the seller says, in order; Merchie flags lines as they come in */
  lines: [
    "สวัสดีค่ะทุกคน วันนี้ใสใสลดราคาครีมไวท์เทนนิ่งให้ 50% เลยนะคะ",
    "ครีมตัวนี้ทาแล้วขาวใน 7 วันจริง ๆ ค่ะ",
    "ใครเป็นฝ้า ทาแล้วฝ้าจางหายขาดเลย",
    "เนื้อครีมบางเบา ซึมไว ไม่เหนอะหนะค่ะ",
    "ของเราดีที่สุดในไทย ปลอดภัย 100% ค่ะ",
    "สนใจคอมเมนต์ CF แล้วพิมพ์รหัส A1 ได้เลยค่ะ",
    "ส่วนคนที่รีวิวว่าแพ้ ใช้ผิดวิธีเองนะคะ",
    "ส่งฟรีทั่วประเทศ ได้ของภายใน 2 วันค่ะ",
  ],
};

/* ------------------------------------------------------------- script check */

export const SCRIPT_SAMPLE = [
  "เปิดไลฟ์: สวัสดีค่ะ วันนี้มีโปรครีมใสใสมาฝาก",
  "ครีมตัวนี้ขาวใน 7 วัน เห็นผลทันทีตั้งแต่ครั้งแรก",
  "ช่วยรักษาฝ้า กระ ให้หายขาด",
  "อย. รับรอง ปลอดภัย 100%",
  "ปิดการขาย: คอมเมนต์ CF ตามด้วยรหัสสินค้าได้เลยค่ะ",
].join("\n");

/* ------------------------------------------------------------------ CF data */

export type LiveProduct = { code: string; name: string; price: number; kind: "jar" | "dropper" | "tube" };

/** Live prices for tonight's codes. Product names are marketplace data: Thai only. */
export const LIVE_PRODUCTS: LiveProduct[] = [
  { code: "A1", name: "ครีมไวท์เทนนิ่ง ใสใส 30 ml", price: 195, kind: "jar" },
  { code: "B2", name: "เซรั่มไฮยา ใสใส 15 ml", price: 199, kind: "dropper" },
  { code: "C3", name: "กันแดด ใสใส SPF50 PA++++", price: 249, kind: "tube" },
];

/** Comments from the live, as the platform's comment API returns them (usernames masked). */
export const LIVE_COMMENTS: { user: string; text: string; time: string; paid: boolean }[] = [
  { user: "n*****y", text: "CF A1", time: "20:04", paid: true },
  { user: "p*****p", text: "cf a1 x2", time: "20:05", paid: true },
  { user: "k*****o", text: "สนใจค่ะ ราคาเท่าไหร่", time: "20:05", paid: false },
  { user: "m*****x", text: "CF C3", time: "20:06", paid: false },
  { user: "z*****a", text: "CF B2 x3", time: "20:07", paid: true },
  { user: "u*****8", text: "CF A1", time: "20:08", paid: true },
  { user: "r*****e", text: "ครีมดีไหมคะ", time: "20:08", paid: false },
  { user: "l*****n", text: "CF A1 x2", time: "20:09", paid: false },
  { user: "t*****t", text: "CF C3 x2", time: "20:11", paid: true },
  { user: "b*****m", text: "CF B2", time: "20:12", paid: true },
  { user: "a*****k", text: "cf c3", time: "20:14", paid: false },
  { user: "w*****i", text: "CF A1", time: "20:15", paid: true },
  { user: "f*****n", text: "CF B2 x2", time: "20:17", paid: true },
  { user: "s*****o", text: "CF A1 x3", time: "20:18", paid: false },
];

/** "CF A1 x2" → { code: "A1", qty: 2 }; anything else is just a comment. */
export function parseCF(text: string) {
  const m = text.match(/^\s*cf\s*([a-z]\d)(?:\s*[x*]\s*(\d+))?\s*$/i);
  return m ? { code: m[1].toUpperCase(), qty: m[2] ? Number(m[2]) : 1 } : null;
}

export const LIVE_ENDED = "20:30";
