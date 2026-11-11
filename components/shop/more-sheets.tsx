"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Sheet, SheetLabel } from "@/components/ui/sheet";
import { PlanOffer } from "@/components/ui/plan-offer";
import { ShopAvatar } from "@/components/brand/shop-avatar";
import { useToast } from "@/components/ui/toast";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import merchie from "@/mock/merchie/shop.json";
import { cn } from "@/lib/utils";

type Member = { name: string; role: "owner" | "admin" };

/** Team and extra shops (Coach). Invites are simulated. */
export function TeamSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { has } = useDemo();
  const { t } = useLang();
  const toast = useToast();
  const [members, setMembers] = useState<Member[]>([
    { name: merchie.shop.owner, role: "owner" },
    { name: "แอดมินมิ้นท์", role: "admin" },
  ]);
  const [shops, setShops] = useState<string[]>([merchie.shop.name]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={has("pro") ? t("ทีมและร้านอื่น", "Team and shops") : undefined}>
      {!has("pro") ? (
        <PlanOffer
          need="pro"
          look="guardian"
          mascotSize={120}
          title={t("หลายร้าน หลายแอดมิน สำหรับ Coach", "Many shops and admins with Coach")}
          body={t("ให้แอดมินช่วยตอบลูกค้า และดูทุกร้านในแอปเดียว", "Let admins answer customers, and see every shop in one app")}
          onLater={() => onOpenChange(false)}
        />
      ) : (
        <>
          <SheetLabel>{t("ร้าน", "Shops")}</SheetLabel>
          <List
            rows={shops.map((s, i) => ({ key: s, title: s, right: i === 0 ? t("ร้านนี้", "This shop") : undefined }))}
            addLabel={t("เพิ่มร้าน", "Add a shop")}
            onAdd={() => {
              const name = t(`ร้านที่ ${shops.length + 1}`, `Shop ${shops.length + 1}`);
              setShops((s) => [...s, name]);
              toast(t("เพิ่มร้านแล้ว", "Shop added"), name);
            }}
            avatar
          />
          <SheetLabel>{t("แอดมิน", "Admins")}</SheetLabel>
          <List
            rows={members.map((m) => ({
              key: m.name,
              title: m.name,
              right: m.role === "owner" ? t("เจ้าของ", "Owner") : t("ตอบลูกค้าได้", "Can reply"),
            }))}
            addLabel={t("ชวนแอดมิน", "Invite an admin")}
            onAdd={() => {
              const name = t(`แอดมิน ${members.length}`, `Admin ${members.length}`);
              setMembers((m) => [...m, { name, role: "admin" }]);
              toast(t("ส่งคำเชิญแล้ว", "Invite sent"), t("ส่งลิงก์ทาง LINE", "Link sent on LINE"));
            }}
          />
        </>
      )}
    </Sheet>
  );
}

function List({
  rows,
  addLabel,
  onAdd,
  avatar,
}: {
  rows: { key: string; title: string; right?: string }[];
  addLabel: string;
  onAdd: () => void;
  avatar?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[20px] bg-canvas">
      {rows.map((r, i) => (
        <div key={r.key} className={cn("flex min-h-14 items-center gap-3 px-4", i > 0 && "border-t border-line")}>
          {avatar ? (
            <ShopAvatar size={34} />
          ) : (
            <span className="grid size-[34px] place-items-center rounded-full bg-surface text-[14px] font-bold text-ocean">
              {r.title.replace(/^(คุณ|แอดมิน)/, "").slice(0, 1) || r.title.slice(0, 1)}
            </span>
          )}
          <span className="flex-1 truncate text-[15px] font-medium">{r.title}</span>
          {r.right && <span className="text-[13px] text-muted">{r.right}</span>}
        </div>
      ))}
      <button
        onClick={onAdd}
        className="chrome flex min-h-14 w-full items-center gap-3 border-t border-line px-4 text-left transition-colors active:bg-glow"
      >
        <span className="grid size-[34px] place-items-center text-ocean">
          <Plus className="size-5" strokeWidth={2.4} />
        </span>
        <span className="text-[15px] font-semibold text-ocean">{addLabel}</span>
      </button>
    </div>
  );
}
