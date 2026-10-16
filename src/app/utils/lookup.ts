import type { SelectOption } from "@/types/common.types";
import type { AppLocale } from "@/types/i18n.types";

type Raw = Record<string, unknown>;

const isRecord = (value: unknown): value is Raw =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toText = (value: unknown) =>
  typeof value === "string"
    ? value.trim()
    : typeof value === "number"
      ? String(value)
      : "";

const LABEL_KEYS = [
  "name",
  "title",
  "number",
  "shelf_number",
  "full_name",
  "company_name",
  "phone",
  "code",
];

const getLabel = (raw: Raw, locale: AppLocale) => {
  for (const key of LABEL_KEYS) {
    const value = raw[key];
    if (isRecord(value)) {
      const text = toText(value[locale]) || toText(value.uz);
      if (text) return text;
      continue;
    }
    const text = toText(value);
    if (text) return text;
  }
  return "";
};

export const normalizeOptions = (
  raw: unknown,
  locale: AppLocale,
): SelectOption[] => {
  const list = Array.isArray(raw)
    ? raw
    : isRecord(raw)
      ? [raw.data, raw.items, raw.result, raw.rows].find(Array.isArray)
      : undefined;

  if (!Array.isArray(list)) return [];

  return list.filter(isRecord).flatMap((item) => {
    const id = item.id;
    if (typeof id !== "number" && typeof id !== "string") return [];
    return [{ value: String(id), label: getLabel(item, locale) || String(id) }];
  });
};
