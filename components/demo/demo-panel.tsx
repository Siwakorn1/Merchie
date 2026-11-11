"use client";

import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { useDemo, useShopScore } from "@/lib/demo-store";
import { ThickSlider } from "@/components/ui/thick-slider";
import { scoreColor, scoreInk } from "@/lib/health/status";
import { useRouter } from "next/navigation";
import { useCloudTransition } from "@/components/motion/cloud-transition";
import { incident } from "@/lib/content/shield";
import { useLang } from "@/lib/i18n";

/** Header button that opens the demo controls. Hidden with ?demo=0. */
export function DemoToggle() {
  const { enabled, panelOpen, setPanelOpen } = useDemo();
  const { t } = useLang();
  if (!enabled) return null;
  return (
    <button
      onClick={() => setPanelOpen(!panelOpen)}
      aria-label={t("ปรับคะแนน (เดโม)", "Adjust score (demo)")}
      className="pressable grid size-11 place-items-center rounded-full bg-surface/70 text-ocean shadow-soft backdrop-blur"
    >
      {panelOpen ? <X className="size-5" strokeWidth={2.2} /> : <SlidersHorizontal className="size-5" strokeWidth={2.2} />}
    </button>
  );
}

/** Drop-down card under the header: drag to any score, and the suspension story. Nothing else. */
export function DemoPanel() {
  const { panelOpen, setPanelOpen, setOverride, suspended, setSuspended } = useDemo();
  const score = useShopScore();
  const cloud = useCloudTransition();
  const router = useRouter();
  const { t, tr } = useLang();

  const suspend = () => {
    setPanelOpen(false);
    if (suspended) return setSuspended(false);
    cloud({
      mood: "shocked",
      caption: tr(incident.title),
      hold: 1300,
      onCovered: () => {
        setSuspended(true);
        router.push("/shield");
      },
    });
  };

  return (
    <AnimatePresence>
      {panelOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 500, damping: 36 }}
          className="chrome absolute inset-x-4 top-full z-30 rounded-card bg-surface/95 p-4 shadow-lift backdrop-blur-xl"
        >
          <div className="mb-3 flex items-baseline justify-between px-1">
            <span className="text-[14px] font-semibold text-muted">{t("จำลองคะแนนร้าน", "Simulate shop score")}</span>
            <span className="num font-round text-[26px] leading-none" style={{ color: scoreInk(score) }}>
              {score}
            </span>
          </div>
          <ThickSlider value={score} onChange={setOverride} color={scoreColor(score)} label={t("จำลองคะแนนร้าน", "Simulate shop score")} />
          <button
            onClick={suspend}
            className="pressable mt-3 h-11 w-full rounded-full bg-danger-soft text-[14px] font-semibold text-danger-ink"
          >
            {suspended
              ? t("ยกเลิกการจำลองโดนระงับ", "Undo suspension")
              : t("จำลอง: ร้านโดนระงับ", "Simulate: shop suspended")}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
