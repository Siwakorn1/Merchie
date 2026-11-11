import { l, type L } from "@/lib/i18n-core";
import type { CitationId } from "@/lib/legal/citations";

/** Content for the About screen. Plain data: rendered by components/shop/about-sheet.tsx. */

export const APP_VERSION = "0.9.0";
export const APP_BUILD = "2569.11";

export const WHATS_NEW: { version: string; date: L; items: L[] }[] = [
  {
    version: "0.9.0",
    date: l("11 พ.ย. 2569", "11 Nov 2026"),
    items: [
      l("แพ็กเกจใหม่: Check-up, Care, Coach และ Business", "New plans: Check-up, Care, Coach and Business"),
      l("สรุปทุกเช้าทาง LINE", "Morning brief on LINE"),
      l("คะแนนรายเดือน พร้อมเทียบกับร้านหมวดเดียวกัน", "Monthly score, compared with similar shops"),
      l("น้อง Merchie ราชินีสายรุ้ง สำหรับ Coach", "Rainbow Royal Merchie for Coach"),
    ],
  },
  {
    version: "0.8.0",
    date: l("1 พ.ย. 2569", "1 Nov 2026"),
    items: [
      l("Shield: เอกสารอุทธรณ์ และ Export หลักฐาน", "Shield: appeal letters and evidence export"),
      l("เครื่องมือภาษี และรับมือดราม่า", "Tax and Crisis tools"),
    ],
  },
];

export type AboutSection = { heading: L; body: L; cites?: CitationId[] };

export const PRIVACY: AboutSection[] = [
  {
    heading: l("เราอ่านข้อมูลอะไร", "What we read"),
    body: l(
      "เฉพาะข้อมูลร้านที่คุณกดอนุญาตผ่าน API ทางการของแต่ละแพลตฟอร์ม เช่น สินค้า รีวิว ออเดอร์ และแต้มโทษ อ่านอย่างเดียว ไม่แก้ไขอะไรในร้านถ้าคุณไม่กดยืนยันเอง",
      "Only the shop data you allow through each platform's official API, such as products, reviews, orders and penalty points. Read-only: nothing in your shop changes unless you confirm it.",
    ),
  },
  {
    heading: l("ข้อมูลลูกค้าของคุณ", "Your customers' data"),
    body: l(
      "เราไม่ขาย ไม่แชร์ และไม่ใช้ข้อมูลลูกค้าของร้านเพื่อโฆษณา คำตอบที่ Merchie ร่างจะไม่เปิดเผยชื่อ เบอร์ หรือที่อยู่ของลูกค้า",
      "We never sell, share or advertise with your customers' data. Replies Merchie drafts never reveal a customer's name, phone or address.",
    ),
    cites: ["pdpa"],
  },
  {
    heading: l("สิทธิของคุณ", "Your rights"),
    body: l(
      "ขอดู ขอสำเนา ขอแก้ไข หรือขอลบข้อมูลได้ทุกเมื่อ และยกเลิกการเชื่อมแพลตฟอร์มได้จากหน้าร้าน",
      "Ask to see, copy, correct or delete your data at any time, and disconnect any platform from the Shop tab.",
    ),
    cites: ["pdpa"],
  },
];

export const TERMS: AboutSection[] = [
  {
    heading: l("Merchie ช่วยอะไร", "What Merchie does"),
    body: l(
      "เฝ้าสุขภาพร้าน แจ้งเตือน และเตรียมข้อความหรือเอกสารให้คุณตรวจก่อนใช้ ทุกคำแนะนำทางกฎหมายมีที่มาอ้างอิง",
      "Watches your shop's health, alerts you, and prepares text or documents for you to review before use. Every legal suggestion cites its source.",
    ),
  },
  {
    heading: l("สิ่งที่ Merchie ไม่ทำ", "What Merchie doesn't do"),
    body: l(
      "ไม่ใช่สำนักงานกฎหมาย และไม่ว่าความแทน เรื่องที่ต้องใช้ทนาย Merchie ช่วยเตรียมเอกสารให้คุณนำไปปรึกษาทนาย",
      "Merchie is not a law firm and does not represent you in legal cases. For matters that need a lawyer, Merchie prepares the documents for you to take to one.",
    ),
  },
  {
    heading: l("การเชื่อมแพลตฟอร์ม", "Platform connections"),
    body: l(
      "ใช้ API ทางการที่ร้านกดอนุญาตเท่านั้น ไม่ดึงข้อมูลด้วยวิธี scraping",
      "Official APIs you authorize only. No scraping.",
    ),
  },
];

export const FAQ: { q: L; a: L }[] = [
  {
    q: l("คะแนนสุขภาพร้านคิดยังไง", "How is the shop score worked out?"),
    a: l(
      "มาจาก 4 ส่วน ส่วนละ 25 คะแนน: กฎหมาย แพลตฟอร์ม ภาพลักษณ์ และธุรกิจ แตะที่คะแนนหน้าหลักเพื่อดูว่าหักเพราะอะไร",
      "Four parts worth 25 each: legal, platform, reputation and business. Tap the score on Home to see every deduction.",
    ),
  },
  {
    q: l("Merchie แก้ร้านให้เองเลยไหม", "Does Merchie change my shop by itself?"),
    a: l(
      "ไม่ Merchie ร่างให้ คุณเป็นคนกดยืนยันก่อนทุกครั้ง",
      "No. Merchie drafts; you confirm every change.",
    ),
  },
  {
    q: l("ยกเลิกแพ็กเกจได้ไหม", "Can I cancel my plan?"),
    a: l(
      "ได้ทุกเมื่อจากหน้าแพ็กเกจ ข้อมูลร้านยังอยู่ครบ",
      "Any time from the Plans screen. Your shop data stays.",
    ),
  },
  {
    q: l("ร้านโดนระงับ ต้องทำยังไง", "My shop was suspended. What now?"),
    a: l(
      "เปิด Shield แล้วเลือก \"ร้านโดนระงับ\" Merchie จะร่างเอกสารอุทธรณ์พร้อมแนบหลักฐานให้",
      "Open Shield and pick \"Shop suspended\". Merchie drafts the appeal with evidence attached.",
    ),
  },
];

export const LICENSES: { name: string; license: string }[] = [
  { name: "Next.js", license: "MIT" },
  { name: "React", license: "MIT" },
  { name: "Tailwind CSS", license: "MIT" },
  { name: "Motion", license: "MIT" },
  { name: "Vaul", license: "MIT" },
  { name: "Lucide", license: "ISC" },
  { name: "Anuphan", license: "SIL OFL 1.1" },
  { name: "Fredoka", license: "SIL OFL 1.1" },
  { name: "Simple Icons", license: "CC0 1.0" },
  { name: "Product photos (Pexels)", license: "Pexels License" },
];
