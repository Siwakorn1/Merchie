"use client";

import { AiMark } from "@/components/ui/ai-mark";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/sheet";
import { Segmented } from "@/components/ui/segmented";
import { ScoreRing } from "@/components/health/score-ring";
import { ProductThumb } from "@/components/illustrations/product-thumb";
import { Stars } from "@/components/fixit/market-mock";
import { Mascot } from "@/components/mascot/mascot";
import { PlatformLogo, platformName, type PlatformId } from "@/components/brand/platform-logo";
import { useToast } from "@/components/ui/toast";
import { useTryPlan } from "@/components/ui/plan-offer";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import type { ProductKind } from "@/lib/content/issues";
import reviews from "@/mock/merchie/reviews.json";
import shop from "@/mock/merchie/shop.json";
import products from "@/mock/shopee/products.json";
import { cn } from "@/lib/utils";

type Comment = {
  id: number;
  user: string;
  star: number;
  text: string;
  item: number;
  date: string;
  reply: string | null;
  issue?: string;
};
type Feed = {
  dist: Record<string, number>;
  comments: Comment[];
  themes: { good: string[]; bad: string[]; good_en: string[]; bad_en: string[] };
};
type Filter = "all" | "open" | "low";

const KIND: Record<number, ProductKind> = { 2310045: "jar", 2310052: "dropper", 2310060: "tube" };
const NAME = Object.fromEntries(products.response.item_list.map((p) => [p.item_id, p.item_name]));
const TODAY = "2569-11-11";
const MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Replies that pass the guardrail: no blame, no customer data, no admission beyond the facts,
   and they point to the store's channel rather than arguing in public. */
const SAFE_THANKS = "ขอบคุณมากนะคะ ดีใจที่ชอบค่ะ";
const SAFE_SORRY = "ขออภัยในความไม่สะดวกค่ะ รบกวนทักแชทร้านพร้อมเลขคำสั่งซื้อ ทางร้านจะรีบดูแลให้นะคะ";

/**
 * One platform, monitored: overall rating, how customers feel, how many reviews got an
 * answer, and every review, each one tap from a safe reply.
 */
export function PlatformMonitor({ id, onClose }: { id: PlatformId | null; onClose: () => void }) {
  const [shown, setShown] = useState<PlatformId | null>(id);
  if (id && id !== shown) setShown(id);
  // replies sent from this screen during the demo, by comment id
  const [sent, setSent] = useState<Record<number, string>>({});

  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      {shown && <Monitor key={shown} id={shown} sent={sent} onSend={(c, r) => setSent((s) => ({ ...s, [c]: r }))} onClose={onClose} />}
    </Sheet>
  );
}

function Monitor({
  id,
  sent,
  onSend,
  onClose,
}: {
  id: PlatformId;
  sent: Record<number, string>;
  onSend: (commentId: number, reply: string) => void;
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const { resolved, mascotStyle, has } = useDemo();
  const insight = has("plus");
  const tryPlan = useTryPlan();
  const [filter, setFilter] = useState<Filter>("all");
  const feed = (reviews as unknown as Record<string, Feed>)[id];
  const synced = shop.platforms.find((p) => p.id === id)?.synced;

  // reply state: from the feed, from a fix done in Fix-it, or sent here
  const comments = useMemo(
    () =>
      (feed?.comments ?? []).map((c) => ({
        ...c,
        reply:
          c.reply ??
          sent[c.id] ??
          (c.issue && resolved.includes(c.issue) ? t("ตอบแล้วผ่าน Fix-it", "Answered in Fix-it") : null),
      })),
    [feed, sent, resolved, t],
  );

  if (!feed) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <PlatformLogo id={id} size={56} className="rounded-[16px]" />
        <p className="mt-4 text-[17px] font-bold">{platformName[id]}</p>
        <Mascot variant={mascotStyle} size={110} interactive={false} mood="okay" />
        <p className="text-[15px] font-semibold">{t("กำลังดึงรีวิวรอบแรก", "Fetching reviews for the first time")}</p>
        <p className="mt-1 text-[13px] text-muted">{t("ปกติใช้เวลาไม่กี่นาที", "This usually takes a few minutes")}</p>
      </div>
    );
  }

  const total = Object.values(feed.dist).reduce((a, b) => a + b, 0);
  const avg = Object.entries(feed.dist).reduce((s, [k, v]) => s + Number(k) * v, 0) / total;
  const positive = Math.round(((feed.dist["5"] + feed.dist["4"]) / total) * 100);
  const low = feed.dist["1"] + feed.dist["2"];
  const answered = comments.filter((c) => c.reply).length;
  const replyRate = Math.round((answered / comments.length) * 100);

  const list = comments.filter((c) => (filter === "open" ? !c.reply : filter === "low" ? c.star <= 2 : true));
  const fmt = (d: string) => {
    if (d === TODAY) return t("วันนี้", "Today");
    const [, m, day] = d.split("-").map(Number);
    return lang === "th" ? `${day} ${MONTHS_TH[m - 1]}` : `${MONTHS_EN[m - 1]} ${day}`;
  };
  const th = lang === "th";

  return (
    <div className="flex flex-col">
      {/* platform */}
      <div className="flex items-center gap-3">
        <PlatformLogo id={id} size={44} className="rounded-[13px]" />
        <div className="min-w-0 flex-1">
          <p className="text-[19px] leading-tight font-bold">{platformName[id]}</p>
          <p className="mt-0.5 text-[13px] text-muted">
            {t(`ซิงก์ล่าสุด ${synced ?? "เมื่อสักครู่"}`, `Synced ${synced ?? "just now"}`)}
          </p>
        </div>
      </div>

      {/* rating overview */}
      <div className="mt-5 flex items-center gap-5 rounded-[22px] bg-canvas px-4 py-4">
        <div className="shrink-0 text-center">
          <p className="num font-round text-[44px] leading-none">{avg.toFixed(1)}</p>
          <div className="mt-1.5 flex justify-center">
            <Stars n={Math.round(avg)} size={13} />
          </div>
          <p className="mt-1.5 text-[12px] text-muted">{t(`${total} รีวิว`, `${total} reviews`)}</p>
          <p className="text-[12px] text-muted">{t("30 วันล่าสุด", "Last 30 days")}</p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((s) => {
            const n = feed.dist[String(s)] ?? 0;
            return (
              <div key={s} className="flex items-center gap-2">
                <span className="num w-2.5 text-[12px] text-muted">{s}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${(n / total) * 100}%`, background: "var(--chart-1)" }}
                  />
                </span>
                <span className="num w-7 text-right text-[12px] text-muted">{n}</span>
              </div>
            );
          })}
        </div>
      </div>

      {insight ? (
        <>
          {/* reputation at a glance: rings are the status language */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Tile label={t("ตอบแล้ว", "Answered")} pct={replyRate} />
            <Tile label={t("รีวิวดี", "Positive")} pct={positive} />
            <div className="flex flex-col items-center justify-center rounded-[18px] bg-canvas px-2 py-3 text-center">
              <span className="grid size-[52px] place-items-center">
                <span className="num text-[24px] leading-none font-bold">{low}</span>
              </span>
              <p className="mt-1.5 text-[12px] leading-tight text-muted">{t("1–2 ดาว", "1–2 stars")}</p>
            </div>
          </div>

          {/* what customers talk about */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Theme title={t("ลูกค้าชม", "Praise")} items={th ? feed.themes.good : feed.themes.good_en} />
            <Theme title={t("ลูกค้าบ่น", "Complaints")} items={th ? feed.themes.bad : feed.themes.bad_en} />
          </div>

        </>
      ) : (
        // Check up: rating and reviews are free; the insight on top comes with Care
        <div className="mt-3 flex items-center gap-3 rounded-[20px] bg-glow px-4 py-3.5">
          <AiMark className="text-[18px]" />
          <p className="min-w-0 flex-1 text-[13px] leading-snug">
            <span className="block font-semibold">Customer insight</span>
            {t("อัตราตอบรีวิว ความรู้สึกลูกค้า และเรื่องที่ลูกค้าชมหรือบ่น", "Reply rate, sentiment, and what customers praise or complain about")}
          </p>
          <button
            onClick={() => tryPlan("plus")}
            className="pressable h-10 shrink-0 rounded-full bg-ocean px-4 text-[13px] font-semibold text-white"
          >
            {t("ลองฟรี", "Try free")}
          </button>
        </div>
      )}

      {/* every review */}
      <div className="mt-6">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          inset
          options={[
            { value: "all", label: t("ทั้งหมด", "All") },
            { value: "open", label: t("ยังไม่ตอบ", "Unanswered") },
            { value: "low", label: t("1–2 ดาว", "1–2 stars") },
          ]}
        />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {list.length === 0 && (
          <p className="py-6 text-center text-[14px] text-muted">{t("ตอบครบทุกรีวิวแล้ว", "Every review has an answer")}</p>
        )}
        {list.map((c) => (
          <Review key={c.id} c={c} date={fmt(c.date)} onSend={onSend} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}

function Review({
  c,
  date,
  onSend,
  onClose,
}: {
  c: Comment;
  date: string;
  onSend: (commentId: number, reply: string) => void;
  onClose: () => void;
}) {
  const { t } = useLang();
  const router = useRouter();
  const toast = useToast();
  const low = c.star <= 2;

  return (
    <div className="rounded-[20px] bg-canvas px-4 py-3.5">
      <div className="flex items-center gap-3">
        <ProductThumb kind={KIND[c.item] ?? "jar"} size={36} urgent={low && !c.reply} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2">
            <span className="text-[14px] font-semibold">{c.user}</span>
            <Stars n={c.star} size={11} />
          </p>
          <p className="truncate text-[12px] text-muted">{NAME[c.item]}</p>
        </div>
        <span className="shrink-0 text-[12px] text-muted">{date}</span>
      </div>
      <p className="mt-2.5 text-[14px] leading-relaxed">{c.text}</p>

      {c.reply ? (
        <div className="mt-2.5 rounded-[14px] bg-surface px-3 py-2">
          <p className="text-[12px] font-semibold text-muted">{t("ร้านตอบ", "Shop replied")}</p>
          <p className="text-[13px] leading-relaxed">{c.reply}</p>
        </div>
      ) : c.issue ? (
        // linked to an open issue: the full guided fix lives in Fix-it
        <button
          onClick={() => {
            onClose();
            router.push(`/fix-it?job=${c.issue}`);
          }}
          className="pressable mt-3 h-11 w-full rounded-full bg-ocean text-[14px] font-semibold text-white"
        >
          <AiMark light className="mr-1" />
          {t("ร่างคำตอบที่ปลอดภัย", "Draft a safe reply")}
        </button>
      ) : (
        <button
          onClick={() => {
            onSend(c.id, low ? SAFE_SORRY : SAFE_THANKS);
            toast(t("ตอบรีวิวแล้ว", "Reply sent"), low ? t("ข้อความผ่าน guardrail แล้ว", "Passed the guardrail") : undefined);
          }}
          className="pressable mt-3 h-11 w-full rounded-full bg-glow text-[14px] font-semibold text-ocean"
        >
          {low ? t("ตอบขอโทษและชวนทักแชท", "Apologize and invite to chat") : t("ตอบขอบคุณ", "Say thanks")}
        </button>
      )}
    </div>
  );
}

/** Ring with the percentage inside and the label underneath: nothing competes for width. */
function Tile({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex flex-col items-center rounded-[18px] bg-canvas px-2 py-3 text-center">
      <ScoreRing score={pct} size={52} stroke={5}>
        <span className="num relative text-[13px] font-bold">{pct}%</span>
      </ScoreRing>
      <p className="mt-1.5 text-[12px] leading-tight text-muted">{label}</p>
    </div>
  );
}

function Theme({ title, items }: { title: string; items: string[] }) {
  return (
    <div className={cn("rounded-[18px] bg-canvas px-3.5 py-3")}>
      <p className="flex items-center gap-1.5 text-[12px] font-semibold text-muted">
        {title}
        <AiMark />
      </p>
      {items.map((x) => (
        <p key={x} className="mt-1 text-[13px] leading-snug">
          {x}
        </p>
      ))}
    </div>
  );
}
