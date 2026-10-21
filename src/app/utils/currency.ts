import type { CurrencyMap, MainCurrency } from "@/types/product.types";
import type { BusinessCurrencyRow } from "@/types/settings.types";

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

const toBusinessCurrency = (item: Record<string, unknown>): MainCurrency | null => {
  const nested = isRecord(item.currency) ? item.currency : null;
  const id = item.currency_id ?? nested?.id ?? item.id;
  if (typeof id !== "number") return null;

  const rate = Number(item.rate ?? nested?.rate);

  return {
    id,
    code: getCurrencyCode(item) || getCurrencyCode(nested),
    rate: Number.isFinite(rate) && rate > 0 ? rate : 1,
  };
};

const toRecords = (raw: unknown) => {
  const list = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.data)
      ? raw.data
      : [];

  return list.filter(isRecord);
};

export const pickBusinessCurrencies = (raw: unknown): MainCurrency[] =>
  toRecords(raw).reduce<MainCurrency[]>((result, item) => {
    const currency = toBusinessCurrency(item);
    if (currency) result.push(currency);
    return result;
  }, []);

export const pickMainCurrency = (raw: unknown): MainCurrency | null => {
  const records = toRecords(raw);
  const main = records.find((item) => item.is_main === true) ?? records[0];

  return main ? toBusinessCurrency(main) : null;
};

export const pickBusinessCurrencyRows = (raw: unknown): BusinessCurrencyRow[] =>
  toRecords(raw).flatMap((item) => {
    const nested = isRecord(item.currency) ? item.currency : null;
    const id = item.currency_id ?? nested?.id ?? item.id;
    if (typeof id !== "number") return [];

    const rate = Number(item.rate);

    return [
      {
        id,
        name: toText(nested?.name ?? item.name) || getCurrencyCode(item),
        symbol: toText(nested?.symbol ?? item.symbol),
        rate: Number.isFinite(rate) ? rate : 0,
        isMain: item.is_main === true || nested?.is_main === true,
      },
    ];
  });
