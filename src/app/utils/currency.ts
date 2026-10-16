import type { CurrencyMap, MainCurrency } from "@/types/product.types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toText = (value: unknown) => (typeof value === "string" ? value : "");

const CODE_PATTERN = /^[A-Za-z]{3}$/;

export const getCurrencyCode = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";

  const candidates = [value.code, value.name, value.symbol, value.key].map(
    toText,
  );
  const code = candidates.find((candidate) => CODE_PATTERN.test(candidate));

  return (code ?? candidates.find(Boolean) ?? "").toUpperCase();
};

export const normalizeCurrencies = (raw: unknown): CurrencyMap => {
  const list = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.data)
      ? raw.data
      : isRecord(raw) && Array.isArray(raw.items)
        ? raw.items
        : [];

  return list.reduce<CurrencyMap>((map, item) => {
    if (isRecord(item) && typeof item.id === "number") {
      const nested = isRecord(item.currency) ? item.currency : item;
      map[item.id] = getCurrencyCode(nested);
      if (typeof nested.id === "number") map[nested.id] = getCurrencyCode(nested);
    }
    return map;
  }, {});
};

export const pickMainCurrency = (raw: unknown): MainCurrency | null => {
  const list = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.data)
      ? raw.data
      : [];

  const records = list.filter(isRecord);
  const main = records.find((item) => item.is_main === true) ?? records[0];
  if (!main) return null;

  const id = main.currency_id ?? main.id;
  if (typeof id !== "number") return null;

  return { id, code: getCurrencyCode(main) };
};
