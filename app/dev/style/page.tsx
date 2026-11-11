import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoreRing } from "@/components/health/score-ring";
import { ProductThumb } from "@/components/illustrations/product-thumb";
import type { Status } from "@/lib/health/status";

const brand = ["bg-ocean", "bg-deep", "bg-sky", "bg-haze", "bg-cloud", "bg-glow", "bg-ink"];

export default function StylePage() {
  return (
    <div className="sky relative min-h-dvh">
      <main className="relative mx-auto max-w-md px-5 pt-14 pb-20">
        <h1 className="text-[34px] leading-tight font-bold tracking-tight">Merchie</h1>

        {/* Status = ring length + ring color. No words, no bars. */}
        <Section title="คะแนน">
          <div className="grid grid-cols-3 gap-3">
            {[88, 72, 54].map((n) => (
              <div key={n} className="grid place-items-center rounded-card bg-surface py-5 shadow-soft">
                <ScoreRing score={n} size={84} stroke={7} />
              </div>
            ))}
          </div>
        </Section>

        {/* Rows start with the product; its thin ring carries urgency */}
        <Section title="เรื่องที่ควรแก้">
          <div className="overflow-hidden rounded-card bg-surface shadow-soft">
            <IssueRow title="คำโฆษณาเกินจริง" product="ครีมไวท์เทนนิ่ง 30 ml" status="danger" />
            <Divider inset={92} />
            <IssueRow title="รีวิว 1 ดาว ยังไม่ตอบ" product="ครีมไวท์เทนนิ่ง 30 ml" status="watch" />
          </div>
        </Section>

        <Section title="เช็คลิสต์">
          <div className="overflow-hidden rounded-card bg-surface shadow-soft">
            <CheckRow title="เลขจดแจ้ง อย." trailing={<span className="text-[15px] text-muted">มี.ค. 70</span>} />
            <Divider />
            <CheckRow title="ทะเบียนพาณิชย์" trailing={<Check className="size-5 text-good-ink" strokeWidth={2.5} />} />
            <Divider />
            <CheckRow
              title="ภาษีมูลค่าเพิ่ม"
              trailing={
                <span className="flex items-center gap-2">
                  <span className="num text-[15px] font-semibold">84%</span>
                  <ScoreRing score={84} status="watch" size={26} stroke={3.5} showNumber={false} />
                </span>
              }
            />
          </div>
        </Section>

        <Section title="ปุ่ม">
          <div className="flex flex-col gap-3">
            <button className="pressable h-14 rounded-full bg-ocean text-base font-semibold text-white shadow-lift">
              แก้ให้
            </button>
            <button className="pressable h-14 rounded-full bg-surface text-base font-semibold text-ocean shadow-soft">
              ดูรายละเอียด
            </button>
          </div>
        </Section>

        <Section title="สีแบรนด์">
          <div className="grid grid-cols-7 gap-2">
            {brand.map((cls) => (
              <div key={cls} className={cn("aspect-square rounded-[14px] shadow-soft", cls)} />
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="chrome mb-3 text-[15px] font-semibold text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Divider({ inset = 20 }: { inset?: number }) {
  return <div className="h-px bg-line" style={{ marginLeft: inset }} />;
}

function IssueRow({ title, product, status }: { title: string; product: string; status: Status }) {
  return (
    <button className="chrome flex w-full items-center gap-4 px-4 py-4 text-left transition-colors active:bg-glow">
      <ProductThumb urgent={status === "danger"} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold">{title}</span>
        <span className="block truncate text-sm text-muted">{product}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-subtle" />
    </button>
  );
}

function CheckRow({ title, trailing }: { title: string; trailing: React.ReactNode }) {
  return (
    <button className="chrome flex min-h-14 w-full items-center gap-3 px-5 text-left transition-colors active:bg-glow">
      <span className="flex-1 text-base font-medium">{title}</span>
      {trailing}
      <ChevronRight className="size-5 text-subtle" />
    </button>
  );
}
