import type { z } from "zod";

import type { purchaseCreateSchema } from "@/validate/purchase/create.zod";
import type { purchaseFinishSchema } from "@/validate/purchase/finish.zod";

export type PurchasePaymentMethod = "CASH" | "CARD" | "BANK" | "TRANSFER";

export type PurchasePaymentProvider =
  | "HUMO"
  | "UZCARD"
  | "VISA"
  | "MASTERCARD"
  | "CLICK"
  | "PAYME"
  | "PAYNET";

export type PurchaseFilters = {
  payment_method: string;
  supplier_id: string;
  from_date: string;
  to_date: string;
};

export type PurchaseRow = {
  id: number;
  createdAt: string;
  updatedAt: string;
  supplier: string;
  user: string;
  totalPrice: number;
  paidAmount: number;
  paymentMethod: string;
  note: string;
};

export type PurchasesPage = {
  items: PurchaseRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PurchasesQueryParams = {
  page: number;
  limit: number;
  search?: string;
  payment_method?: PurchasePaymentMethod;
  supplier_id?: number;
  from_date?: string;
  to_date?: string;
};

export type PurchaseFilterKey = keyof PurchaseFilters;

export type PurchaseProductOption = {
  key: string;
  productId: number;
  variantId: number;
  label: string;
  article: string;
  purchasePrice: string;
  purchaseCurrencyId: string;
  wholesalePrice: string;
  wholesaleCurrencyId: string;
  wholesalePercent: string;
  retailPrice: string;
  retailCurrencyId: string;
  retailPercent: string;
  stockId: string;
  shelfId: string;
};

export type PurchaseCreateFormValues = z.infer<typeof purchaseCreateSchema>;

export type PurchaseFinishFormValues = z.infer<typeof purchaseFinishSchema>;

export type PurchaseCurrencyTotal = {
  currencyId: string;
  amount: number;
};

export type PurchaseTotals = {
  count: number;
  firstName: string;
  firstQuantity: number;
  byCurrency: PurchaseCurrencyTotal[];
};

export type PurchasePaymentFormValues =
  PurchaseFinishFormValues["paidAmounts"][number];

export type PurchasePaymentPayload = {
  currency_id: number;
  amount: number;
};

export type PurchaseItemFormValues = PurchaseCreateFormValues["items"][number];

export type PurchaseItemPayload = {
  id?: number;
  product_id: number;
  product_variant_id: number;
  stock_id: number;
  shelf_number_id?: number;
  quantity: number;
  purchase_price: number;
  purchase_price_currency_id: number;
  retail_price: number;
  retail_price_currency_id: number;
  retail_price_percentage?: number;
  wholesale_price?: number;
  wholesale_price_currency_id?: number;
  wholesale_price_percentage?: number;
};

export type PurchaseCreatePayload = {
  supplier_id: number;
  payment_method: PurchasePaymentMethod;
  payment_provider?: PurchasePaymentProvider;
  paid_amounts?: PurchasePaymentPayload[];
  note?: string;
  purchase_items: PurchaseItemPayload[];
};

export type PurchaseUpdatePayload = PurchaseCreatePayload & {
  edit_reason?: string;
};

export type PurchaseEditData = {
  id: number;
  items: PurchaseItemFormValues[];
  finish: PurchaseFinishFormValues;
};

export type PurchaseHistoryRow = {
  id: number;
  purchaseId: number;
  createdAt: string;
  user: string;
  note: string;
  debtDelta: number;
  paidDelta: number;
  currency: string;
};

export type PurchaseEditLogRow = PurchaseHistoryRow & {
  supplier: string;
};

export type PurchaseDeleteTarget = {
  id: number;
};

export type PurchaseDetail = {
  stocks: string[];
  currencies: string[];
  totals: { currency: string; amount: number }[];
  remainingQuantity: number | null;
};
