"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Mascot } from "@/components/mascot/mascot";
import { CitationList, LegalNote } from "@/components/legal/citation-list";
import { useToast } from "@/components/ui/toast";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import {
  APP_BUILD,
  APP_VERSION,
  FAQ,
  LICENSES,
  PRIVACY,
  TERMS,
  WHATS_NEW,
  type AboutSection,
} from "@/lib/content/about";
import { cn } from "@/lib/utils";

type Page = "home" | "new" | "privacy" | "terms" | "help" | "licenses";

/** About, laid out like a shipped app's: icon and version, grouped rows, one page per row. */
export function AboutSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [page, setPage] = useState<Page>("home");
  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(() => setPage("home"), 300);
  };
  const deep = page !== "home";

  return (
    <Sheet open={open} onOpenChange={close}>
      <div className="overflow-x-clip">
        <AnimatePresence mode="wait" initial={false} custom={deep ? 1 : -1}>
          <motion.div
            key={page}
            custom={deep ? 1 : -1}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 40 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -40 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {page === "home" ? <Home go={setPage} /> : <SubPage page={page} back={() => setPage("home")} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Sheet>
  );
}

function Home({ go }: { go: (p: Page) => void }) {
  const { t } = useLang();
  const toast = useToast();
  const { mascotStyle } = useDemo();

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Merchie", text: t("ร้านดูดี ลูกค้าไว้ใจ", "Shop health, every day"), url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast(t("คัดลอกลิงก์แล้ว", "Link copied"));
    } catch {
      /* share sheet dismissed */
    }
  };

  return (
    <>
      {/* app identity */}
      <div className="flex flex-col items-center pt-1 text-center">
        <span className="grid size-[84px] place-items-center overflow-hidden rounded-[24px] bg-gradient-to-br from-sky to-ocean shadow-lift">
          <Mascot variant={mascotStyle} size={74} interactive={false} outfit={false} />
        </span>
        <p className="mt-3 text-[22px] leading-none font-bold tracking-tight">Merchie</p>
        <p className="mt-1.5 text-[13px] text-muted">
          {t("เวอร์ชัน", "Version")} {APP_VERSION} ({APP_BUILD})
        </p>
      </div>

      <Group>
        <Row label={t("มีอะไรใหม่", "What's new")} onClick={() => go("new")} />
        <Row
          label={t("ให้คะแนน Merchie", "Rate Merchie")}
          onClick={() => toast(t("ขอบคุณที่ช่วยให้คะแนนนะ", "Thanks for rating us"), t("จะเปิด App Store เมื่อขึ้นสโตร์แล้ว", "Opens the App Store once we're listed"))}
        />
        <Row label={t("แชร์ให้เพื่อนแม่ค้า", "Share with a seller friend")} onClick={share} />
      </Group>

      <Group>
        <Row label={t("ศูนย์ช่วยเหลือ", "Help center")} onClick={() => go("help")} />
        <Row
          label={t("ติดต่อทีม Merchie", "Contact the team")}
          trailing="LINE @merchie"
          onClick={() => toast(t("เปิดแชท LINE @merchie", "Opening LINE @merchie"))}
        />
      </Group>

      <Group>
        <Row label={t("ความเป็นส่วนตัวและข้อมูล", "Privacy and data")} onClick={() => go("privacy")} />
        <Row label={t("ข้อกำหนดการใช้งาน", "Terms of use")} onClick={() => go("terms")} />
        <Row label={t("ไลเซนส์โอเพนซอร์ส", "Open-source licenses")} onClick={() => go("licenses")} />
      </Group>

      <p className="mt-6 text-center text-[12px] leading-relaxed text-subtle">
        © 2569 Merchie
        <br />
        {t("ต้นแบบสำหรับ Chula LegalTech Y8", "Prototype for Chula LegalTech Y8")}
      </p>
    </>
  );
}

function SubPage({ page, back }: { page: Exclude<Page, "home">; back: () => void }) {
  const { t, tr } = useLang();
  const title = {
    new: t("มีอะไรใหม่", "What's new"),
    privacy: t("ความเป็นส่วนตัวและข้อมูล", "Privacy and data"),
    terms: t("ข้อกำหนดการใช้งาน", "Terms of use"),
    help: t("ศูนย์ช่วยเหลือ", "Help center"),
    licenses: t("ไลเซนส์โอเพนซอร์ส", "Open-source licenses"),
  }[page];

  return (
    <>
      <button
        onClick={back}
        className="pressable -ml-1.5 flex h-11 items-center gap-0.5 pr-3 text-[15px] font-semibold text-ocean"
      >
        <ChevronLeft className="size-5" strokeWidth={2.4} />
        {t("เกี่ยวกับ", "About")}
      </button>
      <h2 className="mt-1 mb-4 text-[19px] font-bold tracking-tight">{title}</h2>

      {page === "new" &&
        WHATS_NEW.map((r) => (
          <div key={r.version} className="mb-5">
            <p className="flex items-baseline justify-between">
              <span className="num text-[15px] font-bold">{r.version}</span>
              <span className="text-[13px] text-muted">{tr(r.date)}</span>
            </p>
            <ul className="mt-2 flex flex-col gap-2 rounded-[20px] bg-canvas px-4 py-3.5">
              {r.items.map((it) => (
                <li key={it.en} className="text-[14px] leading-snug">
                  {tr(it)}
                </li>
              ))}
            </ul>
          </div>
        ))}

      {page === "privacy" && <Sections items={PRIVACY} legal />}
      {page === "terms" && <Sections items={TERMS} legal />}

      {page === "help" && (
        <div className="flex flex-col gap-2">
          {FAQ.map((f) => (
            <Faq key={f.q.en} q={tr(f.q)} a={tr(f.a)} />
          ))}
        </div>
      )}

      {page === "licenses" && (
        <div className="overflow-hidden rounded-[20px] bg-canvas">
          {LICENSES.map((x, i) => (
            <div key={x.name} className={cn("flex min-h-12 items-center px-4", i > 0 && "border-t border-line")}>
              <span className="flex-1 text-[15px]">{x.name}</span>
              <span className="text-[13px] text-muted">{x.license}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Sections({ items, legal }: { items: AboutSection[]; legal?: boolean }) {
  const { tr } = useLang();
  const cites = [...new Set(items.flatMap((s) => s.cites ?? []))];
  return (
    <>
      <div className="flex flex-col gap-5">
        {items.map((s) => (
          <section key={s.heading.en}>
            <h3 className="text-[15px] font-bold">{tr(s.heading)}</h3>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">{tr(s.body)}</p>
          </section>
        ))}
      </div>
      {cites.length > 0 && (
        <div className="mt-6">
          <CitationList ids={cites} />
        </div>
      )}
      {legal && <LegalNote />}
    </>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      className="chrome w-full rounded-[20px] bg-canvas px-4 py-3.5 text-left"
    >
      <span className="flex items-center gap-3">
        <span className="flex-1 text-[15px] font-semibold">{q}</span>
        <ChevronRight className={cn("size-5 shrink-0 text-subtle transition-transform", open && "rotate-90")} />
      </span>
      <AnimatePresence initial={false}>
        {open && (
          <motion.span
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="block overflow-hidden"
          >
            <span className="block pt-2 text-[14px] leading-relaxed text-muted">{a}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 overflow-hidden rounded-[20px] bg-canvas [&>*+*]:border-t [&>*+*]:border-line">{children}</div>;
}

function Row({ label, trailing, onClick }: { label: string; trailing?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="chrome flex min-h-[52px] w-full items-center gap-3 px-4 text-left transition-colors active:bg-glow"
    >
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      {trailing && <span className="text-[13px] text-muted">{trailing}</span>}
      <ChevronRight className="size-5 text-subtle" />
    </button>
  );
}
