"use client";

import { useState } from "react";
import { Check, ChevronRight, Lock, Plus } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { PlanBadge } from "@/components/ui/plan-badge";
import { PlanOffer } from "@/components/ui/plan-offer";
import { PLAN_NAME, type Plan } from "@/lib/plans";
import { useToast } from "@/components/ui/toast";
import { AddPlatformSheet, SCOPES, platformLabel } from "@/components/shop/add-platform-sheet";
import { LineSheet } from "@/components/shop/line-sheet";
import { PlanSheet } from "@/components/shop/plan-sheet";
import { TeamSheet } from "@/components/shop/more-sheets";
import { AboutSheet } from "@/components/shop/about-sheet";
import { ScoreHistoryCard } from "@/components/shop/score-history";
import { ShopAvatar } from "@/components/brand/shop-avatar";
import { Mascot, type MascotStyle } from "@/components/mascot/mascot";
import { PlatformLogo, type PlatformId } from "@/components/brand/platform-logo";
import { SectionTitle } from "@/components/health/issue-list";
import { Scanning, watchFor } from "@/components/health/monitor-strip";
import { Segmented } from "@/components/ui/segmented";
import { useDemo } from "@/lib/demo-store";
import { useLang, type Lang } from "@/lib/i18n";
import { useMode } from "@/lib/theme";
import merchie from "@/mock/merchie/shop.json";
import { cn } from "@/lib/utils";

type SheetId = "add" | "line" | "plan" | "team" | "about" | null;

export function ShopScreen() {
  const { t, lang, setLang } = useLang();
  const { mode, setMode } = useMode();
  const { plan, platforms, line } = useDemo();
  const [sheet, setSheet] = useState<SheetId>(null);
  const [managing, setManaging] = useState<PlatformId | null>(null);
  const open = (id: SheetId) => () => setSheet(id);
  const onOpenChange = (o: boolean) => !o && setSheet(null);

  return (
    <div className="flex flex-col gap-8 px-5 pt-1">
      {/* Profile */}
      <section className="flex items-center gap-4">
        <ShopAvatar size={64} />
        <div className="min-w-0">
          <p className="truncate py-0.5 text-[19px] leading-snug font-bold">{merchie.shop.name}</p>
          <button onClick={open("plan")} className="pressable mt-1.5 block">
            <PlanBadge plan={plan} />
          </button>
        </div>
      </section>

      <ScoreHistoryCard />

      {/* Connected platforms: tap one to see what it shares */}
      <section>
        <SectionTitle>{t("แพลตฟอร์ม", "Platforms")}</SectionTitle>
        <div className="overflow-hidden rounded-card bg-surface shadow-soft">
          {platforms.map((id, i) => (
            <button
              key={id}
              onClick={() => setManaging(id)}
              className={cn(
                "chrome flex min-h-16 w-full items-center gap-3 px-4 text-left transition-colors active:bg-glow",
                i > 0 && "border-t border-line",
              )}
            >
              <PlatformLogo id={id} size={40} className="rounded-[12px]" />
              <span className="flex-1 text-[15px] font-semibold">{platformLabel(id, t)}</span>
              <Scanning delay={i * 250} />
              <ChevronRight className="size-5 text-subtle" />
            </button>
          ))}
          <button
            onClick={open("add")}
            className={cn(
              "chrome flex min-h-14 w-full items-center gap-3 px-4 text-left transition-colors active:bg-glow",
              platforms.length > 0 && "border-t border-line",
            )}
          >
            <span className="grid size-10 place-items-center text-ocean">
              <Plus className="size-6" strokeWidth={2.4} />
            </span>
            <span className="flex-1 text-[15px] font-semibold text-ocean">
              {t("เพิ่มร้านหรือแพลตฟอร์ม", "Add a shop or platform")}
            </span>
          </button>
        </div>
      </section>

      <MascotPicker />

      {/* Settings */}
      <section className="overflow-hidden rounded-card bg-surface shadow-soft">
        <div className="flex min-h-14 items-center gap-3 px-5">
          <span className="flex-1 text-[15px] font-medium">{t("ภาษา", "Language")}</span>
          <div className="w-40">
            <Segmented<Lang>
              value={lang}
              onChange={setLang}
              options={[
                { value: "th", label: "ไทย" },
                { value: "en", label: "EN" },
              ]}
            />
          </div>
        </div>
        <button
          onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          role="switch"
          aria-checked={mode === "dark"}
          className="chrome flex min-h-14 w-full items-center gap-3 border-t border-line px-5 text-left"
        >
          <span className="flex-1 text-[15px] font-medium">{t("โหมดมืด", "Dark mode")}</span>
          <Switch on={mode === "dark"} />
        </button>
        <Row
          label={t("สรุปทาง LINE", "LINE brief")}
          trailing={line.connected ? line.time : t("ยังไม่เชื่อม", "Off")}
          onClick={open("line")}
        />
        <Row label={t("ทีมและร้านอื่น", "Team and shops")} onClick={open("team")} />
        <Row label={t("แพ็กเกจ", "Plan")} trailing={<PlanBadge plan={plan} />} onClick={open("plan")} />
        <Row label={t("เกี่ยวกับ Merchie", "About Merchie")} onClick={open("about")} />
      </section>

      <AddPlatformSheet open={sheet === "add"} onOpenChange={onOpenChange} />
      <LineSheet open={sheet === "line"} onOpenChange={onOpenChange} />
      <PlanSheet key={plan} open={sheet === "plan"} onOpenChange={onOpenChange} />
      <TeamSheet open={sheet === "team"} onOpenChange={onOpenChange} />
      <AboutSheet open={sheet === "about"} onOpenChange={onOpenChange} />
      <PlatformSheet id={managing} onClose={() => setManaging(null)} />
    </div>
  );
}

/** One connected platform: what Merchie watches, what it may read, disconnect. */
function PlatformSheet({ id, onClose }: { id: PlatformId | null; onClose: () => void }) {
  const { t } = useLang();
  const toast = useToast();
  const { disconnect } = useDemo();
  const [shown, setShown] = useState<PlatformId | null>(id);
  if (id && id !== shown) setShown(id);
  const info = merchie.platforms.find((p) => p.id === shown);
  const watch = shown ? watchFor(shown) : null;

  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      {shown && watch && (
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <PlatformLogo id={shown} size={48} className="rounded-[14px]" />
            <div className="min-w-0 flex-1">
              <p className="text-[19px] leading-tight font-bold">{platformLabel(shown, t)}</p>
              <p className="mt-0.5 text-[13px] text-muted">
                {t(`ซิงก์ล่าสุด ${info?.synced ?? "เมื่อสักครู่"}`, `Synced ${info?.synced ?? "just now"}`)}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              [watch.products, t("สินค้า", "Products")],
              [watch.reviews, t("รีวิว", "Reviews")],
              [watch.orders, t("ออเดอร์", "Orders")],
            ].map(([n, label]) => (
              <div key={String(label)} className="rounded-[18px] bg-canvas px-3 py-3 text-center">
                <p className="num text-[22px] leading-none font-bold">{n}</p>
                <p className="mt-1.5 text-[12px] text-muted">{label}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 mb-2.5 text-[14px] font-semibold text-muted">{t("Merchie อ่านได้", "Merchie can read")}</p>
          <div className="overflow-hidden rounded-[20px] bg-canvas">
            {(SCOPES[shown] ?? []).map(([th, en], i) => (
              <div key={en} className={cn("flex min-h-12 items-center gap-3 px-4", i > 0 && "border-t border-line")}>
                <Check className="size-4 shrink-0 text-good-ink" strokeWidth={3} />
                <span className="text-[15px]">{t(th, en)}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => toast(t("ซิงก์แล้ว", "Synced"), platformLabel(shown, t))}
            className="pressable mt-5 h-12 w-full rounded-full bg-glow text-[15px] font-semibold text-ocean"
          >
            {t("ซิงก์ตอนนี้", "Sync now")}
          </button>
          <button
            onClick={() => {
              disconnect(shown);
              onClose();
              toast(t(`ยกเลิกการเชื่อม ${platformLabel(shown, t)} แล้ว`, `${platformLabel(shown, t)} disconnected`));
            }}
            className="pressable mt-1 h-12 w-full rounded-full text-[15px] font-semibold text-danger-ink"
          >
            {t("ยกเลิกการเชื่อมต่อ", "Disconnect")}
          </button>
        </div>
      )}
    </Sheet>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", on ? "bg-ocean" : "bg-line")}>
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-soft transition-transform duration-200",
          on && "translate-x-5",
        )}
      />
    </span>
  );
}

function Row({ label, trailing, onClick }: { label: string; trailing?: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="chrome flex min-h-14 w-full items-center gap-3 border-t border-line px-5 text-left transition-colors active:bg-glow"
    >
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      {typeof trailing === "string" ? <span className="text-[14px] text-muted">{trailing}</span> : trailing}
      <ChevronRight className="size-5 text-subtle" />
    </button>
  );
}

/** Merchie's looks. Classic is free; the others come with Care. */
function MascotPicker() {
  const { mascotStyle, setMascotStyle, outfit, setOutfit, has } = useDemo();
  const { t, tr } = useLang();
  const [offer, setOffer] = useState<MascotStyle | null>(null);
  const [shownOffer, setShownOffer] = useState<MascotStyle | null>(null);
  if (offer && offer !== shownOffer) setShownOffer(offer);

  const styles: { id: MascotStyle; label: string }[] = [
    { id: "jelly", label: t("คลาสสิก", "Classic") },
    { id: "guardian", label: t("ผู้พิทักษ์", "Guardian") },
    { id: "money", label: t("เหนี่ยวทรัพย์", "Lucky") },
    { id: "fantasy", label: t("แฟนตาซี", "Fantasy") },
    { id: "rainbow", label: t("ราชินีสายรุ้ง", "Rainbow Royal") },
  ];
  /** which plan each look needs: Classic is free, Rainbow is the top tier only */
  const needOf = (id: MascotStyle): Plan | null => (id === "jelly" ? null : id === "rainbow" ? "pro" : "plus");
  const labelOf = (id: MascotStyle) => styles.find((x) => x.id === id)!.label;

  return (
    <section>
      <SectionTitle>{t("หน้าตาน้อง Merchie", "Merchie's look")}</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {styles.map((s) => {
          const on = s.id === mascotStyle;
          const need = needOf(s.id);
          const locked = !!need && !has(need);
          const wide = s.id === "rainbow";
          return (
            <button
              key={s.id}
              onClick={() => (locked ? setOffer(s.id) : setMascotStyle(s.id))}
              aria-label={locked ? `${s.label} (${tr(PLAN_NAME[need!])})` : s.label}
              className={cn(
                "pressable relative flex flex-col items-center rounded-card bg-surface pt-4 pb-3 shadow-soft transition-shadow",
                wide && "col-span-2",
                on && "ring-2 ring-ocean",
              )}
            >
              <span className={cn("transition-opacity", locked && "opacity-55")}>
                <Mascot variant={s.id} outfit={outfit} size={wide ? 130 : 100} interactive={false} />
              </span>
              <span className={cn("mt-1 flex items-center gap-1.5 text-[14px] font-semibold", on ? "text-ocean" : "text-muted")}>
                {s.label}
              </span>
              {need && <PlanBadge plan={need} small className="absolute top-3 left-3" />}
              {on && (
                <span className="absolute top-3 right-3 grid size-6 place-items-center rounded-full bg-ocean text-white">
                  <Check className="size-4" strokeWidth={3} />
                </span>
              )}
              {locked && (
                <span className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-ink/70 text-white backdrop-blur">
                  <Lock className="size-3.5" strokeWidth={2.6} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => setOutfit(!outfit)}
        role="switch"
        aria-checked={outfit}
        className="chrome mt-3 flex min-h-14 w-full items-center gap-3 rounded-card bg-surface px-5 text-left shadow-soft"
      >
        <span className="flex-1 text-[15px] font-medium">{t("ของในมือ", "Props in hand")}</span>
        <Switch on={outfit} />
      </button>

      <Sheet open={!!offer} onOpenChange={(o) => !o && setOffer(null)}>
        {shownOffer && (
          <div className="pt-2">
            <PlanOffer
              need={needOf(shownOffer) === "pro" ? "pro" : "plus"}
              look={shownOffer}
              mascotSize={170}
              title={t(
                `${labelOf(shownOffer)} มากับ ${tr(PLAN_NAME[needOf(shownOffer) ?? "plus"])}`,
                `${labelOf(shownOffer)} comes with ${tr(PLAN_NAME[needOf(shownOffer) ?? "plus"])}`,
              )}
              body={
                shownOffer === "rainbow"
                  ? t("มงกุฎกับสีรุ้ง ให้เฉพาะร้าน Coachเท่านั้น", "The crown and the rainbow are for Coach shops only")
                  : t(
                      "ปลดล็อกน้อง Merchie ทุกแบบ พร้อมธีมสีของแอปที่เปลี่ยนตามน้อง",
                      "Unlock every Merchie look, with an app theme that changes to match",
                    )
              }
              onTried={() => {
                setMascotStyle(shownOffer);
                setOffer(null);
              }}
              onLater={() => setOffer(null)}
            />
          </div>
        )}
      </Sheet>
    </section>
  );
}
