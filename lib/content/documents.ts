import { l, type L } from "@/lib/i18n-core";
import type { CitationId } from "@/lib/legal/citations";

/** Licences and registrations a shop can add to its Legal Checklist. Plain data. */
export type DocType = "cosmetic" | "food" | "tis" | "trademark" | "other";

export type DocTypeInfo = {
  id: DocType;
  label: L;
  /** what the number looks like, shown as the input placeholder */
  example: string;
  /** format check only: Merchie does not look numbers up with the agency */
  pattern?: RegExp;
  cite?: CitationId;
  hasExpiry: boolean;
  /** which product the document covers */
  perProduct: boolean;
};

export const DOC_TYPES: DocTypeInfo[] = [
  {
    id: "cosmetic",
    label: l("จดแจ้งเครื่องสำอาง", "Cosmetic FDA no."),
    example: "10-1-6600012345",
    pattern: /^\d{2}-\d-\d{10}$/,
    cite: "cosmetic-notify",
    hasExpiry: true,
    perProduct: true,
  },
  {
    id: "food",
    label: l("เลข อย. อาหาร", "Food FDA no."),
    example: "10-1-12345-5-0001",
    pattern: /^\d{2}-\d-\d{5}-\d-\d{4}$/,
    cite: "food-reg",
    hasExpiry: false,
    perProduct: true,
  },
  {
    id: "tis",
    label: l("มอก.", "TIS mark"),
    example: "2603-2565",
    pattern: /^\d{1,5}-\d{4}$/,
    cite: "tis",
    hasExpiry: true,
    perProduct: true,
  },
  {
    id: "trademark",
    label: l("เครื่องหมายการค้า", "Trademark"),
    example: "ค123456",
    pattern: /^[ก-ฮA-Za-z]{0,2}\d{5,9}$/,
    cite: "trademark",
    hasExpiry: true,
    perProduct: false,
  },
  {
    id: "other",
    label: l("ใบอนุญาตอื่น", "Other licence"),
    example: "",
    hasExpiry: true,
    perProduct: false,
  },
];

export const docType = (id: DocType) => DOC_TYPES.find((d) => d.id === id)!;

/** A document the shop added. Dates are Buddhist-era "2570-03-14", like the rest of the mock data. */
export type ShopDoc = {
  id: string;
  type: DocType;
  number: string;
  /** product name, or the licence's own name for "other" */
  name?: string;
  expires?: string;
  file?: string;
};
