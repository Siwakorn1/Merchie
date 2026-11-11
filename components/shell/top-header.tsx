"use client";

import { usePathname } from "next/navigation";
import { DemoPanel, DemoToggle } from "@/components/demo/demo-panel";
import { activeTab } from "./tabs";
import { useLang } from "@/lib/i18n";

export function TopHeader() {
  const pathname = usePathname();
  const { title } = activeTab(pathname);
  const { tr } = useLang();
  const isHome = pathname === "/";

  return (
    <header className="chrome relative z-30 shrink-0 pt-safe px-safe">
      <div className="flex h-[60px] items-end justify-between gap-3 px-5 pb-1.5">
        <h1 className="truncate py-1 text-[28px] leading-[1.3] font-bold tracking-tight">{tr(title)}</h1>
        {isHome && <DemoToggle />}
      </div>
      {isHome && <DemoPanel />}
    </header>
  );
}
