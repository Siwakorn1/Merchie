import type { CitationId } from "@/lib/legal/citations";
import type { Lang } from "@/lib/i18n-core";
import type { Health } from "@/lib/health/score";
import type { Issue } from "@/lib/content/issues";
import { vatUsage } from "@/lib/health/score";
import accountHealth from "@/mock/shopee/account_health.json";
import merchie from "@/mock/merchie/shop.json";

/**
 * Demo "brain" for the chat: keyword intents answered from the shop's own data.
 * No network, no model. When an AI provider is approved, swap `answer()` for a call
 * that is given the same context and must return the same shape (with citations).
 */
export type Reply = {
  text: string;
  cites?: CitationId[];
  /** shows the "not legal advice" line */
  legal?: boolean;
  action?: { label: string; href: string };
};

type Ctx = { lang: Lang; score: number; health: Health; openIssues: Issue[] };

const has = (q: string, words: string[]) => words.some((w) => q.includes(w));

export function answer(raw: string, ctx: Ctx): Reply {
  const q = raw.toLowerCase();
  const th = ctx.lang === "th";
  const t = (a: string, b: string) => (th ? a : b);
  const open = (id: string) => ctx.openIssues.some((i) => i.id === id);

  // Guardrail first: never help threaten, expose, or accuse a customer.
  if (
    has(q, [
      "ขู่", "ฟ้อง", "ด่า", "ประจาน", "แฉ", "เบอร์ลูกค้า", "ที่อยู่ลูกค้า",
      "ใช้ผิดวิธี", "ลูกค้าผิด", "โทษลูกค้า", "โกง", "มั่ว", "ใส่ร้าย",
      "threat", "sue", "expose", "shame", "dox", "blame", "accuse", "their fault", "used it wrong",
    ])
  ) {
    return {
      text: t(
        "อันนี้ Merchie ช่วยไม่ได้นะ การกล่าวหา ขู่ ประจาน หรือเปิดเผยข้อมูลลูกค้า เสี่ยงหมิ่นประมาทและโดนฟ้องกลับ ลองให้ Merchie ร่างคำตอบที่สุภาพและรักษาสิทธิของร้านแทนไหม",
        "I can't help with that. Accusing, threatening, shaming or exposing a customer risks defamation and can backfire legally. Want a polite reply that still protects your shop instead?",
      ),
      cites: ["defamation", "pdpa"],
      legal: true,
      action: { label: t("ร่างคำตอบที่ปลอดภัย", "Draft a safe reply"), href: "/fix-it?job=review-allergy" },
    };
  }

  if (has(q, ["โฆษณา", "listing", "ฝ้า", "ขาว", "เกินจริง", "claim", "ad ", "ads", "advert", "whiten"])) {
    return open("listing-claim")
      ? {
          text: t(
            "listing ครีมไวท์เทนนิ่งมีคำว่า “รักษาฝ้า” “หายถาวร” และ “ขาวใน 7 วัน” ซึ่งเป็นการอ้างผลรักษาและเกินจริง เครื่องสำอางอ้างแบบนี้ไม่ได้ Merchie เตรียมข้อความใหม่ไว้ให้แล้ว",
            "Your whitening cream listing says “treats melasma”, “gone for good” and “white in 7 days”. Those are treatment and exaggerated claims that cosmetics can't make. I've drafted a compliant version.",
          ),
          cites: ["cosmetic-ad", "consumer-ad"],
          legal: true,
          action: { label: t("ดูข้อความใหม่", "See the new text"), href: "/fix-it?job=listing-claim" },
        }
      : {
          text: t("listing แก้เรียบร้อยแล้ว ตอนนี้ไม่มีคำเสี่ยงเหลือ", "That listing is fixed. No risky claims left."),
        };
  }

  if (has(q, ["แพ้", "ผื่น", "รีวิว", "ตอบ", "allerg", "rash", "review", "reply", "refund", "คืนเงิน"])) {
    return {
      text: t(
        "ลูกค้าแจ้งแพ้ให้ทำ 4 อย่าง: ตอบรีวิวสั้น ๆ วันนี้แบบไม่โต้เถียง, ทักแชทส่วนตัวขอเลข lot และรูป, เสนอคืนเงินหรือรับคืน, แล้วเก็บแชทไว้เป็นหลักฐาน ห้ามบอกว่าลูกค้าใช้ผิดเอง",
        "For a reaction report: reply briefly today without arguing, message privately for the lot number and photos, offer a refund or return, and keep the chat as evidence. Never say the customer used it wrong.",
      ),
      cites: ["civil-defect", "unsafe-product"],
      legal: true,
      action: open("review-allergy")
        ? { label: t("ร่างคำตอบให้", "Draft the reply"), href: "/fix-it?job=review-allergy" }
        : undefined,
    };
  }

  if (has(q, ["แต้ม", "โทษ", "ระงับ", "ซ่อน", "penalt", "point", "suspend", "ban"])) {
    const pts = accountHealth.get_shop_penalty.response.penalty_points.overall_penalty_points;
    const next = accountHealth.penalty_tiers.find((x) => x.points > pts)!;
    return {
      text: t(
        `ตอนนี้มี ${pts} แต้ม อีก ${next.points - pts} แต้มจะโดน${next.punishment} แต้มส่วนใหญ่มาจาก listing ผิดกฎ แก้ listing ก่อนจะช่วยได้มากที่สุด`,
        `You have ${pts} points. ${next.points - pts} more means ${next.punishment_en}. Most come from listing violations, so fixing the listing helps most.`,
      ),
      cites: ["shopee-penalty"],
      action: { label: t("ไปที่ Shield", "Open Shield"), href: "/shield" },
    };
  }

  if (has(q, ["vat", "ภาษี", "tax", "1.8"])) {
    const pct = Math.round(vatUsage() * 100);
    const left = merchie.sales.vat_threshold - merchie.sales.ytd_revenue;
    return {
      text: t(
        `ยอดสะสมปีนี้ใช้ไป ${pct}% ของเพดาน 1.8 ล้าน เหลืออีก ${left.toLocaleString("th-TH")} บาท ถ้าเกินต้องจด VAT ภายใน 30 วัน`,
        `You're at ${pct}% of the THB 1.8M threshold, with ${left.toLocaleString("en-US")} left. Past it, you must register for VAT within 30 days.`,
      ),
      cites: ["vat"],
      legal: true,
    };
  }

  if (has(q, ["อย", "จดแจ้ง", "fda", "licen", "ใบอนุญาต", "ทะเบียน"])) {
    const fda = merchie.checklist.find((c) => c.id === "fda")!;
    return {
      text: t(
        `เลขจดแจ้ง ${fda.value} ใช้ได้ถึง มี.ค. 2570 แต่เซรั่มไฮยายังไม่ได้แสดงเลขในหน้าสินค้า ใส่ไว้ในรายละเอียดได้เลย`,
        `Your FDA number ${fda.value} is valid until Mar 2027, but the Hya serum listing doesn't show it yet. Add it to the description.`,
      ),
      cites: ["cosmetic-notify"],
      legal: true,
    };
  }

  if (has(q, ["อุทธรณ์", "appeal", "สู้", "หลักฐาน", "evidence"])) {
    return {
      text: t(
        "Merchie เก็บหลักฐานให้ทุกวัน ถ้าโดนระงับ กดสร้างเอกสารอุทธรณ์ใน Shield ได้เลย มีหลักฐานแนบให้ครบ ถ้าแพลตฟอร์มไม่ตอบใน 7 วัน ค่อยยกระดับไป ETDA",
        "I keep evidence every day. If you're suspended, draft an appeal in Shield with the evidence attached. If the platform doesn't reply in 7 days, escalate to ETDA.",
      ),
      cites: ["dps-decree"],
      legal: true,
      action: { label: t("ไปที่ Shield", "Open Shield"), href: "/shield" },
    };
  }

  if (has(q, ["คะแนน", "score", "ทำไม", "why", "health", "สุขภาพ"])) {
    const worst = [...ctx.health.parts].sort((a, b) => a.score - b.score)[0];
    return {
      text: t(
        `ตอนนี้ได้ ${ctx.score} คะแนน ส่วนที่ต่ำสุดคือ${worst.label.th} (${worst.score}/25) แก้ตรงนี้ก่อนจะขึ้นเร็วที่สุด`,
        `You're at ${ctx.score}. The weakest part is ${worst.label.en} (${worst.score}/25). Fixing that first lifts the score fastest.`,
      ),
    };
  }

  if (has(q, ["สวัสดี", "หวัดดี", "hello", "hi", "hey"])) {
    return {
      text: t(
        `สวัสดีค่ะ วันนี้ร้านได้ ${ctx.score} คะแนน อยากให้ช่วยเรื่องไหน`,
        `Hi! The shop is at ${ctx.score} today. What can I help with?`,
      ),
    };
  }

  return {
    text: t(
      "เรื่องนี้ Merchie ยังตอบไม่ได้ในเดโม ลองถามเรื่องคะแนน, listing, รีวิว, แต้มโทษ, VAT หรืออุทธรณ์ดูนะ",
      "I can't answer that in the demo yet. Try asking about your score, listings, reviews, penalty points, VAT or appeals.",
    ),
  };
}

export const suggestions = {
  th: ["ทำไมคะแนนต่ำ", "listing ผิดตรงไหน", "ลูกค้าแพ้ทำยังไง", "VAT ใกล้เพดานไหม"],
  en: ["Why is my score low?", "What's wrong with my listing?", "A customer had a reaction", "Am I near the VAT limit?"],
};
