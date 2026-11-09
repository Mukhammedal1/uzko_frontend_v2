import type {
  SupplierBalance,
  SupplierExportColumnKey,
  SupplierFormValues,
  SupplierMoney,
  SupplierPayload,
  SupplierRow,
  SuppliersPage,
  SupplierStats,
  SupplierSummaryRow,
} from "@/types/supplier.types";
import { formatNumber } from "@/utils/format";
import { getFileUrl } from "@/utils/menu";

type Raw = Record<string, unknown>;

const isRecord = (value: unknown): value is Raw =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toText = (value: unknown) => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toImageId = (raw: Raw): number | null => {
  const file = isRecord(raw.file)
    ? raw.file
    : isRecord(raw.image)
      ? raw.image
      : null;
  const parsed = toNumber(file?.id ?? raw.file_id, 0);
  return parsed > 0 ? parsed : null;
};

const toBalances = (
  raw: Raw,
  currencyCodes: Record<number, string>,
): SupplierBalance[] => {
  const list = Array.isArray(raw.supplier_balances)
    ? raw.supplier_balances
    : [];

  return list.filter(isRecord).map((item) => {
    const businessCurrencyId = toNumber(
      item.business_currency_id ??
        (isRecord(item.business_currency) ? item.business_currency.id : 0),
    );

    return {
      businessCurrencyId,
      currency: currencyCodes[businessCurrencyId] ?? "",
      debt: toNumber(item.total_debt_amount),
      paid: toNumber(item.total_paid_amount),
    };
  });
};

const toSupplier = (
  raw: Raw,
  currencyCodes: Record<number, string>,
): SupplierRow => {
  const imageId = toImageId(raw);

  return {
    id: toNumber(raw.id),
    fullname: toText(raw.fullname ?? raw.full_name ?? raw.name),
    phoneNumber: toText(raw.phone_number ?? raw.phone),
    address: toText(raw.address),
    imageId,
    imageUrl: imageId ? getFileUrl(imageId) : null,
    organizationName: toText(raw.organization_name),
    organizationInn: toText(raw.organization_inn),
    bankAccountNumber: toText(raw.bank_account_number),
    note: toText(raw.note),
    balances: toBalances(raw, currencyCodes),
  };
};

export const normalizeSupplierDebts = (
  raw: unknown,
  currencyCodes: Record<number, string>,
): SupplierMoney[] => {
  const root = isRecord(raw) ? raw : {};
  const source = isRecord(root.data) ? root.data : root;

  return pickSupplierMoney(toSupplier(source, currencyCodes), "debt");
};

const findList = (raw: unknown): unknown[] => {
  if (Array.isArray(raw)) return raw;
  if (!isRecord(raw)) return [];

  for (const key of ["data", "items", "suppliers", "results", "rows"]) {
    const value = raw[key];
    if (Array.isArray(value)) return value;
    if (isRecord(value)) {
      const nested = findList(value);
      if (nested.length > 0) return nested;
    }
  }
  return [];
};

export const normalizeSuppliersPage = (
  raw: unknown,
  {
    page,
    limit,
    currencyCodes,
    summaryCodes,
  }: {
    page: number;
    limit: number;
    currencyCodes: Record<number, string>;
    summaryCodes: Record<number, string>;
  },
): SuppliersPage => {
  const items = findList(raw)
    .filter(isRecord)
    .map((item) => toSupplier(item, currencyCodes));

  const root = isRecord(raw) ? raw : {};
  const dataRoot = isRecord(root.data) ? root.data : {};
  const summarySource = Array.isArray(root.summary)
    ? root.summary
    : Array.isArray(dataRoot.summary)
      ? dataRoot.summary
      : [];
  const summary = summarySource
    .filter(isRecord)
    .map((item): SupplierSummaryRow => {
      const id = toNumber(item.currency_id);

      return {
        currency:
          summaryCodes[id] ??
          (toText(item.currency_symbol) || toText(item.currency_name)),
        debt: toNumber(item.total_debt),
        paid: toNumber(item.total_paid),
      };
    });

  const meta = isRecord(root.meta)
    ? root.meta
    : isRecord(root.pagination)
      ? root.pagination
      : isRecord(dataRoot.meta)
        ? dataRoot.meta
        : { ...dataRoot, ...root };

  const total = toNumber(
    meta.total ?? meta.totalItems ?? meta.total_items ?? meta.count,
    items.length,
  );
  const pageSize = toNumber(meta.limit ?? meta.per_page ?? meta.perPage, limit);
  const totalPages = toNumber(
    meta.totalPages ?? meta.total_pages ?? meta.last_page ?? meta.lastPage,
    Math.max(1, Math.ceil(total / Math.max(pageSize, 1))),
  );

  return {
    items,
    summary,
    total,
    page: toNumber(meta.page ?? meta.current_page ?? meta.currentPage, page),
    limit: pageSize,
    totalPages: Math.max(1, totalPages),
  };
};

export const buildSupplierStats = (
  summary: SupplierSummaryRow[],
  total: number,
): SupplierStats => {
  const pick = (value: (row: SupplierSummaryRow) => number) =>
    summary
      .map((row): SupplierMoney => ({
        currency: row.currency,
        amount: value(row),
      }))
      .filter((item) => item.amount > 0);

  return {
    count: total,
    debt: pick((row) => row.debt),
    paid: pick((row) => row.paid),
    turnover: pick((row) => row.debt + row.paid),
  };
};

export const pickSupplierMoney = (
  supplier: SupplierRow,
  field: "debt" | "paid",
): SupplierMoney[] =>
  supplier.balances
    .filter((balance) => balance[field] > 0)
    .map((balance) => ({
      currency: balance.currency,
      amount: balance[field],
    }));

const optional = (value: string, clearable: boolean) => {
  const text = value.trim();
  if (text !== "") return text;
  return clearable ? null : undefined;
};

export const buildSupplierPayload = (
  values: SupplierFormValues,
  fileId: number | null,
  defaultCurrencyId: string,
  editing = false,
  hadImage = false,
): SupplierPayload => {
  const balances = values.debts.flatMap((item) => {
    const amount = item.amount.replace(/\s/g, "");
    const currencyId = Number(item.currency_id || defaultCurrencyId);

    return amount === "" || currencyId <= 0
      ? []
      : [
          {
            business_currency_id: currencyId,
            total_debt_amount: Number(amount),
          },
        ];
  });

  return {
    fullname: values.fullname.trim(),
    phone_number: optional(values.phone_number, editing),
    address: optional(values.address, editing),
    organization_name: optional(values.organization_name, editing),
    organization_inn: optional(values.organization_inn, editing),
    bank_account_number: optional(values.bank_account_number, editing),
    note: optional(values.note, editing),
    ...(balances.length > 0 ? { balances } : {}),
    ...(fileId
      ? { file_id: fileId }
      : editing && hadImage
        ? { file_id: null }
        : {}),
  };
};

export const emptyDebtRow = (currencyId: string) => ({
  currency_id: currencyId,
  amount: "",
});

export const supplierToFormValues = (
  supplier: SupplierRow,
  defaultCurrencyId: string,
): SupplierFormValues => {
  const debts = supplier.balances
    .filter((balance) => balance.debt > 0)
    .map((balance) => ({
      currency_id: String(balance.businessCurrencyId),
      amount: String(balance.debt),
    }));

  return {
    fullname: supplier.fullname,
    phone_number: supplier.phoneNumber,
    organization_name: supplier.organizationName,
    organization_inn: supplier.organizationInn,
    bank_account_number: supplier.bankAccountNumber,
    address: supplier.address,
    note: supplier.note,
    debts: debts.length > 0 ? debts : [emptyDebtRow(defaultCurrencyId)],
  };
};

const formatMoneyList = (items: SupplierMoney[]) =>
  items
    .map((item) => `${formatNumber(item.amount)} ${item.currency}`)
    .join("\n");

export const buildSupplierExportRows = (
  suppliers: SupplierRow[],
  keys: SupplierExportColumnKey[],
): string[][] =>
  suppliers.map((supplier) =>
    keys.map((key) => {
      switch (key) {
        case "fullname":
          return supplier.fullname;
        case "phone_number":
          return supplier.phoneNumber;
        case "organization_name":
          return supplier.organizationName;
        case "organization_inn":
          return supplier.organizationInn;
        case "bank_account_number":
          return supplier.bankAccountNumber;
        case "address":
          return supplier.address;
        case "note":
          return supplier.note;
        case "debt":
          return formatMoneyList(pickSupplierMoney(supplier, "debt"));
        case "paid":
          return formatMoneyList(pickSupplierMoney(supplier, "paid"));
      }
    }),
  );
