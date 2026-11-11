import { cn } from "@/lib/utils";

/**
 * The demo shop's profile picture, styled like a real indie skincare brand: a nude-blush
 * wash, a glossy cream jar with a rose lid, and a lowercase serif wordmark.
 * Stands in until the shop uploads its own logo.
 */
export function ShopAvatar({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("block shrink-0 rounded-full bg-surface p-[3px] shadow-lift", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" className="block size-full rounded-full" role="img" aria-label="ใสใส สกินแคร์">
        <defs>
          <radialGradient id="sa-bg" cx="0.35" cy="0.25" r="0.95">
            <stop offset="0" stopColor="#FFF8F3" />
            <stop offset="0.55" stopColor="#F7E4DA" />
            <stop offset="1" stopColor="#E9C9BC" />
          </radialGradient>
          <linearGradient id="sa-lid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E7A3AC" />
            <stop offset="1" stopColor="#B9636F" />
          </linearGradient>
          <linearGradient id="sa-jar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#F3E9E4" />
            <stop offset="0.35" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E8D9D2" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#sa-bg)" />

        {/* cream jar: soft shadow, glass body, rose lid, highlights */}
        <ellipse cx="32" cy="36.5" rx="12" ry="2" fill="#B07A6E" opacity="0.18" />
        <rect x="21" y="24" width="22" height="12.5" rx="4" fill="url(#sa-jar)" />
        <rect x="22.5" y="29.5" width="19" height="3.2" rx="1.6" fill="#F3D4D8" opacity="0.8" />
        <rect x="20" y="17" width="24" height="8" rx="3" fill="url(#sa-lid)" />
        <rect x="21.5" y="18.2" width="21" height="1.4" rx="0.7" fill="#FFFFFF" opacity="0.45" />
        <rect x="23.2" y="26" width="1.6" height="8.5" rx="0.8" fill="#FFFFFF" opacity="0.9" />
        {/* sparkle */}
        <path d="M47 15 q0 3 3 3 q-3 0 -3 3 q0 -3 -3 -3 q3 0 3 -3z" fill="#FFFFFF" />

        {/* wordmark */}
        <text
          x="32"
          y="48.5"
          textAnchor="middle"
          fontSize="11.5"
          fontStyle="italic"
          fontWeight="600"
          fontFamily="Georgia, 'Times New Roman', serif"
          fill="#8A4652"
        >
          saisai
        </text>
        <text x="32" y="55" textAnchor="middle" fontSize="3.8" fontWeight="700" letterSpacing="1.3" fill="#B98089">
          SKINCARE
        </text>
      </svg>
    </span>
  );
}
