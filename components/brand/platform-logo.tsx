import { cn } from "@/lib/utils";
import { BRAND_PATHS } from "./brand-paths";

export type PlatformId = "shopee" | "tiktok" | "lazada" | "instagram" | "facebook" | "line" | "shopify" | "web";

export const platformName: Record<PlatformId, string> = {
  shopee: "Shopee",
  tiktok: "TikTok Shop",
  lazada: "Lazada",
  instagram: "Instagram",
  facebook: "Facebook",
  line: "LINE SHOPPING",
  shopify: "Shopify",
  web: "Website",
};

const BG: Partial<Record<PlatformId, string>> = {
  shopee: "#EE4D2D",
  tiktok: "#000000",
  facebook: "#0866FF",
  line: "#06C755",
  shopify: "#7AB55C",
};

/**
 * Platform app-icon tiles: the official glyph (Simple Icons, CC0) in white on the brand
 * color. Lazada isn't in Simple Icons: its official heart mark comes from Wikimedia Commons
 * (public/brands/lazada.svg, public domain). Nominative use only.
 */
export function PlatformLogo({ id, size = 28, className }: { id: PlatformId; size?: number; className?: string }) {
  // the 24-unit glyph sits in a 32-unit tile with padding
  const glyph = (path: string, fill = "#fff", dx = 0, dy = 0) => (
    <path d={path} fill={fill} transform={`translate(${7 + dx} ${7 + dy}) scale(0.75)`} />
  );

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role="img"
      aria-label={platformName[id]}
    >
      {BG[id] && <rect width="32" height="32" rx="9" fill={BG[id]} />}

      {id === "shopee" && glyph(BRAND_PATHS.shopee)}
      {id === "facebook" && glyph(BRAND_PATHS.facebook)}
      {id === "line" && glyph(BRAND_PATHS.line)}
      {id === "shopify" && glyph(BRAND_PATHS.shopify)}
      {id === "tiktok" && (
        <>
          {/* the cyan / red offset that makes TikTok's mark */}
          {glyph(BRAND_PATHS.tiktok, "#25F4EE", -0.6, -0.6)}
          {glyph(BRAND_PATHS.tiktok, "#FE2C55", 0.6, 0.6)}
          {glyph(BRAND_PATHS.tiktok)}
        </>
      )}
      {id === "instagram" && (
        <>
          <defs>
            <radialGradient id="ig-bg" cx="0.3" cy="1.07" r="1.25">
              <stop offset="0" stopColor="#FFDD55" />
              <stop offset="0.1" stopColor="#FFDD55" />
              <stop offset="0.5" stopColor="#FF543E" />
              <stop offset="1" stopColor="#C837AB" />
            </radialGradient>
          </defs>
          <rect width="32" height="32" rx="9" fill="url(#ig-bg)" />
          {glyph(BRAND_PATHS.instagram)}
        </>
      )}
      {id === "lazada" && (
        // official heart mark (Wikimedia Commons, public domain) on a white tile, like the app icon
        <>
          <rect width="32" height="32" rx="9" fill="#FFFFFF" />
          <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" stroke="#000083" strokeOpacity="0.08" />
          <image href="/brands/lazada.svg" x="5" y="7" width="22" height="18" preserveAspectRatio="xMidYMid meet" />
        </>
      )}
      {id === "web" && (
        <>
          <rect width="32" height="32" rx="9" fill="#ECF8FD" />
          <circle cx="16" cy="16" r="7.5" fill="none" stroke="#1B6FD8" strokeWidth="1.8" />
          <path
            d="M8.5 16h15M16 8.5c2.2 2.1 3.2 4.6 3.2 7.5s-1 5.4-3.2 7.5c-2.2-2.1-3.2-4.6-3.2-7.5s1-5.4 3.2-7.5z"
            fill="none"
            stroke="#1B6FD8"
            strokeWidth="1.6"
          />
        </>
      )}
    </svg>
  );
}
