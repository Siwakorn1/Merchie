"use client";

import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Sheet, SheetLabel } from "@/components/ui/sheet";
import { PlanOffer } from "@/components/ui/plan-offer";
import { PlatformLogo, platformName, type PlatformId } from "@/components/brand/platform-logo";
import { Mascot, type MascotStyle } from "@/components/mascot/mascot";
import { useToast } from "@/components/ui/toast";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import { PLAN_NAME, PLATFORM_LIMIT, planFor } from "@/lib/plans";
import { cn } from "@/lib/utils";

const MARKETPLACES: PlatformId[] = ["shopee", "lazada", "tiktok"];
const SOCIAL_AND_WEB: PlatformId[] = ["instagram", "facebook", "shopify", "web"];

/** What each platform's official partner API lets Merchie read, after the seller allows it. */
export const SCOPES: Partial<Record<PlatformId, [string, string][]>> = {
  shopee: [
    ["สินค้า", "Products"],
    ["รีวิว", "Reviews"],
    ["ออเดอร์", "Orders"],
    ["การคืนสินค้า", "Returns"],
    ["แต้มโทษ", "Penalty points"],
  ],
  tiktok: [
    ["สินค้า", "Products"],
    ["รีวิว", "Reviews"],
    ["ออเดอร์", "Orders"],
  ],
  lazada: [
    ["สินค้า", "Products"],
    ["รีวิว", "Reviews"],
    ["ออเดอร์", "Orders"],
  ],
  instagram: [
    ["โพสต์ของร้าน", "Shop posts"],
    ["คอมเมนต์", "Comments"],
  ],
  facebook: [
    ["โพสต์ของเพจ", "Page posts"],
    ["คอมเมนต์", "Comments"],
  ],
  shopify: [
    ["สินค้า", "Products"],
    ["ออเดอร์", "Orders"],
  ],
  web: [["หน้าสินค้า", "Product pages"]],
};

export const platformLabel = (id: PlatformId, t: (th: string, en: string) => string) =>
  id === "web" ? t("เว็บไซต์ของร้าน", "Your own website") : platformName[id];

/**
 * Add a platform: pick one, then a mock of the platform's OAuth consent
 * (sign in to the shop, see what Merchie may read, allow). Each plan has a platform limit
 * (Check up 1, Care 3, Coach and Business unlimited).
 */
export function AddPlatformSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t, tr } = useLang();
  const toast = useToast();
  const { platforms, connect, plan, mascotStyle } = useDemo();
  const [picked, setPicked] = useState<PlatformId | null>(null);
  const [busy, setBusy] = useState(false);
  const limit = PLATFORM_LIMIT[plan];
  const full = platforms.length >= limit;
  const next = planFor(PLATFORM_LIMIT, platforms.length);

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(() => setPicked(null), 300);
  };

  const allow = (id: PlatformId) => {
    setBusy(true);
    setTimeout(() => {
      connect(id);
      setBusy(false);
      close(false);
      toast(t(`เชื่อม ${platformLabel(id, t)} แล้ว`, `${platformLabel(id, t)} connected`), t("น้อง Merchie เริ่มเฝ้าให้แล้ว", "Merchie is watching it now"));
    }, 900);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={close}
      title={picked ? undefined : full ? undefined : t("เพิ่มร้าน", "Add a shop")}
    >
      {full ? (
        <PlanOffer
          need={next}
          look={mascotStyle}
          mascotSize={120}
          title={t(
            `${tr(PLAN_NAME[plan])} เชื่อมได้ ${limit} แพลตฟอร์ม`,
            `${tr(PLAN_NAME[plan])} connects ${limit} platform${limit > 1 ? "s" : ""}`,
          )}
          body={t(
            `${tr(PLAN_NAME[next])} เชื่อมได้มากขึ้น ให้น้อง Merchie เฝ้าทุกร้านในที่เดียว`,
            `${tr(PLAN_NAME[next])} connects more, so Merchie watches your shops in one place`,
          )}
          onLater={() => close(false)}
        />
      ) : picked ? (
        <Consent id={picked} look={mascotStyle} busy={busy} onAllow={() => allow(picked)} onBack={() => setPicked(null)} />
      ) : (
        <>
          <SheetLabel>{t("มาร์เก็ตเพลส", "Marketplaces")}</SheetLabel>
          <Grid ids={MARKETPLACES} connected={platforms} onPick={setPicked} />
          <SheetLabel>{t("โซเชียลและเว็บไซต์", "Social and web")}</SheetLabel>
          <Grid ids={SOCIAL_AND_WEB} connected={platforms} onPick={setPicked} />
        </>
      )}
    </Sheet>
  );
}

/** Mock of the platform's own consent page. */
function Consent({ id, look, busy, onAllow, onBack }: { id: PlatformId; look: MascotStyle; busy: boolean; onAllow: () => void; onBack: () => void }) {
  const { t } = useLang();
  const scopes = SCOPES[id] ?? [];
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mt-2 flex items-center gap-3">
        <PlatformLogo id={id} size={56} className="rounded-[16px]" />
        <span className="h-0 w-8 border-t-2 border-dashed border-line" />
        <span className="grid size-14 place-items-center overflow-hidden rounded-[16px] bg-glow">
          <Mascot variant={look} size={50} interactive={false} />
        </span>
      </div>
      <h2 className="mt-4 text-[19px] font-bold tracking-tight">
        {t(`ให้ Merchie อ่านข้อมูลร้านบน ${platformLabel(id, t)}`, `Let Merchie read your ${platformLabel(id, t)} shop`)}
      </h2>

      <div className="mt-5 w-full overflow-hidden rounded-[20px] bg-canvas text-left">
        {scopes.map(([th, en], i) => (
          <div key={en} className={cn("flex min-h-12 items-center gap-3 px-4", i > 0 && "border-t border-line")}>
            <Check className="size-4 shrink-0 text-good-ink" strokeWidth={3} />
            <span className="text-[15px]">{t(th, en)}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        {t("อ่านอย่างเดียว ยกเลิกได้ทุกเมื่อ", "Read-only. Revoke any time.")}
      </p>

      <div className="mt-5 flex w-full flex-col gap-2">
        <button
          disabled={busy}
          onClick={onAllow}
          className="pressable h-12 w-full rounded-full bg-ocean text-[15px] font-semibold text-white shadow-lift"
        >
          {busy ? t("กำลังเชื่อม", "Connecting") : t("อนุญาต", "Allow")}
        </button>
        <button onClick={onBack} className="pressable h-12 w-full rounded-full text-[15px] font-semibold text-muted">
          {t("ย้อนกลับ", "Back")}
        </button>
      </div>
    </div>
  );
}

function Grid({ ids, connected, onPick }: { ids: PlatformId[]; connected: PlatformId[]; onPick: (id: PlatformId) => void }) {
  const { t } = useLang();
  return (
    <div className="overflow-hidden rounded-[20px] bg-canvas">
      {ids.map((id, i) => {
        const on = connected.includes(id);
        return (
          <button
            key={id}
            disabled={on}
            onClick={() => onPick(id)}
            className={cn(
              "chrome flex min-h-14 w-full items-center gap-3 px-4 text-left transition-colors active:bg-glow",
              i > 0 && "border-t border-line",
            )}
          >
            <PlatformLogo id={id} size={34} className="rounded-[10px]" />
            <span className="flex-1 text-[15px] font-medium">{platformLabel(id, t)}</span>
            {on ? (
              <Check className="size-5 text-good-ink" strokeWidth={2.6} />
            ) : (
              <ChevronRight className="size-5 text-subtle" />
            )}
          </button>
        );
      })}
    </div>
  );
}
