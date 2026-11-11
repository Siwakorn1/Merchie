"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Sheet, SheetLabel } from "@/components/ui/sheet";
import { useTryPlan } from "@/components/ui/plan-offer";
import { PLAN_NAME, SEAT_LIMIT, planFor } from "@/lib/plans";
import { ShopAvatar } from "@/components/brand/shop-avatar";
import { useToast } from "@/components/ui/toast";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import merchie from "@/mock/merchie/shop.json";
import { cn } from "@/lib/utils";

type Member = { name: string; role: "owner" | "admin" };

/**
 * Team seats and extra shops. Seats per plan: Check-up 1, Care 1, Coach 3, Business unlimited
 * (the owner takes one). More than one shop is Business only. Invites are simulated.
 */
export function TeamSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { plan, has } = useDemo();
  const { t, tr } = useLang();
  const toast = useToast();
  const tryPlan = useTryPlan();
  const [members, setMembers] = useState<Member[]>([{ name: merchie.shop.owner, role: "owner" }]);
  const [shops, setShops] = useState<string[]>([merchie.shop.name]);
  const seats = SEAT_LIMIT[plan];

  const invite = () => {
    if (members.length >= seats) return tryPlan(planFor(SEAT_LIMIT, members.length));
    const name = t(`แอดมิน ${members.length}`, `Admin ${members.length}`);
    setMembers((m) => [...m, { name, role: "admin" }]);
    toast(t("ส่งคำเชิญแล้ว", "Invite sent"), t("ส่งลิงก์ทาง LINE", "Link sent on LINE"));
  };
  const addShop = () => {
    if (!has("business")) return tryPlan("business");
    const name = t(`ร้านที่ ${shops.length + 1}`, `Shop ${shops.length + 1}`);
    setShops((s) => [...s, name]);
    toast(t("เพิ่มร้านแล้ว", "Shop added"), name);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t("ทีมและร้านอื่น", "Team and shops")}>
      <SheetLabel>{t("ร้าน", "Shops")}</SheetLabel>
      <List
        rows={shops.map((s, i) => ({ key: s, title: s, right: i === 0 ? t("ร้านนี้", "This shop") : undefined }))}
        addLabel={t("เพิ่มร้าน", "Add a shop")}
        addNote={!has("business") ? tr(PLAN_NAME.business) : undefined}
        onAdd={addShop}
        avatar
      />
      <SheetLabel>
        {t("ทีม", "Team")}{" "}
        <span className="num font-normal">
          {members.length}/{seats === Infinity ? "∞" : seats}
        </span>
      </SheetLabel>
      <List
        rows={members.map((m) => ({
          key: m.name,
          title: m.name,
          right: m.role === "owner" ? t("เจ้าของ", "Owner") : t("ตอบลูกค้าได้", "Can reply"),
        }))}
        addLabel={t("ชวนแอดมิน", "Invite an admin")}
        addNote={members.length >= seats ? tr(PLAN_NAME[planFor(SEAT_LIMIT, members.length)]) : undefined}
        onAdd={invite}
      />
    </Sheet>
  );
}

function List({
  rows,
  addLabel,
  addNote,
  onAdd,
  avatar,
}: {
  rows: { key: string; title: string; right?: string }[];
  addLabel: string;
  /** shows which plan the add needs, when the current one can't */
  addNote?: string;
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
        <span className="flex-1 text-[15px] font-semibold text-ocean">{addLabel}</span>
        {addNote && <span className="text-[13px] text-muted">{addNote}</span>}
      </button>
    </div>
  );
}
