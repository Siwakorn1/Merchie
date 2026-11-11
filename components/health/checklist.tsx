"use client";

import { useState } from "react";
import { Check, ChevronRight, Plus } from "lucide-react";
import { Sheet, SheetLabel } from "@/components/ui/sheet";
import { ScoreRing } from "@/components/health/score-ring";
import { CitationList, LegalNote } from "@/components/legal/citation-list";
import { SectionTitle } from "@/components/health/issue-list";
import merchie from "@/mock/merchie/shop.json";
import { vatUsage } from "@/lib/health/score";
import type { CitationId } from "@/lib/legal/citations";
import { useLang, type Lang } from "@/lib/i18n";
import { useDemo } from "@/lib/demo-store";
import { useToast } from "@/components/ui/toast";
import { AddDocSheet } from "@/components/health/add-doc-sheet";
import { docType, type ShopDoc } from "@/lib/content/documents";

type Item = (typeof merchie.checklist)[number];

const baht = (n: number) => n.toLocaleString("th-TH");
const MONTHS = {
  th: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
/** Buddhist-era "2570-03-14" → "มี.ค. 70" / "Mar 2027" */
const shortDate = (d: string, lang: Lang) => {
  const [y, m] = d.split("-");
  const month = MONTHS[lang][Number(m) - 1];
  return lang === "th" ? `${month} ${y.slice(2)}` : `${month} ${Number(y) - 543}`;
};

export function ChecklistSection() {
  const [active, setActive] = useState<Item | null>(null);
  const [shown, setShown] = useState<Item | null>(null);
  if (active && active !== shown) setShown(active);
  const it = active ?? shown;
  const { t, lang, tr } = useLang();
  const label = (x: Item) => (lang === "th" ? x.label : x.label_en);
  const { docs } = useDemo();
  const [adding, setAdding] = useState(false);
  const [doc, setDoc] = useState<ShopDoc | null>(null);
  const [shownDoc, setShownDoc] = useState<ShopDoc | null>(null);
  if (doc && doc !== shownDoc) setShownDoc(doc);

  return (
    <section className="px-5">
      <SectionTitle>{t("เช็คลิสต์", "Checklist")}</SectionTitle>
      <div className="overflow-hidden rounded-card bg-surface shadow-soft">
        {merchie.checklist.map((item, i) => (
          <div key={item.id}>
            {i > 0 && <div className="ml-5 h-px bg-line" />}
            <button
              onClick={() => setActive(item)}
              className="chrome flex min-h-[58px] w-full items-center gap-3 px-5 text-left transition-colors active:bg-glow"
            >
              <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{label(item)}</span>
              <Trailing item={item} />
              <ChevronRight className="size-5 text-subtle" />
            </button>
          </div>
        ))}
        {/* documents the shop added */}
        {docs.map((d) => (
          <div key={d.id}>
            <div className="ml-5 h-px bg-line" />
            <button
              onClick={() => setDoc(d)}
              className="chrome flex min-h-[58px] w-full items-center gap-3 px-5 py-2.5 text-left transition-colors active:bg-glow"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium">{tr(docType(d.type).label)}</span>
                {d.name && <span className="block truncate text-[13px] text-muted">{d.name}</span>}
              </span>
              {d.expires ? (
                <span className="text-[14px] text-muted">{shortDate(d.expires, lang)}</span>
              ) : (
                <Check className="size-5 text-good-ink" strokeWidth={2.5} aria-label={t("มีแล้ว", "Done")} />
              )}
              <ChevronRight className="size-5 text-subtle" />
            </button>
          </div>
        ))}
        <div className="ml-5 h-px bg-line" />
        <button
          onClick={() => setAdding(true)}
          className="chrome flex min-h-14 w-full items-center gap-3 px-5 text-left transition-colors active:bg-glow"
        >
          <Plus className="size-5 text-ocean" strokeWidth={2.4} />
          <span className="flex-1 text-[15px] font-semibold text-ocean">{t("เพิ่มเอกสาร", "Add a document")}</span>
        </button>
      </div>

      <AddDocSheet open={adding} onOpenChange={setAdding} />
      <Sheet
        open={!!doc}
        onOpenChange={(o) => !o && setDoc(null)}
        title={shownDoc ? tr(docType(shownDoc.type).label) : undefined}
      >
        {shownDoc && <DocDetail doc={shownDoc} onRemoved={() => setDoc(null)} />}
      </Sheet>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)} title={it ? label(it) : undefined}>
        {it && <ChecklistDetail item={it} />}
      </Sheet>
    </section>
  );
}

function Trailing({ item }: { item: Item }) {
  const { t, lang } = useLang();
  if (item.id === "vat") {
    const pct = Math.round(vatUsage() * 100);
    return (
      <span className="flex items-center gap-2">
        <span className="num text-[14px] font-semibold">{pct}%</span>
        <ScoreRing score={pct} status="watch" size={26} stroke={3.5} showNumber={false} />
      </span>
    );
  }
  if (item.expires) return <span className="text-[14px] text-muted">{shortDate(item.expires, lang)}</span>;
  return <Check className="size-5 text-good-ink" strokeWidth={2.5} aria-label={t("มีแล้ว", "Done")} />;
}

function ChecklistDetail({ item }: { item: Item }) {
  const { ytd_revenue, vat_threshold } = merchie.sales;
  const { t, lang } = useLang();
  return (
    <>
      {item.id === "vat" ? (
        <div className="flex flex-col items-center py-2">
          <ScoreRing score={vatUsage() * 100} status="watch" size={150} stroke={12}>
            <span className="relative text-center">
              <span className="num block text-[30px] leading-none font-bold">{Math.round(vatUsage() * 100)}%</span>
              <span className="mt-1 block text-[12px] text-muted">{t("ของ 1.8 ล้าน", "of 1.8M")}</span>
            </span>
          </ScoreRing>
          <p className="mt-5 text-center text-[15px] leading-relaxed">
            {t("ยอดสะสมปีนี้", "Revenue this year")} {baht(ytd_revenue)} {t("บาท", "THB")}
            <br />
            {t("อีก", "")} <b className="num">{baht(vat_threshold - ytd_revenue)}</b>{" "}
            {t("บาทต้องจด VAT", "THB until VAT registration")}
          </p>
        </div>
      ) : (
        <div className="rounded-[20px] bg-canvas px-4 py-3.5">
          {item.value && <p className="num text-[17px] font-semibold tracking-wide">{item.value}</p>}
          {item.expires && <p className="mt-1 text-[14px] text-muted">{t("ใช้ได้ถึง", "Valid until")} {shortDate(item.expires, lang)}</p>}
          {!item.value && !item.expires && <p className="text-[14px]">{t("มีครบแล้ว", "All set")}</p>}
        </div>
      )}
      <SheetLabel>{t("อ้างอิง", "Sources")}</SheetLabel>
      <CitationList ids={[item.cite as CitationId]} />
      <LegalNote />
    </>
  );
}

function DocDetail({ doc, onRemoved }: { doc: ShopDoc; onRemoved: () => void }) {
  const { t, lang } = useLang();
  const { removeDoc } = useDemo();
  const toast = useToast();
  const info = docType(doc.type);
  return (
    <>
      <div className="rounded-[20px] bg-canvas px-4 py-3.5">
        <p className="num text-[17px] font-semibold tracking-wide">{doc.number}</p>
        {doc.name && <p className="mt-1 text-[14px]">{doc.name}</p>}
        {doc.expires && (
          <p className="mt-1 text-[14px] text-muted">
            {t("ใช้ได้ถึง", "Valid until")} {shortDate(doc.expires, lang)}
          </p>
        )}
        {doc.file && <p className="mt-1 truncate text-[13px] text-muted">{doc.file}</p>}
      </div>
      {info.cite && (
        <>
          <SheetLabel>{t("อ้างอิง", "Sources")}</SheetLabel>
          <CitationList ids={[info.cite]} />
        </>
      )}
      <button
        onClick={() => {
          removeDoc(doc.id);
          onRemoved();
          toast(t("ลบเอกสารแล้ว", "Document removed"));
        }}
        className="pressable mt-5 h-12 w-full rounded-full text-[15px] font-semibold text-danger-ink"
      >
        {t("ลบเอกสาร", "Remove document")}
      </button>
      {info.cite && <LegalNote />}
    </>
  );
}
