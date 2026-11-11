"use client";

import { useRef, useState } from "react";
import { Check, ChevronRight, Paperclip } from "lucide-react";
import { Sheet, SheetLabel } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useDemo } from "@/lib/demo-store";
import { useLang } from "@/lib/i18n";
import { DOC_TYPES, docType, type DocType } from "@/lib/content/documents";
import products from "@/mock/shopee/products.json";
import { cn } from "@/lib/utils";

const PRODUCTS = products.response.item_list.map((p) => p.item_name);

/** Add a licence or registration: pick a type, then number, product, expiry and a file. */
export function AddDocSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t, tr } = useLang();
  const toast = useToast();
  const { addDoc } = useDemo();
  const [type, setType] = useState<DocType | null>(null);
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [expires, setExpires] = useState(""); // Gregorian yyyy-mm-dd from the date input
  const [file, setFile] = useState<string>("");
  const [touched, setTouched] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setType(null);
    setNumber("");
    setName("");
    setExpires("");
    setFile("");
    setTouched(false);
  };
  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(reset, 300);
  };

  const info = type ? docType(type) : null;
  const formatOk = !info?.pattern || info.pattern.test(number.trim());
  const ready = !!info && number.trim().length > 0 && formatOk && (!info.perProduct || !!name) && (type !== "other" || !!name.trim());

  const save = () => {
    setTouched(true);
    if (!info || !ready) return;
    // store Buddhist-era dates like the rest of the shop data
    const be = expires ? `${Number(expires.slice(0, 4)) + 543}${expires.slice(4)}` : undefined;
    addDoc({ id: `${info.id}-${number.trim()}-${name.trim()}`, type: info.id, number: number.trim(), name: name.trim() || undefined, expires: be, file: file || undefined });
    toast(t("เพิ่มเอกสารแล้ว", "Document added"), be ? t("น้อง Merchie จะเตือนก่อนหมดอายุ", "Merchie will remind you before it expires") : undefined);
    close(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={close}
      title={info ? tr(info.label) : t("เพิ่มเอกสาร", "Add a document")}
      footer={
        info && (
          <button
            onClick={save}
            className={cn(
              "pressable h-12 w-full rounded-full text-[15px] font-semibold transition-colors",
              ready ? "bg-ocean text-white shadow-lift" : "bg-canvas text-subtle",
            )}
          >
            {t("บันทึก", "Save")}
          </button>
        )
      }
    >
      {!info ? (
        // step 1: what kind of document
        <div className="overflow-hidden rounded-[20px] bg-canvas">
          {DOC_TYPES.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setType(d.id)}
              className={cn(
                "chrome flex min-h-14 w-full items-center gap-3 px-4 text-left transition-colors active:bg-glow",
                i > 0 && "border-t border-line",
              )}
            >
              <span className="flex-1 text-[15px] font-medium">{tr(d.label)}</span>
              <ChevronRight className="size-5 text-subtle" />
            </button>
          ))}
        </div>
      ) : (
        // step 2: the details
        <div className="flex flex-col">
          <SheetLabel>{t("เลขที่", "Number")}</SheetLabel>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder={info.example}
            inputMode={info.id === "trademark" || info.id === "other" ? "text" : "numeric"}
            className={cn(
              "num h-12 w-full rounded-[16px] bg-canvas px-4 text-[16px] outline-none select-text",
              touched && !formatOk && "ring-2 ring-danger",
            )}
          />
          {number && !formatOk && (
            <p className="mt-1.5 text-[13px] text-danger-ink">
              {t(`รูปแบบควรเป็นแบบ ${info.example}`, `Should look like ${info.example}`)}
            </p>
          )}

          {info.perProduct ? (
            <>
              <SheetLabel>{t("ใช้กับสินค้า", "Product")}</SheetLabel>
              <div className="overflow-hidden rounded-[20px] bg-canvas">
                {PRODUCTS.map((p, i) => (
                  <button
                    key={p}
                    onClick={() => setName(p)}
                    className={cn(
                      "chrome flex min-h-12 w-full items-center gap-3 px-4 text-left",
                      i > 0 && "border-t border-line",
                    )}
                  >
                    <span className="flex-1 text-[15px]">{p}</span>
                    {name === p && <Check className="size-5 text-ocean" strokeWidth={2.6} />}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <SheetLabel>{info.id === "other" ? t("ชื่อใบอนุญาต", "Licence name") : t("ชื่อเครื่องหมาย", "Mark")}</SheetLabel>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={info.id === "other" ? t("เช่น ใบอนุญาตขายอาหาร", "e.g. Food selling licence") : "SAISAI"}
                className="h-12 w-full rounded-[16px] bg-canvas px-4 text-[16px] outline-none select-text"
              />
            </>
          )}

          {info.hasExpiry && (
            <>
              <SheetLabel>{t("วันหมดอายุ", "Expires")}</SheetLabel>
              <input
                type="date"
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                className="h-12 w-full rounded-[16px] bg-canvas px-4 text-[16px] outline-none"
              />
            </>
          )}

          <SheetLabel>{t("ไฟล์เอกสาร", "File")}</SheetLabel>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="pressable flex h-12 w-full items-center justify-center gap-2 rounded-full bg-glow text-[15px] font-semibold text-ocean"
          >
            <Paperclip className="size-4" strokeWidth={2.4} />
            <span className="max-w-[220px] truncate">{file || t("แนบรูปหรือ PDF", "Attach a photo or PDF")}</span>
          </button>
          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            {t(
              "Merchie เช็กรูปแบบเลขเท่านั้น ยังไม่ได้ตรวจกับฐานข้อมูลของหน่วยงาน",
              "Merchie checks the number's format only, not the agency's database",
            )}
          </p>
        </div>
      )}
    </Sheet>
  );
}
