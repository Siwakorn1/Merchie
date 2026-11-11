"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { activeTab, tabs, TAB_BAR_HEIGHT } from "./tabs";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";


/** Icon-only floating capsule. Labels stay as aria-labels for screen readers. */
export function TabBar() {
  const current = activeTab(usePathname()).href;
  const { openIssues, suspended } = useDemo();
  const { tr } = useLang();
  const hasUrgent = suspended || openIssues.some((i) => i.status === "danger");

  return (
    <nav
      className="chrome pointer-events-none absolute inset-x-0 bottom-0 z-20 px-6"
      style={{ paddingBottom: "max(var(--safe-bottom), 14px)" }}
    >
      <div
        className="pointer-events-auto mx-auto flex max-w-sm items-center justify-between glass-bar rounded-full px-2"
        style={{ height: TAB_BAR_HEIGHT }}
      >
        {tabs.map((tab) => {
          const active = tab.href === current;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tr(tab.label)}
              aria-current={active ? "page" : undefined}
              className="group relative grid h-11 w-14 place-items-center"
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-surface/70 shadow-soft ring-1 ring-surface/50"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative transition-transform duration-150 group-active:scale-90">
                <Icon
                  className={cn("size-6 transition-colors", active ? "text-ocean" : "text-muted")}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {tab.href === "/alerts" && hasUrgent && (
                  <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-danger ring-2 ring-surface" />
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
