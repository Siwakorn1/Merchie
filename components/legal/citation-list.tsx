"use client";

import { cite, type CitationId } from "@/lib/legal/citations";
import { useLang } from "@/lib/i18n";

/** The laws / policy clauses a flag relies on. Required on every legal output. */
export function CitationList({ ids }: { ids: CitationId[] }) {
  const { tr } = useLang();
  if (ids.length === 0) return null;
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-[20px] bg-canvas">
      {ids.map((id) => {
        const c = cite(id);
        return (
          <li key={id} className="px-4 py-3.5">
            <p className="text-[14px] font-semibold">
              {tr(c.law)}
              {c.section && <span className="font-medium text-ocean"> {tr(c.section)}</span>}
            </p>
            <p className="mt-0.5 text-[13px] text-muted">{tr(c.gist)}</p>
          </li>
        );
      })}
    </ul>
  );
}

/** "Cosmetics Act B.E. 2558 s.32" in the current language. */
export function useCiteLine() {
  const { tr } = useLang();
  return (id: CitationId) => {
    const c = cite(id);
    return c.section ? `${tr(c.law)} ${tr(c.section)}` : tr(c.law);
  };
}

/** One line, only at the bottom of legal detail sheets. */
export function LegalNote() {
  const { t } = useLang();
  return (
    <p className="mt-6 text-center text-[12px] text-muted">{t("ไม่ใช่คำปรึกษาทางกฎหมาย", "Not legal advice")}</p>
  );
}
