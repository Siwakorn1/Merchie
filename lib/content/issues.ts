import products from "@/mock/shopee/products.json";
import comments from "@/mock/shopee/comments.json";
import type { CitationId } from "@/lib/legal/citations";
import type { Status } from "@/lib/health/status";
import type { PartId } from "@/lib/health/score";
import type { PlatformId } from "@/components/brand/platform-logo";
import { l, type L } from "@/lib/i18n-core";

export type ProductKind = "jar" | "dropper" | "tube";

export type Issue = {
  id: string;
  part: PartId;
  status: Status;
  title: L;
  /** product name, or a short fact for non-product issues */
  sub: L;
  product?: { id: number; kind: ProductKind };
  platform: PlatformId;
  /** non-product issues show a mini ring instead of a thumbnail */
  meter?: { value: number; max: number };
  /** what Merchie found, in one or two short sentences */
  detail: L;
  /** offending text (marketplace data, original language) with risky phrases to mark */
  quote?: { text: string; marks: string[] };
  steps?: L[];
  cites: CitationId[];
  fix?: { href: string; label: L };
  time: string;
  day: "today" | "earlier";
};

const KIND: Record<number, ProductKind> = { 2310045: "jar", 2310052: "dropper", 2310060: "tube" };

const item = (id: number) => products.response.item_list.find((i) => i.item_id === id)!;
const comment = (id: number) => comments.response.item_comment_list.find((c) => c.comment_id === id)!;
/** Product names are marketplace data: same text in both languages. */
const name = (id: number): L => l(item(id).item_name, item(id).item_name);

/** Ordered by urgency. Derived from mock Shopee data; copy is Merchie's. */
export const issues: Issue[] = [
  {
    id: "listing-claim",
    platform: "shopee",
    part: "legal",
    status: "danger",
    title: l("โฆษณาเกินจริง", "Overclaiming ad"),
    sub: name(2310045),
    product: { id: 2310045, kind: KIND[2310045] },
    detail: l(
      "คำว่า “รักษาฝ้า” และ “หายถาวร” เป็นการอ้างผลรักษา ซึ่งเครื่องสำอางอ้างไม่ได้",
      "“Treats melasma” and “gone for good” are treatment claims, which cosmetics can't make.",
    ),
    quote: { text: item(2310045).description, marks: ["ขาวใน 7 วัน", "รักษาฝ้า", "หายถาวร", "ปลอดภัย 100%"] },
    cites: ["cosmetic-ad", "consumer-ad", "shopee-prohibited"],
    fix: { href: "/fix-it?job=listing-claim", label: l("ให้ AI แก้ให้", "Fix with AI") },
    time: "08:02",
    day: "today",
  },
  {
    id: "review-allergy",
    platform: "shopee",
    part: "image",
    status: "danger",
    title: l("ลูกค้าแจ้งแพ้", "Allergy report"),
    sub: name(comment(88121).item_id),
    product: { id: 2310045, kind: KIND[2310045] },
    detail: l(
      "รีวิว 1 ดาว ยังไม่ได้ตอบ 14 ชม. ถ้าตอบผิดวิธีเสี่ยงลามเป็นดราม่า",
      "A 1-star review, unanswered for 14 hours. The wrong reply could turn into a public drama.",
    ),
    quote: { text: comment(88121).comment, marks: [] },
    steps: [
      l("ตอบรีวิวสาธารณะสั้น ๆ ภายในวันนี้ ไม่โต้เถียง", "Reply publicly today. Keep it short, don't argue"),
      l("ทักแชทส่วนตัว ขอเลข lot และรูปอาการ", "Message privately for the lot number and photos"),
      l("เสนอคืนเงินหรือรับคืนสินค้า", "Offer a refund or a return"),
      l("เก็บแชทและเลข lot ไว้เป็นหลักฐาน", "Keep the chat and lot number as evidence"),
    ],
    cites: ["civil-defect", "unsafe-product", "pdpa"],
    fix: { href: "/fix-it?job=review-allergy", label: l("ให้ AI ร่างคำตอบ", "Draft a reply with AI") },
    time: "07:41",
    day: "today",
  },
  {
    id: "listing-fda",
    platform: "shopee",
    part: "legal",
    status: "watch",
    title: l("ไม่แสดงเลขจดแจ้ง", "No FDA number shown"),
    sub: name(2310052),
    product: { id: 2310052, kind: KIND[2310052] },
    detail: l(
      "หน้าสินค้ายังไม่มีเลขจดแจ้ง อย. ใส่เลขในรายละเอียดสินค้าได้เลย",
      "The listing doesn't show its FDA notification number. Add it to the description.",
    ),
    cites: ["cosmetic-notify"],
    fix: { href: "/fix-it?job=listing-fda", label: l("ให้ AI แก้ให้", "Fix with AI") },
    time: "08:02",
    day: "today",
  },
  {
    id: "review-late",
    platform: "shopee",
    part: "image",
    status: "watch",
    title: l("รีวิว 2 ดาว ยังไม่ตอบ", "2-star review, no reply"),
    sub: name(comment(88117).item_id),
    product: { id: 2310060, kind: KIND[2310060] },
    detail: l(
      `“${comment(88117).comment}” ขอโทษเรื่องความล่าช้า และบอกสิ่งที่ร้านปรับแล้ว`,
      `“${comment(88117).comment}” Apologise for the delay and say what you've changed.`,
    ),
    cites: [],
    fix: { href: "/fix-it?job=review-late", label: l("ให้ AI ร่างคำตอบ", "Draft a reply with AI") },
    time: "เมื่อวาน",
    day: "earlier",
  },
];
