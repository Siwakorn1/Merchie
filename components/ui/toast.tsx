"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mascot } from "@/components/mascot/mascot";

type Toast = { id: number; title: string; body?: string };

const ToastContext = createContext<(title: string, body?: string) => void>(() => {});

/** Notification-style toasts that drop in from the top, spoken by Merchie. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((title: string, body?: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), title, body });
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[60] flex justify-center px-3"
        style={{ paddingTop: "calc(var(--safe-top) + 8px)" }}
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ y: -90, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -90, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(_, i) => i.offset.y < -20 && setToast(null)}
              className="chrome pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-[24px] bg-surface/90 p-3 pr-4 shadow-lift backdrop-blur-xl"
            >
              <Mascot size={44} interactive={false} className="shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold">{toast.title}</span>
                {toast.body && <span className="block truncate text-[13px] text-muted">{toast.body}</span>}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
