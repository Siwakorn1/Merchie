import { l, type L } from "@/lib/i18n-core";

/**
 * Every legal flag or suggestion must cite one of these (enforced by the CitationId type).
 *
 * `review: true` marks a section number that a lawyer on the team must still confirm
 * before the pitch. The law itself is correct; the exact section is the uncertain part.
 */
export type Citation = {
  law: L;
  section?: L;
  gist: L;
  review?: boolean;
};

export const citations = {
  "cosmetic-ad": {
    law: l("พ.ร.บ.เครื่องสำอาง พ.ศ. 2558", "Cosmetics Act B.E. 2558"),
    section: l("ม.32", "s.32"),
    gist: l(
      "ห้ามโฆษณาเกินจริง หรืออ้างว่ารักษา บำบัด หรือป้องกันโรค",
      "No exaggerated claims, and no claims to treat, cure or prevent disease",
    ),
    review: true,
  },
  "cosmetic-notify": {
    law: l("พ.ร.บ.เครื่องสำอาง พ.ศ. 2558", "Cosmetics Act B.E. 2558"),
    section: l("ม.14", "s.14"),
    gist: l(
      "เครื่องสำอางต้องจดแจ้งก่อนขาย และแสดงเลขจดแจ้งให้ผู้ซื้อเห็น",
      "Cosmetics must be notified before sale, with the notification number shown to buyers",
    ),
    review: true,
  },
  "consumer-ad": {
    law: l("พ.ร.บ.คุ้มครองผู้บริโภค พ.ศ. 2522", "Consumer Protection Act B.E. 2522"),
    section: l("ม.22", "s.22"),
    gist: l("โฆษณาต้องไม่ใช้ข้อความที่เป็นเท็จหรือเกินความจริง", "Ads must not be false or exaggerated"),
  },
  "civil-defect": {
    law: l("ประมวลกฎหมายแพ่งและพาณิชย์", "Civil and Commercial Code"),
    section: l("ม.472", "s.472"),
    gist: l("ผู้ขายต้องรับผิดในความชำรุดบกพร่องของสินค้า", "Sellers are liable for defects in what they sell"),
  },
  "unsafe-product": {
    law: l(
      "พ.ร.บ.ความรับผิดต่อความเสียหายที่เกิดขึ้นจากสินค้าที่ไม่ปลอดภัย พ.ศ. 2551",
      "Unsafe Products Liability Act B.E. 2551",
    ),
    gist: l(
      "ผู้ขายอาจต้องรับผิดเมื่อสินค้าทำให้ผู้บริโภคเสียหาย",
      "Sellers may be liable when a product harms a consumer",
    ),
  },
  defamation: {
    law: l("ประมวลกฎหมายอาญา", "Criminal Code"),
    section: l("ม.326, ม.328", "ss.326, 328"),
    gist: l(
      "กล่าวหาลูกค้าต่อสาธารณะอาจเป็นหมิ่นประมาท และโทษหนักขึ้นเมื่อโพสต์ออนไลน์",
      "Publicly accusing a customer can be defamation, with heavier penalties online",
    ),
  },
  pdpa: {
    law: l("พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562", "Personal Data Protection Act B.E. 2562"),
    section: l("ม.27", "s.27"),
    gist: l(
      "ห้ามเปิดเผยข้อมูลส่วนบุคคลของลูกค้าโดยไม่ได้รับความยินยอม",
      "Don't disclose a customer's personal data without consent",
    ),
  },
  vat: {
    law: l("ประมวลรัษฎากร", "Revenue Code"),
    section: l("ม.85/1", "s.85/1"),
    gist: l(
      "รายรับเกิน 1.8 ล้านบาทต่อปี ต้องจดทะเบียนภาษีมูลค่าเพิ่ม",
      "Register for VAT once yearly revenue passes THB 1.8M",
    ),
  },
  "income-408": {
    law: l("ประมวลรัษฎากร", "Revenue Code"),
    section: l("ม.40(8)", "s.40(8)"),
    gist: l(
      "รายได้จากการขายของออนไลน์เป็นเงินได้ประเภท 40(8) หักค่าใช้จ่ายเหมาได้ 60% หรือหักตามจริง",
      "Online selling income is s.40(8) income: deduct a flat 60% or actual expenses",
    ),
    review: true,
  },
  "pit-rates": {
    law: l("ประมวลรัษฎากร", "Revenue Code"),
    section: l("ม.48", "s.48"),
    gist: l("ภาษีเงินได้บุคคลธรรมดาเก็บแบบขั้นบันได 0–35%", "Personal income tax is progressive, 0–35%"),
  },
  "pit-filing": {
    law: l("ประมวลรัษฎากร", "Revenue Code"),
    section: l("ม.56, ม.56 ทวิ", "ss.56, 56 bis"),
    gist: l(
      "ยื่น ภ.ง.ด.90 ภายในมีนาคมของปีถัดไป และ ภ.ง.ด.94 สำหรับเงินได้ครึ่งปีแรกภายในกันยายน",
      "File PND 90 by March of the following year, and PND 94 for the first half by September",
    ),
    review: true,
  },
  "food-reg": {
    law: l("พ.ร.บ.อาหาร พ.ศ. 2522", "Food Act B.E. 2522"),
    section: l("ม.31", "s.31"),
    gist: l(
      "อาหารควบคุมเฉพาะและอาหารเสริมต้องขึ้นทะเบียน และแสดงเลขสารบบอาหารบนฉลาก",
      "Specially controlled foods and supplements must be registered, with the food serial number on the label",
    ),
    review: true,
  },
  tis: {
    law: l("พ.ร.บ.มาตรฐานผลิตภัณฑ์อุตสาหกรรม พ.ศ. 2511", "Industrial Product Standards Act B.E. 2511"),
    section: l("ม.20", "s.20"),
    gist: l(
      "สินค้าที่อยู่ในมาตรฐานบังคับต้องได้ มอก. และแสดงเครื่องหมายก่อนขาย",
      "Products under a mandatory standard need TIS certification and the mark before sale",
    ),
    review: true,
  },
  trademark: {
    law: l("พ.ร.บ.เครื่องหมายการค้า พ.ศ. 2534", "Trademark Act B.E. 2534"),
    section: l("ม.110", "s.110"),
    gist: l(
      "การขายสินค้าที่ใช้เครื่องหมายปลอมเป็นความผิด ผู้ขายของแท้ควรมีหลักฐานที่มาของสินค้า",
      "Selling goods under a forged mark is an offence; sellers of genuine goods should keep proof of origin",
    ),
  },
  "commercial-reg": {
    law: l("พ.ร.บ.ทะเบียนพาณิชย์ พ.ศ. 2499", "Commercial Registration Act B.E. 2499"),
    section: l("ม.11", "s.11"),
    gist: l(
      "ร้านค้าออนไลน์ต้องจดทะเบียนพาณิชย์อิเล็กทรอนิกส์",
      "Online shops must hold an e-commerce registration",
    ),
    review: true,
  },
  "shopee-prohibited": {
    law: l("นโยบาย Shopee", "Shopee policy"),
    section: l("สินค้าต้องห้ามและข้อความโฆษณาที่ไม่อนุญาต", "Prohibited items and ad claims"),
    gist: l(
      "listing ที่อ้างสรรพคุณทางการแพทย์อาจถูกลบและได้แต้มโทษ",
      "Listings with medical claims can be removed and earn penalty points",
    ),
  },
  "shopee-penalty": {
    law: l("นโยบาย Shopee", "Shopee policy"),
    section: l("ระบบคะแนนโทษ (Penalty Points)", "Penalty Points"),
    gist: l(
      "แต้มโทษสะสมถึงเกณฑ์จะถูกลดการมองเห็น ตัดสิทธิ์แคมเปญ หรือระงับร้าน",
      "Points past each tier mean less visibility, no campaigns, or a suspended shop",
    ),
  },
  "dps-decree": {
    law: l("พ.ร.ฎ.ธุรกิจบริการแพลตฟอร์มดิจิทัล พ.ศ. 2565", "Royal Decree on Digital Platform Services B.E. 2565"),
    gist: l(
      "แพลตฟอร์มต้องแจ้งเหตุผลและเปิดช่องทางโต้แย้งเมื่อจำกัดบัญชีผู้ขาย",
      "Platforms must give reasons and a way to dispute when restricting a seller",
    ),
    review: true,
  },
} satisfies Record<string, Citation>;

export type CitationId = keyof typeof citations;

export function cite(id: CitationId): Citation {
  return citations[id];
}
