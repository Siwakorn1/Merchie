import type { CitationId } from "@/lib/legal/citations";
import type { ProductKind } from "@/lib/content/issues";
import { l, type L } from "@/lib/i18n-core";
import products from "@/mock/shopee/products.json";
import comments from "@/mock/shopee/comments.json";
import merchie from "@/mock/merchie/shop.json";

/**
 * One Fix-it job per issue (keyed by issue id). Pre-written "AI" output for the demo: when an
 * AI provider is approved, these become model responses validated against the same shape.
 *
 * Listing copy and replies are for Thai buyers, so they stay Thai in both UI languages;
 * only Merchie's explanations ("why") are translated.
 */

export type ListingChange = { kind: "remove" | "add"; text: string; why: L; cite: CitationId };
export type Removed = { text: string; why: L; cite?: CitationId };

export type ListingJob = {
  kind: "listing";
  issueId: string;
  product: ProductKind;
  name: string;
  price: number;
  sold: number;
  rating: number;
  before: string;
  risky: string[];
  after: string;
  added: string[];
  changes: ListingChange[];
};

export type ReplyJob = {
  kind: "reply";
  issueId: string;
  product: ProductKind;
  buyer: string;
  stars: number;
  variation: string;
  date: L;
  text: string;
  /** what an upset owner might type first */
  ownerDraft: string;
  /** sentences the guardrail removed, and why */
  removed: Removed[];
  reply: string;
};

export type Job = ListingJob | ReplyJob;

const item = (id: number) => products.response.item_list.find((i) => i.item_id === id)!;
const comment = (id: number) => comments.response.item_comment_list.find((c) => c.comment_id === id)!;
const fda = merchie.checklist.find((c) => c.id === "fda")!.value;
const rating = comments.summary_30d.avg_star;

const cream = item(2310045);
const serum = item(2310052);
const allergy = comment(88121);
const late = comment(88117);

export const jobs: Record<string, Job> = {
  "listing-claim": {
    kind: "listing",
    issueId: "listing-claim",
    product: "jar",
    name: cream.item_name,
    price: cream.price_info[0].current_price,
    sold: cream.sales,
    rating,
    before: cream.description,
    risky: ["ขาวใน 7 วัน", "รักษาฝ้า", "หายถาวร", "ปลอดภัย 100%"],
    after: `ช่วยให้ผิวดูกระจ่างใส ชุ่มชื้น เมื่อใช้อย่างต่อเนื่อง ผ่านการทดสอบการระคายเคืองเบื้องต้น เลขจดแจ้ง ${fda}`,
    added: ["ดูกระจ่างใส", "เมื่อใช้อย่างต่อเนื่อง", "ผ่านการทดสอบการระคายเคืองเบื้องต้น", `เลขจดแจ้ง ${fda}`],
    changes: [
      { kind: "remove", text: "ขาวใน 7 วัน", why: l("ระบุผลและเวลาที่พิสูจน์ไม่ได้", "Promises a result and timeline it can't prove"), cite: "consumer-ad" },
      { kind: "remove", text: "รักษาฝ้า กระ", why: l("เครื่องสำอางอ้างผลรักษาไม่ได้", "Cosmetics can't claim to treat"), cite: "cosmetic-ad" },
      { kind: "remove", text: "หายถาวร", why: l("เกินจริง", "Exaggerated"), cite: "consumer-ad" },
      { kind: "remove", text: "ปลอดภัย 100%", why: l("รับรองเกินจริง", "Overpromises safety"), cite: "consumer-ad" },
    ],
  },

  "listing-fda": {
    kind: "listing",
    issueId: "listing-fda",
    product: "dropper",
    name: serum.item_name,
    price: serum.price_info[0].current_price,
    sold: serum.sales,
    rating,
    before: serum.description,
    risky: [],
    after: `${serum.description} เลขจดแจ้ง ${fda}`,
    added: [`เลขจดแจ้ง ${fda}`],
    changes: [
      {
        kind: "add",
        text: `เลขจดแจ้ง ${fda}`,
        why: l("ผู้ซื้อต้องเห็นเลขจดแจ้งก่อนซื้อ", "Buyers must see the notification number before buying"),
        cite: "cosmetic-notify",
      },
    ],
  },

  "review-allergy": {
    kind: "reply",
    issueId: "review-allergy",
    product: "jar",
    buyer: allergy.buyer_username,
    stars: allergy.rating_star,
    variation: "30 ml",
    date: l("10 พ.ย. 2569", "Nov 10, 2026"),
    text: allergy.comment,
    ownerDraft:
      "สินค้าเราขายมา 2 ปีไม่เคยมีใครแพ้ ลูกค้าน่าจะใช้ผิดวิธีเองค่ะ คุณปวีณาสั่งไปวันที่ 9 ส่งถึงลาดพร้าวซอย 64 ร้านตรวจแล้วไม่ใช่ความผิดร้าน",
    removed: [
      { text: "ลูกค้าน่าจะใช้ผิดวิธีเองค่ะ", why: l("กล่าวหาลูกค้าต่อสาธารณะ", "Publicly blames the customer"), cite: "defamation" },
      { text: "คุณปวีณาสั่งไปวันที่ 9 ส่งถึงลาดพร้าวซอย 64", why: l("เปิดเผยข้อมูลลูกค้า", "Exposes customer data"), cite: "pdpa" },
      { text: "ร้านตรวจแล้วไม่ใช่ความผิดร้าน", why: l("ปฏิเสธสิทธิของลูกค้า", "Denies the customer's rights"), cite: "civil-defect" },
      { text: "สินค้าเราขายมา 2 ปีไม่เคยมีใครแพ้", why: l("ปัดความรับผิดก่อนตรวจสอบ", "Dismisses liability before checking"), cite: "unsafe-product" },
    ],
    reply:
      "ขอโทษจริง ๆ ค่ะที่ใช้แล้วเกิดอาการระคายเคือง แนะนำให้หยุดใช้และปรึกษาแพทย์ก่อนนะคะ ร้านอยากดูแลเรื่องนี้ให้เต็มที่ รบกวนทักแชทร้านพร้อมเลข lot ข้างกล่อง ร้านยินดีคืนเงินหรือรับคืนสินค้าให้ค่ะ",
  },

  "review-late": {
    kind: "reply",
    issueId: "review-late",
    product: "tube",
    buyer: late.buyer_username,
    stars: late.rating_star,
    variation: "SPF50",
    date: l("5 พ.ย. 2569", "Nov 5, 2026"),
    text: late.comment,
    ownerDraft: "ช่วงนี้ขนส่งช้าทุกเจ้าค่ะ ไม่ใช่ความผิดร้าน ถ้ารอไม่ได้ครั้งหน้าก็ไม่ต้องสั่งนะคะ",
    removed: [
      { text: "ไม่ใช่ความผิดร้าน", why: l("ปัดความรับผิดชอบ", "Shifts the blame") },
      { text: "ถ้ารอไม่ได้ครั้งหน้าก็ไม่ต้องสั่งนะคะ", why: l("ประชดลูกค้า เสี่ยงลามเป็นดราม่า", "Snaps at the customer; risks a public drama") },
    ],
    reply:
      "ขอโทษที่ของไปถึงช้านะคะ ร้านเปลี่ยนมาใช้ขนส่งที่เร็วขึ้นแล้ว จากนี้จะจัดส่งภายใน 24 ชม. ค่ะ ขอบคุณที่อดทนรอและให้โอกาสร้านนะคะ",
  },
};

/** Old links used ?job=listing / ?job=reply. */
export const JOB_ALIASES: Record<string, string> = { listing: "listing-claim", reply: "review-allergy" };
