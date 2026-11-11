import type { CitationId } from "@/lib/legal/citations";
import { l, type L } from "@/lib/i18n-core";

/**
 * "Something went wrong" cases Shield can help with. Each one gives a ready document, the
 * evidence Merchie already keeps, and what to do next. Merchie prepares documents only;
 * it never represents the shop.
 */
export type HelpCase = {
  id: "suspended" | "complaint" | "trademark" | "payout";
  title: L;
  sub: L;
  /** draft document (bilingual so judges can read either) */
  draft?: L;
  evidence: L[];
  steps: L[];
  cites: CitationId[];
};

export const helpCases: HelpCase[] = [
  {
    id: "suspended",
    title: l("ร้านโดนระงับหรือซ่อนสินค้า", "Shop or listings suspended"),
    sub: l("ร่างเอกสารอุทธรณ์พร้อมหลักฐาน", "Appeal letter with evidence"),
    evidence: [],
    steps: [],
    cites: ["shopee-penalty", "dps-decree"],
  },
  {
    id: "complaint",
    title: l("ลูกค้าร้องเรียน หรือแจ้ง สคบ.", "Customer complaint"),
    sub: l("หนังสือชี้แจงและข้อเสนอเยียวยา", "Response letter and remedy offer"),
    draft: l(
      "ร้านใสใส สกินแคร์ได้รับเรื่องร้องเรียนเกี่ยวกับครีมไวท์เทนนิ่ง ใสใส 30 ml แล้ว ร้านได้ติดต่อลูกค้าเพื่อขอข้อมูล lot และเสนอคืนเงินเต็มจำนวน พร้อมส่งสินค้า lot ดังกล่าวตรวจสอบกับผู้ผลิต ร้านพร้อมให้ข้อมูลเพิ่มเติมและดำเนินการตามที่สำนักงานเห็นสมควร",
      "ใสใส สกินแคร์ has received the complaint about its whitening cream (30 ml). We contacted the customer for the lot number, offered a full refund, and sent the lot for testing with the manufacturer. We will provide any further information the office needs.",
    ),
    evidence: [
      l("แชทกับลูกค้าและข้อเสนอคืนเงิน", "Chat with the customer and the refund offer"),
      l("เลข lot และใบรับรองจากผู้ผลิต", "Lot number and manufacturer certificate"),
      l("ใบรับจดแจ้ง อย.", "FDA notification certificate"),
    ],
    steps: [
      l("ตอบลูกค้าภายใน 24 ชม. เสนอคืนเงินหรือคืนสินค้า", "Reply within 24h and offer a refund or return"),
      l("ส่งหนังสือชี้แจงพร้อมหลักฐาน ถ้า สคบ. ติดต่อมา", "Send the response with evidence if OCPB contacts you"),
      l("เก็บผลตรวจ lot ไว้ใน Vault", "Save the lot test result to the Vault"),
    ],
    cites: ["civil-defect", "unsafe-product", "consumer-ad"],
  },
  {
    id: "trademark",
    title: l("ถูกแจ้งว่าละเมิดเครื่องหมายการค้า", "Trademark or counterfeit claim"),
    sub: l("หนังสือโต้แย้งพร้อมหลักฐานที่มาสินค้า", "Counter-notice with proof of origin"),
    draft: l(
      "ร้านใสใส สกินแคร์ขอโต้แย้งการแจ้งว่าสินค้าละเมิดเครื่องหมายการค้า สินค้าทุกชิ้นเป็นแบรนด์ของร้านเอง ผลิตโดยโรงงานที่ได้รับอนุญาต และมีเลขจดแจ้ง อย. ถูกต้อง ร้านแนบหลักฐานที่มาของสินค้ามาพร้อมนี้ และขอให้พิจารณาคืนสถานะ listing",
      "ใสใส สกินแคร์ disputes the trademark claim. Every item is our own brand, made by a licensed manufacturer, with a valid FDA notification number. Proof of origin is attached; please restore the listing.",
    ),
    evidence: [
      l("สัญญาจ้างผลิตและใบแจ้งหนี้จากโรงงาน", "Manufacturing contract and invoices"),
      l("ใบรับจดแจ้ง อย.", "FDA notification certificate"),
      l("ภาพสินค้าและบรรจุภัณฑ์จริง", "Photos of the product and packaging"),
    ],
    steps: [
      l("ยื่นโต้แย้งในแพลตฟอร์มภายในเวลาที่กำหนด", "File the counter-notice on the platform in time"),
      l("แนบหลักฐานที่มาสินค้าให้ครบ", "Attach full proof of origin"),
      l("ถ้าผู้แจ้งยืนยัน ปรึกษาทนายก่อนตอบ", "If the claimant insists, talk to a lawyer before replying"),
    ],
    cites: ["trademark", "shopee-prohibited"],
  },
  {
    id: "payout",
    title: l("แพลตฟอร์มกักเงิน หรือไม่โอนเงิน", "Payout held"),
    sub: l("หนังสือร้องเรียนแพลตฟอร์มและ ETDA", "Complaint to the platform and ETDA"),
    draft: l(
      "ร้านใสใส สกินแคร์ยังไม่ได้รับเงินจากคำสั่งซื้อที่จัดส่งสำเร็จแล้ว ขอให้แพลตฟอร์มแจ้งเหตุผลการกักเงินและกำหนดวันโอน ตามหน้าที่ของผู้ให้บริการแพลตฟอร์มดิจิทัล ร้านแนบรายการคำสั่งซื้อและหลักฐานการจัดส่งมาพร้อมนี้",
      "ใสใส สกินแคร์ has not been paid for orders that were delivered. Please explain why the payout is held and when it will be released, as a digital platform operator is required to. The order list and proof of delivery are attached.",
    ),
    evidence: [
      l("รายการคำสั่งซื้อที่ยังไม่ได้รับเงิน", "Orders still unpaid"),
      l("หลักฐานการจัดส่งและเลขพัสดุ", "Proof of delivery and tracking numbers"),
      l("ประวัติแต้มโทษและคะแนนร้าน", "Penalty and shop-health history"),
    ],
    steps: [
      l("ส่งเรื่องในศูนย์ช่วยเหลือผู้ขายของแพลตฟอร์ม", "Raise it in the platform's seller support"),
      l("ถ้าไม่ได้คำตอบใน 7 วัน ร้องเรียน ETDA สายด่วน 1212", "No answer in 7 days: complain to ETDA, hotline 1212"),
    ],
    cites: ["dps-decree"],
  },
];
