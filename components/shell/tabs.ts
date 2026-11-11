import { l, type L } from "@/lib/i18n-core";
import { Bell, House, ShieldCheck, Store, WandSparkles, type LucideIcon } from "lucide-react";

/** Floating tab bar height in px. Lives here (not in the "use client" tab-bar) so server
 * components like AppShell get the number, not a client reference. */
export const TAB_BAR_HEIGHT = 60;

export type Tab = {
  href: "/" | "/alerts" | "/fix-it" | "/shield" | "/shop";
  label: L;
  title: L; // header title
  icon: LucideIcon;
};

export const tabs: Tab[] = [
  { href: "/", label: l("หน้าหลัก", "Home"), title: l("ใสใส สกินแคร์", "ใสใส สกินแคร์"), icon: House },
  { href: "/alerts", label: l("แจ้งเตือน", "Alerts"), title: l("แจ้งเตือน", "Alerts"), icon: Bell },
  { href: "/fix-it", label: l("Fix-it", "Fix-it"), title: l("Fix-it", "Fix-it"), icon: WandSparkles },
  { href: "/shield", label: l("Shield", "Shield"), title: l("Shield", "Shield"), icon: ShieldCheck },
  { href: "/shop", label: l("ร้าน", "Shop"), title: l("ร้าน", "Shop"), icon: Store },
];

export function activeTab(pathname: string): Tab {
  return (
    tabs.find((t) => (t.href === "/" ? pathname === "/" : pathname.startsWith(t.href))) ?? tabs[0]
  );
}
