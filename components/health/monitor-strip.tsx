"use client";

import { useEffect, useState } from "react";
import { AddPlatformSheet } from "@/components/shop/add-platform-sheet";
import { PlatformMonitor } from "@/components/health/platform-monitor";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus } from "lucide-react";
import { PlatformLogo, platformName, type PlatformId } from "@/components/brand/platform-logo";
import { useDemo } from "@/lib/demo-store";
import { SectionTitle } from "@/components/health/issue-list";
import merchie from "@/mock/merchie/shop.json";
import { useLang } from "@/lib/i18n";

/** Counts from the mock; a newly connected platform starts with the shop's 3 products. */
export function watchFor(id: PlatformId) {
  return merchie.platforms.find((p) => p.id === id)?.watch ?? { products: 3, reviews: 0, orders: 0 };
}

/** Horizontal strip of connected marketplaces and what Merchie watches on each. */
export function MonitorStrip() {
  const { platforms } = useDemo();
  const { t } = useLang();
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<PlatformId | null>(null);

  return (
    <section>
      <div className="px-5">
        <SectionTitle>{t("กำลังเฝ้า", "Watching")}</SectionTitle>
      </div>
      <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2">
        {platforms.map((id, i) => {
          const w = watchFor(id);
          return (
            <button
              key={id}
              onClick={() => setOpen(id)}
              className="pressable chrome w-[232px] shrink-0 snap-start rounded-card bg-surface p-4 text-left shadow-soft"
            >
              <div className="flex items-center gap-3">
                <PlatformLogo id={id} size={36} className="rounded-[10px]" />
                <span className="flex-1 truncate text-[15px] font-semibold">{platformName[id]}</span>
                <Scanning delay={i * 250} />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2">
                <Stat label={t("สินค้า", "Products")} value={w.products} />
                <Stat label={t("รีวิว", "Reviews")} value={w.reviews} />
                <Stat label={t("ออเดอร์", "Orders")} value={w.orders} />
              </dl>
            </button>
          );
        })}
        <button
          onClick={() => setAdding(true)}
          className="pressable chrome flex w-[132px] shrink-0 snap-start flex-col justify-between rounded-card bg-surface/60 p-4 text-left"
        >
          <span className="grid size-9 place-items-center rounded-[10px] bg-glow text-ocean">
            <Plus className="size-5" strokeWidth={2.4} />
          </span>
          <span className="text-[14px] font-semibold text-ocean">{t("เพิ่มร้าน", "Add shop")}</span>
        </button>
        {/* trailing gutter: horizontal scrollers drop their right padding */}
        <span aria-hidden className="w-2 shrink-0" />
      </div>
      <AddPlatformSheet open={adding} onOpenChange={setAdding} />
      <PlatformMonitor id={open} onClose={() => setOpen(null)} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dd className="num text-[19px] leading-none font-bold">{value}</dd>
      <dt className="mt-1 text-[12px] text-muted">{label}</dt>
    </div>
  );
}

/** A small spinning arc: "Merchie is watching this right now". */
/**
 * Sync status: spins briefly while syncing (on mount, and again after pull-to-refresh
 * re-mounts the page), then settles to a green tick, so it never looks stuck loading.
 */
export function Scanning({ size = 18, delay = 0 }: { size?: number; delay?: number }) {
  const { t } = useLang();
  const [done, setDone] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setDone(true), 1200 + delay);
    return () => clearTimeout(id);
  }, [delay]);

  return (
    <span
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      aria-label={done ? t("ซิงก์แล้ว", "Synced") : t("กำลังซิงก์", "Syncing")}
    >
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.span
            key="done"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 22 }}
            className="grid size-full place-items-center rounded-full bg-good text-white"
          >
            <Check style={{ width: size * 0.62, height: size * 0.62 }} strokeWidth={3.4} />
          </motion.span>
        ) : (
          <motion.svg
            key="spin"
            width={size}
            height={size}
            viewBox="0 0 20 20"
            exit={{ opacity: 0, scale: 0.6 }}
            animate={{ rotate: 360 }}
            transition={{ rotate: { duration: 0.8, repeat: Infinity, ease: "linear" } }}
          >
            <circle cx="10" cy="10" r="7.5" fill="none" stroke="var(--color-line)" strokeWidth="3" />
            <circle
              cx="10"
              cy="10"
              r="7.5"
              fill="none"
              stroke="var(--color-good)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="12 48"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </span>
  );
}
