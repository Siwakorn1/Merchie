"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, X } from "lucide-react";
import { Mascot } from "@/components/mascot/mascot";
import { useCiteLine } from "@/components/legal/citation-list";
import { TAB_BAR_HEIGHT } from "@/components/shell/tabs";
import { answer, suggestions, type Reply } from "@/lib/content/chat-brain";
import { useDemo, useShopScore } from "@/lib/demo-store";
import { scoreToMood } from "@/lib/health/status";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PlanBadge } from "@/components/ui/plan-badge";
import { PlanOffer } from "@/components/ui/plan-offer";

type Msg = {
  id: number;
  from: "me" | "merchie";
  text: string;
  reply?: Reply;
  typing?: boolean;
};

const ABOVE_TAB_BAR = `calc(max(var(--safe-bottom), 14px) + ${TAB_BAR_HEIGHT + 12}px)`;

/** Floating "Ask Merchie" chat, bottom-right above the tab bar. */
export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { mascotStyle, outfit, has } = useDemo();
  const pro = has("plus");
  const score = useShopScore();
  const { t } = useLang();

  // Fix-it keeps its main action at the bottom; don't cover it.
  const hidden = pathname.startsWith("/fix-it");

  return (
    <>
      <AnimatePresence>
        {!open && !hidden && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            onClick={() => setOpen(true)}
            aria-label={t("ถาม Merchie AI", "Ask Merchie AI")}
            className="pressable absolute right-4 z-40 grid size-14 place-items-center rounded-full bg-surface/70 shadow-lift ring-1 ring-surface/60 backdrop-blur-xl"
            style={{ bottom: ABOVE_TAB_BAR }}
          >
            <Mascot
              mood={scoreToMood(score)}
              variant={mascotStyle}
              outfit={outfit}
              size={44}
              interactive={false}
            />
            {!pro && (
              <PlanBadge
                plan="plus"
                small
                className="absolute -top-1 -right-1.5"
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && <ChatPanel onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const { lang, t } = useLang();
  const { health, openIssues, mascotStyle, outfit, has } = useDemo();
  const pro = has("plus");
  const score = useShopScore();
  const router = useRouter();
  const citeLine = useCiteLine();
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    {
      id: 0,
      from: "merchie",
      text: t(
        `หวัดดีน้า วันนี้ร้านเราได้ ${score} คะแนน อยากให้ช่วยเรื่องไหนบอกได้เลย`,
        `Hi hi! We're at ${score} today. What can I help with?`,
      ),
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setDraft("");
    setBusy(true);
    const replyId = nextId.current + 1;
    setMsgs((m) => [
      ...m,
      { id: nextId.current, from: "me", text: q },
      { id: replyId, from: "merchie", text: "", typing: true },
    ]);
    nextId.current += 2;

    const reply = answer(q, { lang, score, health, openIssues });
    // "thinking", then type the answer out
    setTimeout(() => {
      let i = 0;
      const step = Math.max(2, Math.round(reply.text.length / 40));
      const tick = setInterval(() => {
        i = Math.min(reply.text.length, i + step);
        const done = i >= reply.text.length;
        setMsgs((m) =>
          m.map((x) =>
            x.id === replyId
              ? {
                  ...x,
                  text: reply.text.slice(0, i),
                  typing: false,
                  reply: done ? reply : undefined,
                }
              : x,
          ),
        );
        if (done) {
          clearInterval(tick);
          setBusy(false);
        }
      }, 24);
    }, 650);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      style={{ transformOrigin: "100% 100%", bottom: ABOVE_TAB_BAR }}
      className="chrome absolute right-3 left-3 z-50 flex h-[min(68%,540px)] flex-col overflow-hidden rounded-[28px] bg-surface/85 shadow-lift ring-1 ring-surface/60 backdrop-blur-2xl"
      role="dialog"
      aria-label={t("ถาม Merchie AI", "Ask Merchie AI")}
    >
      {/* header */}
      <div className="flex items-center gap-2.5 border-b border-line/70 px-4 py-2.5">
        <Mascot
          mood="happy"
          variant={mascotStyle}
          outfit={outfit}
          size={36}
          interactive={false}
        />
        <span className="flex-1 text-[15px] font-bold">
          {t("ถาม Merchie AI", "Ask Merchie AI")}
        </span>
        <button
          onClick={onClose}
          aria-label={t("ปิด", "Close")}
          className="pressable grid size-11 place-items-center rounded-full text-muted"
        >
          <X className="size-5" strokeWidth={2.2} />
        </button>
      </div>

      {!pro ? (
        <ChatOffer onClose={onClose} />
      ) : (
        <>
          {/* messages */}
          <div
            ref={listRef}
            className="no-scrollbar flex flex-1 flex-col gap-2.5 overflow-y-auto px-3.5 py-3"
          >
            {msgs.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col",
                  m.from === "me" ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-[20px] px-3.5 py-2.5 text-[14px] leading-relaxed select-text",
                    m.from === "me"
                      ? "rounded-br-[6px] bg-ocean text-white"
                      : "rounded-bl-[6px] bg-canvas text-ink",
                  )}
                >
                  {m.typing ? <Typing /> : m.text}
                </div>

                {m.reply?.cites && (
                  <p className="mt-1 max-w-[85%] px-1 text-[11px] leading-snug text-muted">
                    {m.reply.cites.map((c) => (
                      <span key={c} className="block">
                        {citeLine(c)}
                      </span>
                    ))}
                  </p>
                )}
                {m.reply?.legal && (
                  <p className="px-1 text-[11px] text-subtle">
                    {t("ไม่ใช่คำปรึกษาทางกฎหมาย", "Not legal advice")}
                  </p>
                )}
                {m.reply?.action && (
                  <button
                    onClick={() => {
                      onClose();
                      router.push(m.reply!.action!.href);
                    }}
                    className="pressable mt-1.5 h-9 rounded-full bg-glow px-3.5 text-[13px] font-semibold text-ocean"
                  >
                    {m.reply.action.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* suggestions (only before the first question) */}
          {msgs.length === 1 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-3.5 pb-2">
              {suggestions[lang].map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="pressable h-9 shrink-0 rounded-full bg-surface px-3.5 text-[13px] font-medium text-ocean shadow-soft"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="flex items-center gap-2 border-t border-line/70 p-2.5"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("พิมพ์คำถาม…", "Ask something…")}
              enterKeyHint="send"
              className="h-11 min-w-0 flex-1 rounded-full bg-canvas px-4 text-[16px] outline-none placeholder:text-subtle"
            />
            <button
              type="submit"
              disabled={!draft.trim() || busy}
              aria-label={t("ส่ง", "Send")}
              className="pressable grid size-11 shrink-0 place-items-center rounded-full bg-ocean text-white transition-opacity disabled:opacity-40"
            >
              <ArrowUp className="size-5" strokeWidth={2.6} />
            </button>
          </form>
        </>
      )}
    </motion.div>
  );
}

/** Three soft bouncing dots while Merchie "thinks". */
function Typing() {
  return (
    <span className="flex h-5 items-center gap-1" aria-label="…">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted"
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

/** Merchie chat is a Care feature: the shared offer, shown inside the chat panel. */
function ChatOffer({ onClose }: { onClose: () => void }) {
  const { mascotStyle } = useDemo();
  const { t } = useLang();
  return (
    <div className="no-scrollbar flex flex-1 flex-col justify-center overflow-y-auto px-6 pt-4 pb-5">
      <PlanOffer
        need="plus"
        look={mascotStyle}
        mascotSize={130}
        title={t("ถาม Merchie AI สำหรับ Care", "Ask Merchie AI is a Care feature")}
        body={t(
          "คุยกับ Merchie ได้ทุกเรื่องของร้าน ตอบจากข้อมูลร้านจริง พร้อมอ้างอิงกฎหมาย",
          "Chat about anything in your shop, answered from your real data with legal sources",
        )}
        onLater={onClose}
      />
    </div>
  );
}
