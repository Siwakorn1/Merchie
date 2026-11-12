"use client";

import { AiMark } from "@/components/ui/ai-mark";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { IssueLead, Marked, SectionTitle } from "@/components/health/issue-list";
import { MarketListing, MarketReview } from "@/components/fixit/market-mock";
import { LegalNote } from "@/components/legal/citation-list";
import { Mascot, type MascotStyle } from "@/components/mascot/mascot";
import { PlanBadge } from "@/components/ui/plan-badge";
import { ScoreRing } from "@/components/health/score-ring";
import { ProGate } from "@/components/ui/pro-gate";
import { TaxTool } from "@/components/fixit/tools/tax-tool";
import { CrisisTool } from "@/components/fixit/tools/crisis-tool";
import { CheckerTool } from "@/components/fixit/tools/checker-tool";
import { LiveTool } from "@/components/fixit/tools/live-tool";
import { ScriptTool } from "@/components/fixit/tools/script-tool";
import { CfTool } from "@/components/fixit/tools/cf-tool";
import { ResellerTool } from "@/components/fixit/tools/reseller-tool";
import { useToast } from "@/components/ui/toast";
import { jobs, JOB_ALIASES, type Job, type ListingJob, type ReplyJob } from "@/lib/content/fixit";
import { issues } from "@/lib/content/issues";
import { useCiteLine } from "@/components/legal/citation-list";
import { useLang } from "@/lib/i18n";
import { useDemo } from "@/lib/demo-store";
import { FIX_LIMIT, PLAN_NAME, type Plan } from "@/lib/plans";
import { computeHealth } from "@/lib/health/score";
import { useCloudTransition } from "@/components/motion/cloud-transition";
import { cn } from "@/lib/utils";

/**
 * Fix-it is two levels: a list of everything that needs fixing, then one fix at a time.
 * ?job=<issue id> opens a fix; no param shows the list.
 */
type ToolId = "live" | "script" | "cf" | "resellers" | "tax" | "crisis" | "checker";

export function FixItScreen() {
  const params = useSearchParams();
  const raw = params.get("job");
  const jobId = raw ? (JOB_ALIASES[raw] ?? raw) : null;
  const job = jobId ? jobs[jobId] : undefined;
  const toolId = params.get("tool") as ToolId | null;
  const tool = toolId && TOOLS.some((x) => x.id === toolId) ? toolId : null;
  const key = job?.issueId ?? (tool ? `tool-${tool}` : "list");
  const deep = !!job || !!tool;

  return (
    <div className="overflow-x-clip px-5 pt-1">
      <AnimatePresence mode="wait" initial={false} custom={deep ? 1 : -1}>
        <motion.div
          key={key}
          custom={deep ? 1 : -1}
          variants={{
            enter: (dir: number) => ({ opacity: 0, x: dir * 60 }),
            center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
            exit: (dir: number) => ({ opacity: 0, x: dir * -60, transition: { duration: 0.18, ease: [0.55, 0, 1, 0.45] } }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {job ? <JobDetail job={job} /> : tool ? <ToolDetail id={tool} /> : <FixList />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ list */

function FixList() {
  const { openIssues, resolved, plan, fixesUsed } = useDemo();
  const fixesLeft = Math.max(0, FIX_LIMIT.plus - fixesUsed);
  const { t, tr } = useLang();
  const router = useRouter();
  const todo = openIssues.filter((i) => jobs[i.id]);
  const done = issues.filter((i) => resolved.includes(i.id) && jobs[i.id]);

  const kindLabel = (id: string) =>
    jobs[id].kind === "listing" ? t("แก้ listing", "Edit listing") : t("ตอบรีวิว", "Reply");

  return (
    <div className="flex flex-col gap-8">
      {todo.length > 0 ? (
        <section>
          <div className="flex items-center justify-between">
            <SectionTitle>{t("รอแก้", "To fix")}</SectionTitle>
            {plan === "plus" && (
              <span className="-mt-2 flex items-center gap-2 text-[13px] text-muted">
                {t(`เหลือ ${fixesLeft}/${FIX_LIMIT.plus} เดือนนี้`, `${fixesLeft}/${FIX_LIMIT.plus} left this month`)}
                <ScoreRing
                  score={(fixesLeft / FIX_LIMIT.plus) * 100}
                  size={22}
                  stroke={3.5}
                  showNumber={false}
                  status={fixesLeft > 1 ? "good" : fixesLeft === 1 ? "watch" : "danger"}
                />
              </span>
            )}
          </div>
          <div className="overflow-hidden rounded-card bg-surface shadow-soft">
            {todo.map((issue, i) => (
              <div key={issue.id}>
                {i > 0 && <div className="ml-[80px] h-px bg-line" />}
                <button
                  onClick={() => router.push(`/fix-it?job=${issue.id}`)}
                  className="chrome flex w-full items-center gap-4 px-4 py-3 text-left transition-colors active:bg-glow"
                >
                  <IssueLead issue={issue} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{tr(issue.title)}</span>
                    <span className="block truncate text-[13px] text-muted">{tr(issue.sub)}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-ocean">
                    <AiMark />
                    {kindLabel(issue.id)}
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-subtle" />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <AllDone />
      )}

      <ToolsSection />

      {done.length > 0 && (
        <section>
          <SectionTitle>{t("แก้แล้ว", "Fixed")}</SectionTitle>
          <div className="overflow-hidden rounded-card bg-surface shadow-soft">
            {done.map((issue, i) => (
              <div key={issue.id}>
                {i > 0 && <div className="ml-[80px] h-px bg-line" />}
                <button
                  onClick={() => router.push(`/fix-it?job=${issue.id}`)}
                  className="chrome flex w-full items-center gap-4 px-4 py-3 text-left opacity-70 transition-colors active:bg-glow"
                >
                  <IssueLead issue={{ ...issue, status: "good" }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{tr(issue.title)}</span>
                    <span className="block truncate text-[13px] text-muted">{tr(issue.sub)}</span>
                  </span>
                  <Check className="size-5 shrink-0 text-good-ink" strokeWidth={2.6} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function AllDone() {
  const { mascotStyle, outfit } = useDemo();
  const { t } = useLang();
  return (
    <section className="flex flex-col items-center rounded-card bg-surface px-6 py-8 text-center shadow-soft">
      <Mascot mood="delighted" variant={mascotStyle} outfit={outfit} size={130} />
      <p className="mt-3 text-[17px] font-bold">{t("แก้ครบทุกเรื่องแล้ว!", "Everything's fixed!")}</p>
      <p className="mt-1 text-[14px] text-muted">{t("วันนี้ร้านดูดีมากเลย", "The shop looks great today")}</p>
    </section>
  );
}

/* ----------------------------------------------------------------- tools */

const TOOLS: { id: ToolId; title: [string, string]; sub: [string, string]; need: Plan | null; ai: boolean; look: MascotStyle }[] = [
  {
    id: "live",
    title: ["Live analysis", "Live analysis"],
    sub: ["AI ฟังไลฟ์ และชี้คำพูดเสี่ยง", "AI listens to your live and flags risky lines"],
    need: "pro",
    ai: true,
    look: "guardian",
  },
  {
    id: "script",
    title: ["Script check", "Script check"],
    sub: ["ตรวจสคริปต์ไลฟ์และคลิปก่อนพูด", "Vet live and clip scripts before you say them"],
    need: "pro",
    ai: true,
    look: "jelly",
  },
  {
    id: "resellers",
    title: ["ตรวจ listing ตัวแทน", "Reseller listings"],
    sub: ["หาคำเสี่ยงใน listing ของตัวแทนขาย", "Find risky claims in resellers' listings"],
    need: "business",
    ai: true,
    look: "guardian",
  },
  {
    id: "cf",
    title: ["CF data", "CF data"],
    sub: ["รวมยอด CF จากไลฟ์เป็นออเดอร์", "Turn live CF comments into orders"],
    need: "pro",
    ai: false,
    look: "money",
  },
  {
    id: "tax",
    title: ["ภาษีร้านออนไลน์", "Online-shop tax"],
    sub: ["คำนวณภาษี ลดหย่อน และกำหนดยื่น", "Estimate, deductions and deadlines"],
    need: "pro",
    ai: true,
    look: "money",
  },
  {
    id: "crisis",
    title: ["รับมือดราม่า", "Crisis mode"],
    sub: ["ร่างโพสต์ชี้แจงและแผน 24 ชม.", "Statement draft and a 24-hour plan"],
    need: "pro",
    ai: true,
    look: "guardian",
  },
  {
    id: "checker",
    title: ["ตรวจข้อความก่อนโพสต์", "Check copy before posting"],
    sub: ["หาคำเสี่ยงผิดกฎหมายในโฆษณา", "Find risky claims in your ads"],
    need: null,
    ai: false,
    look: "jelly",
  },
];

function ToolsSection() {
  const { t } = useLang();
  const router = useRouter();
  return (
    <section>
      <SectionTitle>{t("เครื่องมือช่วยร้าน", "Shop tools")}</SectionTitle>
      <div className="overflow-hidden rounded-card bg-surface shadow-soft">
        {TOOLS.map((tool, i) => (
          <button
            key={tool.id}
            onClick={() => router.push(`/fix-it?tool=${tool.id}`)}
            className={cn(
              "chrome flex min-h-[64px] w-full items-center gap-3 px-5 py-3 text-left transition-colors active:bg-glow",
              i > 0 && "border-t border-line",
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-[15px] font-semibold">
                {t(...tool.title)}
                {tool.ai && <AiMark className="text-[13px]" />}
                {tool.need && <PlanBadge plan={tool.need} small />}
              </span>
              <span className="block truncate text-[13px] text-muted">{t(...tool.sub)}</span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-subtle" />
          </button>
        ))}
      </div>
    </section>
  );
}

function ToolDetail({ id }: { id: ToolId }) {
  const router = useRouter();
  const { t, tr } = useLang();
  const tool = TOOLS.find((x) => x.id === id)!;
  const body =
    id === "live" ? (
      <LiveTool />
    ) : id === "script" ? (
      <ScriptTool />
    ) : id === "cf" ? (
      <CfTool />
    ) : id === "resellers" ? (
      <ResellerTool />
    ) : id === "tax" ? (
      <TaxTool />
    ) : id === "crisis" ? (
      <CrisisTool />
    ) : (
      <CheckerTool />
    );
  return (
    <>
      <button
        onClick={() => router.push("/fix-it")}
        className="pressable -ml-1.5 flex h-11 items-center gap-0.5 pr-3 text-[15px] font-semibold text-ocean"
      >
        <ChevronLeft className="size-5" strokeWidth={2.4} />
        {t("ทั้งหมด", "All fixes")}
      </button>
      <h2 className="mt-1 mb-4 flex items-center gap-2 px-1 text-[19px] font-bold tracking-tight">
        {t(...tool.title)}
        {tool.need && <PlanBadge plan={tool.need} small />}
      </h2>
      {tool.need && tool.need !== "free" ? (
        <ProGate
          need={tool.need}
          look={tool.look}
          title={t(`${tool.title[0]} มากับ ${tr(PLAN_NAME[tool.need])}`, `${tool.title[1]} comes with ${tr(PLAN_NAME[tool.need])}`)}
          body={t(...tool.sub)}
        >
          {body}
        </ProGate>
      ) : (
        body
      )}
    </>
  );
}

/* ---------------------------------------------------------------- detail */

function JobDetail({ job }: { job: Job }) {
  const router = useRouter();
  const { t, tr } = useLang();
  const issue = issues.find((i) => i.id === job.issueId)!;
  const { plan, fixesUsed, resolved } = useDemo();
  // Check up: fixes come with Care. Care: FIX_LIMIT.plus a month, then Coach (unlimited). Done fixes stay viewable.
  const done = resolved.includes(job.issueId);
  const careUsedUp = plan === "plus" && fixesUsed >= FIX_LIMIT.plus && !done;
  const need: Exclude<Plan, "free"> = careUsedUp ? "pro" : "plus";
  return (
    <>
      <button
        onClick={() => router.push("/fix-it")}
        className="pressable -ml-1.5 flex h-11 items-center gap-0.5 pr-3 text-[15px] font-semibold text-ocean"
      >
        <ChevronLeft className="size-5" strokeWidth={2.4} />
        {t("ทั้งหมด", "All fixes")}
      </button>
      <h2 className="mt-1 mb-4 px-1 text-[19px] font-bold tracking-tight">{tr(issue.title)}</h2>
      <ProGate
        key={need}
        need={need}
        look="jelly"
        title={
          careUsedUp
            ? t(`ใช้ Fix-it ครบ ${FIX_LIMIT.plus} ครั้งเดือนนี้แล้ว`, `All ${FIX_LIMIT.plus} fixes used this month`)
            : t(`AI แก้ให้ด้วยปุ่มเดียว มากับ ${tr(PLAN_NAME.plus)}`, `One-tap AI fixes come with ${tr(PLAN_NAME.plus)}`)
        }
        body={
          careUsedUp
            ? t(`${tr(PLAN_NAME.pro)} แก้ได้ไม่จำกัด`, `${tr(PLAN_NAME.pro)} gives you unlimited fixes`)
            : job.kind === "listing"
              ? t("Merchie เขียน listing ใหม่ให้ถูกกฎหมาย พร้อมอ้างข้อกฎหมาย", "Merchie rewrites the listing to be legal, citing the law")
              : t("Merchie ร่างคำตอบลูกค้าที่ปลอดภัยทางกฎหมายให้", "Merchie drafts a legally safe reply")
        }
      >
        {job.kind === "listing" ? <ListingFix job={job} /> : <ReplyFix job={job} />}
      </ProGate>
    </>
  );
}

/* ------------------------------------------------------------ celebrate */

/** Resolve an issue behind a cloud wipe, then land back on the Fix-it list for the next one. */
function useCelebrate() {
  const { resolved, resolve, health } = useDemo();
  const cloud = useCloudTransition();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLang();
  return (issueId: string, toastTitle: string, toastBody: string) => {
    const after = computeHealth([...resolved, issueId]).score;
    cloud({
      mood: "happy",
      caption: `${t("คะแนน", "Score")} ${health.score} → ${after}`,
      onCovered: () => {
        resolve(issueId);
        router.push("/fix-it");
      },
    });
    setTimeout(() => toast(toastTitle, toastBody), 1700);
  };
}

/* ---------------------------------------------------------------- listing */

function ListingFix({ job }: { job: ListingJob }) {
  const { resolved } = useDemo();
  const celebrate = useCelebrate();
  const done = resolved.includes(job.issueId);
  const { t, tr } = useLang();
  const citeLine = useCiteLine();
  const listing = { kind: job.product, name: job.name, price: job.price, sold: job.sold, rating: job.rating };

  return (
    <>
      {/* the listing exactly as buyers see it today… */}
      <MarketListing {...listing} tag={t("ตอนนี้", "Now")} tone="risk" dim={done}>
        <span className={cn(done && "text-subtle line-through")}>
          <Marked text={job.before} marks={done ? [] : job.risky} />
        </span>
      </MarketListing>

      {/* …and how it will look with Merchie's version */}
      <div className="mt-3">
        <MarketListing {...listing} tag={t("Merchie AI แนะนำ", "Merchie AI suggests")} tone="suggest">
          <Added text={job.after} parts={job.added} />
        </MarketListing>
      </div>

      <h3 className="mt-7 mb-3 px-1 text-[15px] font-bold">{t("เปลี่ยนอะไรบ้าง", "What changed")}</h3>
      <ul className="overflow-hidden rounded-card bg-surface shadow-soft">
        {job.changes.map((c, i) => (
          <li key={c.text} className={cn("px-4 py-3.5", i > 0 && "border-t border-line")}>
            <p className="text-[14px] font-semibold">
              {c.kind === "remove" ? (
                <span className="text-danger-ink line-through decoration-2">{c.text}</span>
              ) : (
                <span className="text-good-ink">+ {c.text}</span>
              )}
            </p>
            <p className="mt-0.5 text-[14px] text-muted">{tr(c.why)}</p>
            <p className="mt-0.5 text-[12px] text-muted">{citeLine(c.cite)}</p>
          </li>
        ))}
      </ul>

      <LegalNote />

      <StickyAction>
        <PrimaryButton
          done={done}
          doneLabel={t("อัปเดต listing แล้ว", "Listing updated")}
          onClick={() =>
            celebrate(
              job.issueId,
              t("อัปเดต listing แล้ว", "Listing updated"),
              t("เก็บก่อน-หลังไว้ใน Evidence Vault", "Before and after saved to Evidence Vault"),
            )
          }
        >
          {t("ใช้ข้อความนี้", "Use this text")}
        </PrimaryButton>
      </StickyAction>
    </>
  );
}

/* ------------------------------------------------------------------ reply */

function ReplyFix({ job }: { job: ReplyJob }) {
  const { resolved, mascotStyle, outfit } = useDemo();
  const celebrate = useCelebrate();
  const sent = resolved.includes(job.issueId);
  const [polished, setPolished] = useState(sent);
  const { t, tr } = useLang();
  const citeLine = useCiteLine();

  return (
    <>
      {/* the review as it appears in the app; the polished reply shows up as the seller's response */}
      <MarketReview
        buyer={job.buyer}
        stars={job.stars}
        text={job.text}
        variation={job.variation}
        date={tr(job.date)}
        reply={
          polished ? (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              {job.reply}
            </motion.span>
          ) : undefined
        }
      />

      <AnimatePresence mode="wait" initial={false}>
        {!polished ? (
          <motion.div key="draft" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            <Card label={t("ร่างของคุณ", "Your draft")} className="mt-3">
              <p className="text-[15px] leading-relaxed">{job.ownerDraft}</p>
            </Card>
            <StickyAction>
              <button
                onClick={() => setPolished(true)}
                className="pressable flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ocean text-[15px] font-semibold text-white shadow-lift"
              >
                <Mascot size={30} variant={mascotStyle} outfit={outfit} interactive={false} />
                <AiMark light className="mr-1" />
                {t("ให้ Merchie AI เกลา", "Polish with Merchie AI")}
              </button>
            </StickyAction>
          </motion.div>
        ) : (
          <motion.div key="polished" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="mt-7 mb-3 px-1 text-[15px] font-bold">
              {t("ตัดออก", "Removed")} <span className="num text-subtle">{job.removed.length}</span>
            </h3>
            <ul className="overflow-hidden rounded-card bg-surface shadow-soft">
              {job.removed.map((r, i) => (
                <motion.li
                  key={r.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.12 }}
                  className={cn("px-4 py-3.5", i > 0 && "border-t border-line")}
                >
                  <p className="text-[14px] leading-snug text-subtle line-through decoration-danger/60">“{r.text}”</p>
                  <p className="mt-1 text-[14px] font-semibold text-danger-ink">{tr(r.why)}</p>
                  {r.cite && <p className="text-[12px] text-muted">{citeLine(r.cite)}</p>}
                </motion.li>
              ))}
            </ul>

            <LegalNote />

            <StickyAction>
              <PrimaryButton
                done={sent}
                doneLabel={t("ตอบรีวิวแล้ว", "Reply sent")}
                onClick={() =>
                  celebrate(
                    job.issueId,
                    t("ตอบรีวิวแล้ว", "Reply sent"),
                    t("เก็บคำตอบไว้ใน Evidence Vault แล้ว", "Reply saved to Evidence Vault"),
                  )
                }
              >
                {t("ส่งคำตอบ", "Send reply")}
              </PrimaryButton>
            </StickyAction>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------- pieces */

function Card({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-card bg-surface p-4 shadow-soft", className)}>
      <p className="mb-1.5 text-[12px] font-semibold text-muted">{label}</p>
      {children}
    </div>
  );
}

function Added({ text, parts }: { text: string; parts: string[] }) {
  const re = new RegExp(`(${parts.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return (
    <>
      {text.split(re).map((p, k) =>
        parts.includes(p) ? (
          <mark key={k} className="rounded-[4px] bg-good-soft px-0.5 text-good-ink">
            {p}
          </mark>
        ) : (
          <span key={k}>{p}</span>
        ),
      )}
    </>
  );
}


/** Keeps the main action reachable above the tab bar while reading. */
function StickyAction({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky z-10 mt-6" style={{ bottom: "calc(max(var(--safe-bottom), 14px) + 72px)" }}>
      {children}
    </div>
  );
}

function PrimaryButton({
  done,
  doneLabel,
  onClick,
  children,
}: {
  done: boolean;
  doneLabel: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      disabled={done}
      onClick={onClick}
      className={cn(
        "pressable flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold shadow-lift transition-colors",
        done ? "bg-good-soft text-good-ink shadow-none" : "bg-ocean text-white",
      )}
    >
      {done && <Check className="size-5" strokeWidth={2.6} />}
      {done ? doneLabel : children}
    </button>
  );
}
