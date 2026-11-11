import accountHealth from "@/mock/shopee/account_health.json";
import comments from "@/mock/shopee/comments.json";
import merchie from "@/mock/merchie/shop.json";
import type { CitationId } from "@/lib/legal/citations";
import { l, type L } from "@/lib/i18n-core";

export type PartId = "legal" | "platform" | "image" | "business";

export type Factor = {
  label: L;
  /** points added (+) or deducted (−) */
  delta: number;
  cite?: CitationId;
};

export type Part = {
  id: PartId;
  label: L;
  /** out of PART_MAX (25); the four parts add up to the total out of 100 */
  score: number;
  factors: Factor[];
};

export type Health = {
  score: number;
  parts: Part[];
};

/** Each part is worth 25, so the total is simply their sum: easy to read, easy to check. */
export const PART_MAX = 25;
const LABELS: Record<PartId, L> = {
  legal: l("กฎหมาย", "Legal"),
  platform: l("แพลตฟอร์ม", "Platform"),
  image: l("ภาพลักษณ์", "Reputation"),
  business: l("ธุรกิจ", "Business"),
};
const LISTING_RULES: Record<string, Factor> = {
  prohibited_claim: { label: l("โฆษณาอ้างผลรักษา", "Ad claims a treatment"), delta: -10, cite: "cosmetic-ad" },
  missing_registration_number: {
    label: l("ไม่แสดงเลขจดแจ้ง", "No FDA number shown"),
    delta: -4,
    cite: "cosmetic-notify",
  },
};

function part(id: PartId, factors: Factor[]): Part {
  const raw = PART_MAX + factors.reduce((s, f) => s + f.delta, 0);
  return { id, label: LABELS[id], score: Math.max(0, Math.min(PART_MAX, raw)), factors };
}

export function vatUsage() {
  const { ytd_revenue, vat_threshold } = merchie.sales;
  return ytd_revenue / vat_threshold;
}

/** Which issue (lib/content/issues.ts) clears which source record once it's fixed. */
const RESOLVES: Record<string, { listing?: number; comment?: number }> = {
  "listing-claim": { listing: 2310045 },
  "listing-fda": { listing: 2310052 },
  "review-allergy": { comment: 88121 },
  "review-late": { comment: 88117 },
};

export function computeHealth(resolved: readonly string[] = []): Health {
  const fixedListings = new Set(resolved.map((r) => RESOLVES[r]?.listing).filter(Boolean));
  const repliedComments = new Set(resolved.map((r) => RESOLVES[r]?.comment).filter(Boolean));

  // ---- Legal: listing issues + checklist gaps ----
  const legal: Factor[] = accountHealth.get_listings_with_issues.response.listing_list
    .filter((x) => !fixedListings.has(x.item_id))
    .map((x) => LISTING_RULES[x.reason])
    .filter(Boolean);
  for (const c of merchie.checklist) {
    if (c.status === "missing")
      legal.push({ label: l(`ยังไม่มี${c.label}`, `Missing: ${c.label_en}`), delta: -5, cite: c.cite as CitationId });
    if (c.status === "watch")
      legal.push({ label: l(`${c.label}ใกล้เกณฑ์`, `${c.label_en} near threshold`), delta: -1, cite: c.cite as CitationId });
  }

  // ---- Platform: penalty points + metrics below Shopee targets ----
  const points = accountHealth.get_shop_penalty.response.penalty_points.overall_penalty_points;
  const platform: Factor[] = [];
  if (points > 0) platform.push({ label: l(`แต้มโทษ ${points} แต้ม`, `${points} penalty points`), delta: -points, cite: "shopee-penalty" });
  for (const m of accountHealth.shop_performance.response.metric_list) {
    const ok = m.target.comparator === "<" ? m.current_period < m.target.value : m.current_period >= m.target.value;
    if (!ok && m.metric_name === "chat_response_rate") {
      platform.push({
        label: l(
          `ตอบแชท ${m.current_period}% (เกณฑ์ ${m.target.value}%)`,
          `Chat response ${m.current_period}% (target ${m.target.value}%)`,
        ),
        delta: -2,
      });
    }
  }

  // ---- Image: unanswered bad reviews + negative share ----
  const image: Factor[] = [];
  for (const c of comments.response.item_comment_list) {
    if (c.comment_reply || repliedComments.has(c.comment_id)) continue;
    if (c.rating_star === 1) image.push({ label: l("รีวิว 1 ดาวที่ยังไม่ตอบ", "Unanswered 1-star review"), delta: -7 });
    else if (c.rating_star === 2) image.push({ label: l("รีวิว 2 ดาวที่ยังไม่ตอบ", "Unanswered 2-star review"), delta: -3 });
  }
  const { total, negative } = comments.summary_30d;
  const negShare = negative / total;
  if (negShare > 0.1) image.push({
      label: l(`รีวิวลบ ${Math.round(negShare * 100)}% ใน 30 วัน`, `${Math.round(negShare * 100)}% negative reviews in 30 days`),
      delta: -2,
    });

  // ---- Business: growth + VAT ceiling ----
  const { this_month, last_month } = merchie.sales;
  const growth = (this_month - last_month) / last_month;
  const business: Factor[] = [
    {
      label: l(
        `ยอดขาย${growth >= 0 ? "โต" : "ลด"} ${Math.abs(Math.round(growth * 100))}%`,
        `Sales ${growth >= 0 ? "up" : "down"} ${Math.abs(Math.round(growth * 100))}%`,
      ),
      delta: growth >= 0 ? 0 : -3,
    },
  ];
  const usage = vatUsage();
  if (usage >= 0.8) business.push({
      label: l(`ยอดสะสม ${Math.round(usage * 100)}% ของเพดาน VAT`, `Revenue at ${Math.round(usage * 100)}% of the VAT threshold`),
      delta: -4,
      cite: "vat",
    });

  const parts = [part("legal", legal), part("platform", platform), part("image", image), part("business", business)];
  const score = parts.reduce((sum, p) => sum + p.score, 0);

  return { score, parts };
}

/**
 * Split a total (e.g. the demo slider's score) across the four parts so they add up to it
 * exactly, each 0–25. Points are taken away where the real shop is losing them: each part's
 * missing points scale with the target, so 100 fills every part and 0 empties them all.
 */
export function partsForScore(parts: Part[], target: number): Part[] {
  const total = Math.max(0, Math.min(PART_MAX * parts.length, Math.round(target)));
  const real = parts.reduce((s, p) => s + p.score, 0);
  if (total === real) return parts;

  const missingTarget = PART_MAX * parts.length - total;
  const weights = parts.map((p) => PART_MAX - p.score);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  // share of the missing points per part, capped at 25 (water-filling: overflow moves on)
  const share = parts.map(() => 0);
  let left = missingTarget;
  let open = parts.map((_, i) => i);
  while (left > 1e-9 && open.length) {
    const w = open.map((i) => (weightSum > 0 ? weights[i] || 0.0001 : 1));
    const ws = w.reduce((a, b) => a + b, 0);
    let spilled = 0;
    open.forEach((i, k) => {
      const add = (left * w[k]) / ws;
      const room = PART_MAX - share[i];
      share[i] += Math.min(add, room);
      spilled += Math.max(0, add - room);
    });
    left = spilled;
    open = open.filter((i) => share[i] < PART_MAX - 1e-9);
  }
  // round so the integers still add up exactly (largest remainder)
  const floor = share.map(Math.floor);
  let rest = missingTarget - floor.reduce((a, b) => a + b, 0);
  share
    .map((v, i) => ({ i, r: v - Math.floor(v) }))
    .sort((a, b) => b.r - a.r)
    .forEach(({ i }) => {
      if (rest > 0 && floor[i] < PART_MAX) {
        floor[i] += 1;
        rest -= 1;
      }
    });
  return parts.map((p, i) => ({ ...p, score: PART_MAX - floor[i] }));
}
