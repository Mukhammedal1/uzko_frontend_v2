import {
  Building2,
  Hash,
  Landmark,
  type LucideIcon,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import type {
  SupplierDebtFilterValue,
  SupplierFilterKey,
  SupplierFilters,
  SupplierExportColumnKey,
  SupplierExportFormat,
  SupplierFormValues,
  SuppliersQueryParams,
} from "@/types/supplier.types";

export const SUPPLIERS_DEFAULT_PAGE = 1;

export const SUPPLIERS_DEFAULT_LIMIT = 20;

export const SUPPLIERS_STATS_PARAMS: SuppliersQueryParams = {
  page: 1,
  limit: 1,
};

export const SUPPLIERS_LIMIT_OPTIONS = [10, 20, 50, 100];

export const SUPPLIERS_SEARCH_DEBOUNCE_MS = 400;

export const SUPPLIERS_SKELETON_ROWS = 8;

export const SUPPLIERS_FILTER_ALL = "all";

export const SUPPLIERS_DEBT_FILTER_VALUES: SupplierDebtFilterValue[] = [
  "all",
  "yes",
  "no",
];

export const SUPPLIERS_FILTER_KEYS: SupplierFilterKey[] = [
  "has_debt",
  "has_payment",
  "has_image",
];

export const SUPPLIERS_DEFAULT_FILTERS: SupplierFilters = {
  has_debt: SUPPLIERS_FILTER_ALL,
  has_payment: SUPPLIERS_FILTER_ALL,
  has_image: SUPPLIERS_FILTER_ALL,
};

export const SUPPLIER_FORM_DEFAULTS: SupplierFormValues = {
  fullname: "",
  phone_number: "",
  organization_name: "",
  organization_inn: "",
  bank_account_number: "",
  address: "",
  note: "",
  debts: [],
};

export const SUPPLIERS_SELECT_COLUMN_WIDTH = 3;

export const SUPPLIERS_ACTIONS_COLUMN_WIDTH = 9;

export const SUPPLIERS_TABLE_COLUMN_KEYS = [
  "image",
  "fullname",
  "organization",
  "inn",
  "account",
  "address",
  "note",
  "debt",
  "payment",
] as const;

export const SUPPLIERS_TOGGLE_COLUMN_KEYS = SUPPLIERS_TABLE_COLUMN_KEYS.filter(
  (key) => key !== "fullname",
);

export const SUPPLIERS_COLUMNS_STORAGE_KEY = "suppliers.columns";

export const SUPPLIERS_DEFAULT_COLUMNS: Record<string, boolean> =
  Object.fromEntries(SUPPLIERS_TOGGLE_COLUMN_KEYS.map((key) => [key, true]));

export const SUPPLIERS_COLUMN_WEIGHTS: Record<
  (typeof SUPPLIERS_TABLE_COLUMN_KEYS)[number],
  number
> = {
  image: 38.4,
  fullname: 100,
  organization: 100,
  inn: 100,
  account: 100,
  address: 100,
  note: 100,
  debt: 100,
  payment: 100,
};

export const SUPPLIER_FIELD_ICONS: Record<
  (typeof SUPPLIER_TEXT_FIELDS)[number],
  LucideIcon
> = {
  fullname: User,
  phone_number: Phone,
  organization_name: Building2,
  address: MapPin,
  organization_inn: Hash,
  bank_account_number: Landmark,
};

export const SUPPLIER_TEXT_FIELDS = [
  "fullname",
  "phone_number",
  "organization_name",
  "address",
  "organization_inn",
  "bank_account_number",
] as const;

export const SUPPLIER_EXPORT_COLUMNS: {
  key: SupplierExportColumnKey;
  labelKey: string;
}[] = [
  { key: "fullname", labelKey: "form.fullname" },
  { key: "phone_number", labelKey: "form.phone_number" },
  { key: "organization_name", labelKey: "form.organization_name" },
  { key: "organization_inn", labelKey: "form.organization_inn" },
  { key: "bank_account_number", labelKey: "form.bank_account_number" },
  { key: "address", labelKey: "form.address" },
  { key: "note", labelKey: "form.note" },
  { key: "debt", labelKey: "columns.debt" },
  { key: "paid", labelKey: "columns.payment" },
];

export const SUPPLIER_EXPORT_FORMATS: SupplierExportFormat[] = ["xlsx", "pdf"];

export const SUPPLIER_EXPORT_FILE_NAME = "suppliers";
