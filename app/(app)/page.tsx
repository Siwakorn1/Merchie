import { HeroScore } from "@/components/health/hero-score";
import { IssuesSection } from "@/components/health/issue-list";
import { ChecklistSection } from "@/components/health/checklist";
import { MonitorStrip } from "@/components/health/monitor-strip";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8 pb-4">
      <HeroScore />
      <IssuesSection />
      <MonitorStrip />
      <ChecklistSection />
    </div>
  );
}
