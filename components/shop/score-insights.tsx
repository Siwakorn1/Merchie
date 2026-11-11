"use client";

import { AiMark } from "@/components/ui/ai-mark";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ScoreRing } from "@/components/health/score-ring";
import { Mascot } from "@/components/mascot/mascot";
import { computeHealth, PART_MAX } from "@/lib/health/score";
import { scoreInk } from "@/lib/health/status";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import merchie from "@/mock/merchie/shop.json";

type Month = { month: string; score: number };

/** Share of same-category shops this score beats (normal approximation of the peer spread). */
function percentile(score: number) {
  const { avg, spread } = merchie.score_history.peers;
  const z = (score - avg) / spread;
  // logistic approximation of the normal CDF
  const p = 1 / (1 + Math.exp(-1.702 * z));
  return Math.round(Math.max(1, Math.min(99, p * 100)));
}

/**
 * What the months mean, in Merchie's words: how good the year was, how the shop
 * compares with similar shops, what's holding the score back, and what next month
 * could look like. Each piece is one tap from doing something about it.
 */
export function ScoreInsights({ history, onGo }: { history: Month[]; onGo: () => void }) {
  const { t, tr } = useLang();
  const router = useRouter();
  const { health, openIssues, resolved, mascotStyle } = useDemo();

  const avg = Math.round(history.reduce((s, m) => s + m.score, 0) / history.length);
  const first = history.slice(0, 3).reduce((s, m) => s + m.score, 0) / 3;
  const last = history.slice(-3).reduce((s, m) => s + m.score, 0) / 3;
  const trend = Math.round(last - first);
  const beats = percentile(avg);

  const verdict =
    avg >= 80
      ? t("ปีนี้ร้านแข็งแรงมาก", "A really healthy year")
      : avg >= 65
        ? t("ร้านดูแลดีเลย", "A well-kept shop")
        : avg >= 45
          ? t("ยังมีที่ให้ดีขึ้นอีกเยอะ", "Plenty of room to grow")
          : t("ปีนี้ร้านเหนื่อยหน่อย", "A tough year for the shop");
  const trendLine =
    trend >= 3
      ? t(`ดีขึ้น ${trend} คะแนนจากต้นปี`, `Up ${trend} since the start`)
      : trend <= -3
        ? t(`ลดลง ${-trend} คะแนนจากต้นปี`, `Down ${-trend} since the start`)
        : t("ทรงตัวทั้งปี", "Steady all year");

  // the part holding the score back the most, from today's live health
  const weakest = [...health.parts].sort((a, b) => a.score - b.score)[0];
  const lost = PART_MAX - weakest.score;
  // next month if every open issue gets fixed
  const target = computeHealth([...resolved, ...openIssues.map((i) => i.id)]).score;
  const gain = target - health.score;

  return (
    <div className="flex flex-col gap-3">
      {/* Merchie's verdict on the year */}
      <div className="flex items-center gap-3 rounded-[22px] bg-glow px-4 py-3.5">
        <Mascot variant={mascotStyle} size={56} interactive={false} mood={avg >= 65 ? "happy" : "okay"} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[15px] font-bold">
            {verdict}
            <AiMark className="text-[13px]" />
          </p>
          <p className="text-[13px] text-muted">{trendLine}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* yearly average */}
        <div className="rounded-[22px] bg-canvas px-4 py-3.5">
          <p className="text-[13px] text-muted">{t("เฉลี่ยทั้งปี", "Year average")}</p>
          <p className="num font-round mt-1 text-[32px] leading-none" style={{ color: scoreInk(avg) }}>
            {avg}
          </p>
        </div>
        {/* benchmark against similar shops: percentage inside the ring, label beside it */}
        <div className="flex flex-col items-center justify-center rounded-[22px] bg-canvas px-3 py-3 text-center">
          <ScoreRing score={beats} size={52} stroke={5}>
            <span className="num relative text-[13px] font-bold">{beats}%</span>
          </ScoreRing>
          <p className="mt-1.5 text-[12px] leading-snug text-muted">
            {t("ดีกว่าร้านอื่น", "Beats peers")}
          </p>
        </div>
      </div>

      {/* what's holding the score back, and what fixing it is worth */}
      {gain > 0 && (
        <button
          onClick={() => {
            onGo();
            router.push("/fix-it");
          }}
          className="pressable flex items-center gap-3 rounded-[22px] bg-canvas px-4 py-3.5 text-left"
        >
          <ScoreRing score={(weakest.score / PART_MAX) * 100} size={44} stroke={5}>
            <span className="num text-[13px] font-bold">{weakest.score}</span>
          </ScoreRing>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">
              {t(`${tr(weakest.label)} ฉุดคะแนนมากสุด`, `${tr(weakest.label)} costs the most`)}
            </p>
            <p className="text-[13px] text-muted">
              {t(`แก้ครบ ได้ถึง ${target}`, `Fix all: up to ${target}`)}
              {lost > 0 && <span className="text-good-ink"> +{gain}</span>}
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-subtle" />
        </button>
      )}
    </div>
  );
}
