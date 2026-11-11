import { ToastProvider } from "@/components/ui/toast";
import { PlanPickerProvider } from "@/components/ui/plan-picker";
import { CloudTransitionProvider } from "@/components/motion/cloud-transition";
import { ChatWidget } from "@/components/chat/chat-widget";
import { TabBar } from "./tab-bar";
import { TAB_BAR_HEIGHT } from "./tabs";
import { TopHeader } from "./top-header";
import { PullToRefresh } from "./pull-to-refresh";

/**
 * Native-feel shell: fixed header, fixed (floating) tab bar, only the middle scrolls.
 * Everything is positioned relative to this box (not the viewport), so the same
 * shell works full-screen on a phone and inside the desktop phone frame.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="sky relative flex h-dvh flex-col overflow-hidden frame:h-full">
      <CloudTransitionProvider>
      <ToastProvider>
      <PlanPickerProvider>
      <TopHeader />
      <PullToRefresh>
        {children}
        {/* Real spacer (not padding: iOS Safari can drop a scroller's bottom padding) so the last
            row always scrolls clear of the floating tab bar */}
        <div aria-hidden style={{ height: `calc(max(var(--safe-bottom), 14px) + ${TAB_BAR_HEIGHT + 32}px)` }} />
      </PullToRefresh>
      <TabBar />
      <ChatWidget />
      </PlanPickerProvider>
      </ToastProvider>
      </CloudTransitionProvider>
    </div>
  );
}
