"use client";

import { Star } from "lucide-react";
import { PlatformLogo } from "@/components/brand/platform-logo";
import { ProductThumb } from "@/components/illustrations/product-thumb";
import type { ProductKind } from "@/lib/content/issues";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SHOPEE = "#EE4D2D";

/** Small header strip that says where this text lives. */
function Source({ label, tag, tone }: { label: string; tag?: string; tone?: "risk" | "suggest" }) {
  return (
    <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
      <PlatformLogo id="shopee" size={18} className="rounded-[5px]" />
      <span className="flex-1 text-[12px] font-semibold text-muted">{label}</span>
      {tag && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-bold",
            tone === "risk" ? "bg-danger-soft text-danger-ink" : "bg-glow text-ocean",
          )}
        >
          {tag}
        </span>
      )}
    </div>
  );
}

export function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i < n ? "fill-[#FFB400] text-[#FFB400]" : "fill-line text-line"}
          strokeWidth={0}
        />
      ))}
    </span>
  );
}

/** A product page as the buyer sees it: photo, title, price, rating, then the description. */
export function MarketListing({
  kind,
  name,
  price,
  sold,
  rating,
  tag,
  tone,
  dim,
  children,
}: {
  kind: ProductKind;
  name: string;
  price: number;
  sold: number;
  rating: number;
  tag?: string;
  tone?: "risk" | "suggest";
  dim?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useLang();
  return (
    <div className={cn("overflow-hidden rounded-card bg-surface shadow-soft", tone === "suggest" && "ring-2 ring-ocean/20")}>
      <Source label={t("หน้าสินค้า", "Product page")} tag={tag} tone={tone} />
      <div className={cn("flex gap-3 p-4 pb-3", dim && "opacity-60")}>
        <ProductThumb kind={kind} size={72} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[14px] leading-snug font-semibold">{name}</p>
          <p className="num mt-1 text-[18px] font-bold" style={{ color: SHOPEE }}>
            ฿{price.toLocaleString("th-TH")}
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted">
            <Stars n={Math.round(rating)} size={11} />
            <span className="num">{rating.toFixed(1)}</span>
            <span className="num">
              {t("ขายแล้ว", "Sold")} {sold >= 1000 ? `${(sold / 1000).toFixed(1)}k` : sold}
            </span>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <p className="mb-1.5 text-[12px] font-bold tracking-wide text-muted">{t("รายละเอียดสินค้า", "Description")}</p>
        <div className="text-[14px] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

/** A buyer review as it appears in the app, optionally with the seller's reply underneath. */
export function MarketReview({
  buyer,
  stars,
  text,
  variation,
  date,
  reply,
}: {
  buyer: string;
  stars: number;
  text: string;
  variation: string;
  date: string;
  reply?: React.ReactNode;
}) {
  const { t } = useLang();
  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-soft">
      <Source label={t("รีวิวสินค้า", "Product review")} />
      <div className="flex gap-3 p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-canvas text-[14px] font-bold text-muted uppercase">
          {buyer[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold">{buyer}</p>
          <div className="mt-0.5">
            <Stars n={stars} size={12} />
          </div>
          <p className="mt-1 text-[12px] text-muted">
            {date} | {t("ตัวเลือก", "Variation")}: {variation}
          </p>
          <p className="mt-2 text-[14px] leading-relaxed">{text}</p>

          {reply && (
            <div className="mt-3 rounded-[14px] bg-canvas px-3.5 py-3">
              <p className="text-[12px] font-bold text-muted">{t("การตอบกลับจากผู้ขาย", "Seller's response")}</p>
              <div className="mt-1 text-[14px] leading-relaxed">{reply}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
