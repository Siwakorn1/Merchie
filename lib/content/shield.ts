import type { CitationId } from "@/lib/legal/citations";
import { l, type L } from "@/lib/i18n-core";

/** Evidence Vault: what Merchie snapshots automatically every day. */
export type VaultEntry = {
  time: string;
  title: L;
  sub: L;
  score?: number;
};

/** `date` is Buddhist-era ISO, used for export ranges. */
export const vault: { day: L; date: string; entries: VaultEntry[] }[] = [
  {
    day: l("วันนี้", "Today"),
    date: "2569-11-11",
    entries: [
      {
        time: "08:00",
        title: l("คะแนนประจำวัน", "Daily score"),
        sub: l("บันทึกคะแนน 4 ส่วน และแต้มโทษ 8 แต้ม", "4-part score and 8 penalty points saved"),
        score: 59,
      },
      {
        time: "07:41",
        title: l("รีวิว 1 ดาว", "1-star review"),
        sub: l("เก็บภาพรีวิวและเลขคำสั่งซื้อแล้ว", "Review screenshot and order number saved"),
      },
    ],
  },
  {
    day: l("เมื่อวาน", "Yesterday"),
    date: "2569-11-10",
    entries: [
      {
        time: "20:15",
        title: l("ส่งของครบ 46 ออเดอร์", "All 46 orders shipped"),
        sub: l("เก็บเลขพัสดุและเวลาส่ง", "Tracking numbers and ship times saved"),
      },
      { time: "08:00", title: l("คะแนนประจำวัน", "Daily score"), sub: l("บันทึกคะแนน 4 ส่วน", "4-part score saved"), score: 66 },
    ],
  },
  {
    day: l("8 พ.ย.", "Nov 8"),
    date: "2569-11-08",
    entries: [
      {
        time: "14:20",
        title: l("ยืนยันเลขจดแจ้ง อย.", "FDA number verified"),
        sub: l("10-1-6600012345 ใช้ได้ถึง มี.ค. 70", "10-1-6600012345, valid to Mar 2027"),
      },
      { time: "08:00", title: l("คะแนนประจำวัน", "Daily score"), sub: l("บันทึกคะแนน 4 ส่วน", "4-part score saved"), score: 71 },
    ],
  },
];

export const vaultStats = { days: 92, items: 418 };

/** The suspension in the demo story, and the appeal Merchie drafts for it. */
export const incident = {
  title: l("Shopee ซ่อนสินค้าทั้งหมด", "Shopee hid all listings"),
  sub: l("7 วัน เพราะแต้มโทษครบ 9", "7 days, after reaching 9 penalty points"),
};

export const appeal = {
  to: l("ทีมดูแลผู้ขาย Shopee", "Shopee Seller Support"),
  subject: l("ขออุทธรณ์การซ่อนสินค้า ร้านใสใส สกินแคร์", "Appeal of listing suspension, ใสใส สกินแคร์"),
  greeting: l("เรียน", "Dear"),
  subjectLabel: l("เรื่อง", "Re:"),
  body: [
    l(
      "ร้านใสใส สกินแคร์ ขออุทธรณ์การซ่อนสินค้าเมื่อวันที่ 11 พ.ย. 2569 ซึ่งมีสาเหตุจากข้อความโฆษณาใน listing ครีมไวท์เทนนิ่ง ใสใส 30 ml",
      "We are appealing the suspension of our listings on 11 Nov 2026, caused by the ad wording in our listing “ครีมไวท์เทนนิ่ง ใสใส 30 ml”.",
    ),
    l(
      "ร้านได้แก้ไขข้อความดังกล่าวแล้วเมื่อวันที่ 11 พ.ย. 2569 เวลา 09:14 น. โดยนำคำที่อ้างผลรักษาออกทั้งหมด และเพิ่มเลขจดแจ้ง อย. 10-1-6600012345",
      "We corrected the listing on 11 Nov 2026 at 09:14, removing every treatment claim and adding FDA notification no. 10-1-6600012345.",
    ),
    l(
      "ร้านมีประวัติการส่งสินค้าตรงเวลาและตอบลูกค้าต่อเนื่องตลอด 92 วันที่ผ่านมา ตามหลักฐานที่แนบ จึงขอให้พิจารณาคืนสถานะการแสดงสินค้า",
      "Our attached records show on-time shipping and consistent customer replies over the past 92 days. We respectfully ask that our listings be restored.",
    ),
  ],
  evidence: [
    l("ภาพ listing ก่อนและหลังแก้ไข พร้อมเวลา", "Listing before and after, time-stamped"),
    l("ใบรับจดแจ้ง อย.", "FDA notification certificate"),
    l("ประวัติคะแนนร้าน 92 วัน", "92 days of shop health history"),
    l("ประวัติการส่งของและการตอบแชท", "Shipping and chat response history"),
  ],
  cites: ["shopee-penalty", "dps-decree"] satisfies CitationId[],
};

/** Escalation ladder from the brief. We prepare documents; we never act as counsel. */
export const ladder = [
  { title: l("อุทธรณ์ในแพลตฟอร์ม", "Appeal on the platform"), sub: l("Merchie ร่างเอกสารให้", "Merchie drafts it for you") },
  { title: l("ETDA สายด่วน 1212", "ETDA hotline 1212"), sub: l("ถ้าแพลตฟอร์มไม่ตอบใน 7 วัน", "If the platform doesn't reply in 7 days") },
  { title: l("สคบ.", "OCPB"), sub: l("ถ้าเป็นข้อพิพาทกับผู้บริโภค", "For disputes with consumers") },
  { title: l("ทนายความ", "A lawyer"), sub: l("Merchie เตรียมเอกสารให้", "Merchie prepares the documents") },
];
