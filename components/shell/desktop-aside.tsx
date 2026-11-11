"use client";

import { useSyncExternalStore } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Mascot } from "@/components/mascot/mascot";
import { useLang } from "@/lib/i18n";

const subscribe = () => () => {};

/** Desktop-only side panel next to the phone frame: mascot, name, tagline, QR. */
export function DesktopAside() {
  const { t } = useLang();
  // The QR points at whatever URL this page is served from (LAN IP in dev, Vercel in prod).
  const url = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "",
  );

  return (
    <aside className="chrome hidden w-[300px] flex-col items-start text-white lg:flex">
      <Mascot mood="happy" size={190} className="-ml-4" />
      <h2 className="mt-8 text-[44px] leading-none font-bold tracking-tight">Merchie</h2>
      <p className="mt-3 text-xl font-medium text-white/85">{t("ร้านดูดี ลูกค้าไว้ใจ", "Look good. Earn trust.")}</p>

      <div className="mt-10 flex items-center gap-4 rounded-[24px] bg-white p-3 pr-5 text-[#0A0A0A] shadow-lift">
        <div className="grid size-[104px] place-items-center rounded-[16px] bg-white">
          {url && <QRCodeSVG value={url} size={96} fgColor="#0A0A0A" bgColor="#FFFFFF" level="M" />}
        </div>
        <p className="text-[14px] leading-snug font-semibold">
          {t("สแกนเพื่อลอง", "Scan to try")}
          <br />
          {t("บนมือถือ", "on your phone")}
        </p>
      </div>
    </aside>
  );
}
