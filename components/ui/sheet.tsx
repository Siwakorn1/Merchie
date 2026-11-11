"use client";

import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

/**
 * iOS-style bottom sheet (vaul). Portals into #app-screen so that on desktop it
 * stays inside the phone frame (the frame's transform contains `position: fixed`).
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const container = typeof document !== "undefined" ? document.getElementById("app-screen") : null;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} container={container}>
      <Drawer.Portal container={container}>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-ink/30" />
        <Drawer.Content
          className={cn(
            "chrome fixed inset-x-0 bottom-0 z-50 flex max-h-[90%] flex-col rounded-t-[32px] bg-surface outline-none",
            className,
          )}
        >
          <div className="mx-auto mt-2.5 h-[5px] w-10 shrink-0 rounded-full bg-line" />
          {title ? (
            <Drawer.Title className="shrink-0 px-6 pt-4 text-[19px] font-bold tracking-tight">{title}</Drawer.Title>
          ) : (
            <Drawer.Title className="sr-only">Details</Drawer.Title>
          )}
          <Drawer.Description className="sr-only">{title ?? "Details"}</Drawer.Description>
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6">{children}</div>
          {footer && (
            <div className="shrink-0 px-6 pt-2" style={{ paddingBottom: "max(var(--safe-bottom), 16px)" }}>
              {footer}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/** Small section heading used inside sheets. */
export function SheetLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 mb-2.5 text-[14px] font-semibold text-muted first:mt-0">{children}</h3>;
}
