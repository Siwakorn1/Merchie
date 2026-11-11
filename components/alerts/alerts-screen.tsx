"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { Mascot } from "@/components/mascot/mascot";
import { IssueLead, IssueSheet, SectionTitle } from "@/components/health/issue-list";
import { PlatformLogo } from "@/components/brand/platform-logo";
import { useDemo, useShopScore } from "@/lib/demo-store";
import { scoreToMood } from "@/lib/health/status";
import type { Issue } from "@/lib/content/issues";
import { incident } from "@/lib/content/shield";
import { useLang } from "@/lib/i18n";

export function AlertsScreen() {
  const { openIssues, mascotStyle, outfit, suspended } = useDemo();
  const { t, tr } = useLang();
  const score = useShopScore();
  const [active, setActive] = useState<Issue | null>(null);
  const urgent = openIssues.filter((i) => i.status === "danger");
  const today = openIssues.filter((i) => i.day === "today");
  const earlier = openIssues.filter((i) => i.day === "earlier");

  const titles = urgent.map((u) => tr(u.title)).join(t(" และ ", " and "));
  const brief =
    urgent.length > 0
      ? t(
          `อรุณสวัสดิ์ค่ะ วันนี้ได้ ${score} คะแนน มีเรื่องด่วน: ${titles}`,
          `Morning! You're at ${score} today. Urgent: ${titles}`,
        )
      : t(`อรุณสวัสดิ์ค่ะ วันนี้ได้ ${score} คะแนน ไม่มีเรื่องด่วน`, `Morning! You're at ${score} today. Nothing urgent.`);

  return (
    <div className="flex flex-col gap-8 px-5 pt-1">
      {/* Morning brief, spoken by Merchie */}
      <section className="flex items-end gap-2">
        <Mascot mood={scoreToMood(score)} variant={mascotStyle} outfit={outfit} size={80} className="shrink-0" />
        <motion.p
          initial={{ opacity: 0, scale: 0.9, x: -8 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          style={{ transformOrigin: "0% 100%" }}
          className="mb-5 flex-1 rounded-[22px] rounded-bl-[8px] bg-surface px-4 py-3 text-[14px] leading-relaxed shadow-soft"
        >
          {brief}
        </motion.p>
      </section>

      {suspended && (
        <Link
          href="/shield"
          className="pressable chrome flex items-center gap-4 rounded-card bg-surface p-4 shadow-soft ring-2 ring-danger/40"
        >
          <PlatformLogo id="shopee" size={44} className="rounded-[12px]" />
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">{tr(incident.title)}</span>
            <span className="block text-[13px] text-muted">{tr(incident.sub)}</span>
          </span>
          <ChevronRight className="size-5 text-subtle" />
        </Link>
      )}

      <AlertGroup title={t("วันนี้", "Today")} items={today} onOpen={setActive} />
      <AlertGroup title={t("ก่อนหน้า", "Earlier")} items={earlier} onOpen={setActive} />

      <IssueSheet issue={active} onClose={() => setActive(null)} />
    </div>
  );
}

function AlertGroup({ title, items, onOpen }: { title: string; items: Issue[]; onOpen: (i: Issue) => void }) {
  const { t, tr } = useLang();
  if (items.length === 0) return null;
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className="overflow-hidden rounded-card bg-surface shadow-soft">
        {items.map((issue, i) => (
          <div key={issue.id}>
            {i > 0 && <div className="ml-[80px] h-px bg-line" />}
            <button
              onClick={() => onOpen(issue)}
              className="chrome flex w-full items-center gap-4 px-4 py-3 text-left transition-colors active:bg-glow"
            >
              <IssueLead issue={issue} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{tr(issue.title)}</span>
                <span className="block truncate text-[13px] text-muted">{tr(issue.sub)}</span>
              </span>
              <span className="self-start pt-1 text-[12px] text-muted">
                {issue.day === "earlier" ? t("เมื่อวาน", "Yesterday") : issue.time}
              </span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
