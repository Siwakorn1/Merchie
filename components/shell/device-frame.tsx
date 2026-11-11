import { FakeStatusBar } from "./fake-status-bar";
import { DesktopAside } from "./desktop-aside";

/**
 * Phones: renders children as-is (pure pass-through layout).
 * Wider than 500px: centers the same app inside an iPhone-like frame on a brand-blue
 * stage, with the mascot + QR beside it. Same code path; only this wrapper changes.
 *
 * The screen uses `transform: translateZ(0)` so anything `position: fixed` inside
 * (bottom sheets, toasts) is contained by the frame instead of the browser window.
 */
export function DeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="frame:fixed frame:inset-0 frame:flex frame:items-center frame:justify-center frame:gap-24 frame:overflow-hidden frame:bg-[radial-gradient(120%_90%_at_30%_10%,var(--stage-1)_0%,var(--stage-2)_45%,var(--stage-3)_100%)] frame:transition-[background] frame:duration-500">
      <DesktopAside />

      <div className="frame:relative frame:h-[min(844px,calc(100dvh-64px))] frame:w-[calc(min(844px,calc(100dvh-64px))*390/844)] frame:min-w-0 frame:shrink-0 frame:rounded-[58px] frame:bg-ink frame:p-[11px] frame:shadow-[0_40px_80px_-20px_rgb(10_10_10/0.45),inset_0_0_0_2px_rgb(255_255_255/0.08)]">
        <div id="app-screen" className="relative frame:h-full frame:overflow-hidden frame:rounded-[47px] frame:[transform:translateZ(0)] frame:[--safe-top:50px] frame:[--safe-bottom:22px]">
          <FakeStatusBar />
          {children}
          {/* home indicator */}
          <div className="pointer-events-none absolute bottom-2 left-1/2 z-40 hidden h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-ink frame:block" />
        </div>
      </div>
    </div>
  );
}
