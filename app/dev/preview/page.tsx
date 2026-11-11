"use client";

import { Suspense, useSyncExternalStore } from "react";
import { DemoProvider } from "@/lib/demo-store";
import { ToastProvider } from "@/components/ui/toast";
import { HeroScore } from "@/components/health/hero-score";
import { IssuesSection } from "@/components/health/issue-list";
import { MonitorStrip } from "@/components/health/monitor-strip";
import { ChecklistSection } from "@/components/health/checklist";
import { AlertsScreen } from "@/components/alerts/alerts-screen";
import { FixItScreen } from "@/components/fixit/fixit-screen";
import { ShieldScreen } from "@/components/shield/shield-screen";
import { ShopScreen } from "@/components/shop/shop-screen";

/** Dev only: renders one screen at full height (no shell) for screenshots. ?s=home|alerts|fixit|shield|shop */
export default function Preview() {
  const s = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(location.search).get("s") ?? "home",
    () => "home",
  );
  return (
    <DemoProvider>
      <ToastProvider>
        <div id="app-screen" className="sky relative mx-auto min-h-dvh max-w-[430px] pt-6 pb-10">
          {s === "home" && (
            <div className="flex flex-col gap-9">
              <HeroScore />
              <IssuesSection />
              <MonitorStrip />
              <ChecklistSection />
            </div>
          )}
          {s === "alerts" && <AlertsScreen />}
          {s === "fixit" && (
            <Suspense>
              <FixItScreen />
            </Suspense>
          )}
          {s === "shield" && <ShieldScreen />}
          {s === "shop" && <ShopScreen />}
        </div>
      </ToastProvider>
    </DemoProvider>
  );
}
