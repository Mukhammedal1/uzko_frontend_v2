import {
  ArrowLeftRight,
  CreditCard,
  Landmark,
  type LucideIcon,
  Wallet,
} from "lucide-react";

import type {
  PurchaseFilters,
  PurchasePaymentMethod,
  PurchasePaymentProvider,
} from "@/types/purchase.types";

export const PURCHASES_LIST_PATH = "/product/product-receipts";

export const PURCHASE_CREATE_PATH = "/product/product-receipts/create";

export const PURCHASE_EDIT_PATH = "/product/product-receipts/edit";

export const PURCHASES_DEFAULT_PAGE = 1;

export const PURCHASES_DEFAULT_LIMIT = 20;

export const PURCHASES_LIMIT_OPTIONS = [10, 20, 50, 100];

export const PURCHASES_SEARCH_DEBOUNCE_MS = 400;

export const PURCHASES_SKELETON_ROWS = 8;

export const PURCHASES_FILTER_ALL = "all";

export const PURCHASE_PAYMENT_METHODS: PurchasePaymentMethod[] = [
  "CASH",
  "CARD",
  "BANK",
  "TRANSFER",
];

export const PURCHASES_DEFAULT_FILTERS: PurchaseFilters = {
  payment_method: PURCHASES_FILTER_ALL,
  supplier_id: PURCHASES_FILTER_ALL,
  from_date: "",
  to_date: "",
};

export const PURCHASE_MAX_ITEMS = 300;

export const PURCHASE_PRODUCT_SEARCH_LIMIT = 20;

export const PURCHASE_PRODUCT_SEARCH_DEBOUNCE_MS = 300;

export const PURCHASE_DEFAULT_QUANTITY = "1";

export const PURCHASE_PAYMENT_ICONS: Record<PurchasePaymentMethod, LucideIcon> =
  {
    CASH: Wallet,
    CARD: CreditCard,
    BANK: Landmark,
    TRANSFER: ArrowLeftRight,
  };

export const PURCHASE_PAYMENT_PROVIDERS: Record<
  PurchasePaymentMethod,
  PurchasePaymentProvider[]
> = {
    CASH: [],
    CARD: ["HUMO", "UZCARD", "VISA", "MASTERCARD"],
    BANK: [],
    TRANSFER: ["CLICK", "PAYME", "PAYNET"],
  };

export const PURCHASE_FINISH_DEFAULTS = {
  paymentMethod: PURCHASE_PAYMENT_METHODS[0],
  paymentProvider: "",
  note: "",
  editReason: "",
};

export const PURCHASES_COLUMNS_STORAGE_KEY = "purchases.columns";

export const PURCHASES_DEFAULT_COLUMNS: Record<string, boolean> = {
  date: true,
  supplier: true,
  stock: true,
  total: true,
  paid: true,
  method: true,
  user: true,
};

export const PURCHASE_EDIT_LOG_LIMIT = 100;
