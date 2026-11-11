"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import { Mascot } from "@/components/mascot/mascot";
import { useToast } from "@/components/ui/toast";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";

const TRIGGER = 72; // px of pull needed to refresh
const HOLD = 76; // where content rests while refreshing (room for the indicator)
const MAX = 130;

/**
 * The app's scroll area, with iOS-style pull-to-refresh (the browser's own is disabled by
 * overscroll-behavior: none). Pull down at the very top: content follows with resistance and
 * Merchie peeks in, spinning with the pull. Past the trigger, release to refresh: Merchie
 * bounces, the page re-mounts (the ring draws in again) and a toast confirms.
 * Works with touch, and with a mouse drag for the desktop demo.
 */
export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const pull = useMotionValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const [generation, setGeneration] = useState(0);
  const router = useRouter();
  const toast = useToast();
  const { t } = useLang();
  const { mascotStyle } = useDemo();

  const indicatorY = useTransform(pull, (p) => p - 62);
  const indicatorOpacity = useTransform(pull, [0, TRIGGER * 0.5, TRIGGER], [0, 0.7, 1]);
  const indicatorScale = useTransform(pull, [0, TRIGGER], [0.85, 1]);
  const progress = useTransform(pull, [0, TRIGGER], [0, 1]);
  const [ready, setReady] = useState(false);
  useMotionValueEvent(pull, "change", (v) => setReady(v >= TRIGGER));

  // keep latest values for the native listeners below
  const live = useRef({ refreshing, t, toast, router });
  useEffect(() => {
    live.current = { refreshing, t, toast, router };
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startY: number | null = null;
    let pulling = false;
    let suppressClick = false;

    const begin = (y: number) => {
      if (live.current.refreshing || el.scrollTop > 0) return;
      startY = y;
      pulling = false;
    };
    const move = (y: number, e: Event) => {
      if (startY === null) return;
      const dy = y - startY;
      if (dy <= 0 || el.scrollTop > 0) {
        if (pulling) pull.set(0);
        return;
      }
      if (!pulling && dy < 6) return;
      pulling = true;
      if (e.cancelable) e.preventDefault();
      // rubber-band resistance
      pull.set(Math.min(MAX, dy * 0.5 - (dy * dy) / 4000));
    };
    const end = () => {
      if (startY === null) return;
      startY = null;
      if (!pulling) return;
      pulling = false;
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 50);
      if (pull.get() >= TRIGGER) {
        setRefreshing(true);
        animate(pull, HOLD, { type: "spring", stiffness: 400, damping: 30 });
        setTimeout(() => {
          const { router, toast, t } = live.current;
          router.refresh();
          setGeneration((g) => g + 1);
          animate(pull, 0, { type: "spring", stiffness: 380, damping: 32 });
          setRefreshing(false);
          toast(t("อัปเดตแล้ว", "Up to date"), t("ดึงข้อมูลล่าสุดจากทุกร้านแล้ว", "Pulled the latest from every shop"));
        }, 1100);
      } else {
        animate(pull, 0, { type: "spring", stiffness: 420, damping: 34 });
      }
    };

    const onTouchStart = (e: TouchEvent) => begin(e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientY, e);
    const onMouseDown = (e: MouseEvent) => e.button === 0 && begin(e.clientY);
    const onMouseMove = (e: MouseEvent) => move(e.clientY, e);
    const onClickCapture = (e: MouseEvent) => {
      if (suppressClick) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", end);
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", end);
    el.addEventListener("click", onClickCapture, true);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", end);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", end);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, [pull]);

  return (
    <main ref={ref} className="no-scrollbar relative flex-1 overflow-x-hidden overflow-y-auto overscroll-x-none overscroll-y-contain px-safe">
      {/* Pull indicator: Merchie in a ring that fills with the pull, then spins */}
      <motion.div
        aria-live="polite"
        className="pointer-events-none absolute top-0 left-1/2 z-10 -translate-x-1/2"
        style={{ y: indicatorY, opacity: indicatorOpacity, scale: indicatorScale }}
      >
        {/* just Merchie and a ring: fills with the pull, spins while refreshing */}
        <div className="grid size-[52px] place-items-center rounded-full bg-surface shadow-lift">
          <span className="relative grid size-11 place-items-center">
            <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
              <circle cx="22" cy="22" r="19" fill="none" strokeWidth="3.5" className="stroke-line" />
              {refreshing ? (
                <motion.circle
                  cx="22"
                  cy="22"
                  r="19"
                  fill="none"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="stroke-ocean"
                  style={{ pathLength: 0.3, originX: "50%", originY: "50%" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <motion.circle
                  cx="22"
                  cy="22"
                  r="19"
                  fill="none"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="stroke-ocean"
                  style={{ pathLength: progress }}
                />
              )}
            </svg>
            <motion.span
              animate={refreshing ? { y: [0, -3, 0] } : { y: 0 }}
              transition={refreshing ? { duration: 0.5, repeat: Infinity } : undefined}
            >
              <Mascot mood={ready || refreshing ? "delighted" : "happy"} variant={mascotStyle} size={30} interactive={false} />
            </motion.span>
          </span>
        </div>
        <span className="sr-only">
          {refreshing ? t("กำลังอัปเดต", "Refreshing") : ready ? t("ปล่อยเพื่ออัปเดต", "Release to refresh") : t("ดึงเพื่ออัปเดต", "Pull to refresh")}
        </span>
      </motion.div>

      <motion.div style={{ y: pull }}>
        <div key={generation}>{children}</div>
      </motion.div>
    </main>
  );
}
