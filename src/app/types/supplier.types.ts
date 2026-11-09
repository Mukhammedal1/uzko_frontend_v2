import type { z } from "zod";

import type { supplierFormSchema } from "@/validate/supplier/createOrUpdate.zod";

export type SupplierRow = {
  id: number;
  fullname: string;
  phoneNumber: string;
  address: string;
  imageId: number | null;
  imageUrl: string | null;
  organizationName: string;
  organizationInn: string;
  bankAccountNumber: string;
  note: string;
  balances: SupplierBalance[];
};

export type SupplierBalance = {
  businessCurrencyId: number;
  currency: string;
  debt: number;
  paid: number;
};

export type SupplierMoney = {
  currency: string;
  amount: number;
};

export type SupplierSummaryRow = {
  currency: string;
  debt: number;
  paid: number;
};

export type SuppliersPage = {
  items: SupplierRow[];
  summary: SupplierSummaryRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SuppliersQueryParams = {
  page: number;
  limit: number;
  search?: string;
  has_debt?: boolean;
  has_payment?: boolean;
  has_image?: boolean;
};

export type SupplierDebtFilterValue = "all" | "yes" | "no";

export type SupplierFilters = {
  has_debt: SupplierDebtFilterValue;
  has_payment: SupplierDebtFilterValue;
  has_image: SupplierDebtFilterValue;
};

export type SupplierFilterKey = keyof SupplierFilters;

export type SupplierFormValues = z.input<typeof supplierFormSchema>;

export type SupplierCreatePayload = {
  fullname: string;
  phone_number?: string | null;
  address?: string | null;
  file_id?: number | null;
  organization_name?: string | null;
  organization_inn?: string | null;
  bank_account_number?: string | null;
  note?: string | null;
  balances?: SupplierBalancePayload[];
};

export type SupplierBalancePayload = {
  business_currency_id: number;
  total_debt_amount: number;
};

export type SupplierUpdatePayload = Partial<SupplierCreatePayload>;

export type SupplierPayload = SupplierCreatePayload;

export type SupplierDeleteTarget = {
  ids: number[];
  name: string;
};

export type SupplierStats = {
  count: number;
  debt: SupplierMoney[];
  paid: SupplierMoney[];
  turnover: SupplierMoney[];
};

export type SupplierExportFormat = "xlsx" | "pdf";

export type SupplierExportColumnKey =
  | "fullname"
  | "phone_number"
  | "organization_name"
  | "organization_inn"
  | "bank_account_number"
  | "address"
  | "note"
  | "debt"
  | "paid";

export type SupplierExportColumn = {
  key: SupplierExportColumnKey;
  label: string;
};
