import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductKind } from "@/lib/content/issues";
import { PlatformLogo, type PlatformId } from "@/components/brand/platform-logo";

/**
 * Real product photos (free Pexels stock, no third-party branding; see public/products/CREDITS.md)
 * standing in for the shop's own listing images, which will come from the platform API.
 * `urgent` draws a thin status ring around the photo: the only priority signal in a list.
 */
const PHOTO: Record<ProductKind, string> = {
  jar: "/products/cream.jpg",
  dropper: "/products/serum.jpg",
  tube: "/products/sunscreen.jpg",
};
export function ProductThumb({
  kind = "jar",
  urgent = false,
  platform,
  size = 48,
  className,
}: {
  kind?: ProductKind;
  urgent?: boolean;
  /** small marketplace badge in the bottom-right corner */
  platform?: PlatformId;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative block shrink-0 rounded-[28%]",
        // urgent: a thin status ring around the image (a gap, then red), nothing stuck on top
        urgent && "ring-2 ring-danger ring-offset-2 ring-offset-surface",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={urgent ? "urgent" : undefined}
    >
      <Image
        src={PHOTO[kind]}
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        className="block size-full rounded-[28%] object-cover"
        draggable={false}
      />
      {/* where it's sold: tucked inside the image corner, not hanging off it */}
      {platform && (
        <PlatformLogo
          id={platform}
          size={Math.round(size * 0.3)}
          className="absolute right-1 bottom-1 block rounded-[6px] shadow-[0_1px_3px_rgb(0_0_0/0.18)]"
        />
      )}
    </span>
  );
}
