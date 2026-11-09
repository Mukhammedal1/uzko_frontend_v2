import {
  HandCoins,
  Package,
  RotateCcw,
  type LucideIcon,
  Users,
  Wifi,
} from "lucide-react";

import type {
  SaleActionKey,
  SaleColumnKey,
  SalePriceMode,
  SaleTableColumnKey,
} from "@/types/sale.types";

export const SALE_PRODUCTS_LIMIT = 50;

export const SALE_SEARCH_DEBOUNCE_MS = 400;

export const SALE_SKELETON_ROWS = 6;

export const SALE_COLLAPSE_DURATION_MS = 150;

export const SALE_COLUMNS_STORAGE_KEY = "sale.columns";

export const SALE_PRICE_MODES: SalePriceMode[] = ["retail", "wholesale"];

export const SALE_TABLE_COLUMN_KEYS: SaleTableColumnKey[] = [
  "cost",
  "retail",
  "wholesale",
  "quantity",
  "unit",
];

export const SALE_TOGGLE_COLUMN_KEYS: SaleColumnKey[] = [
  ...SALE_TABLE_COLUMN_KEYS,
  "margin",
];

export const SALE_DEFAULT_COLUMNS: Record<string, boolean> = Object.fromEntries(
  SALE_TOGGLE_COLUMN_KEYS.map((key) => [key, true]),
);

export const SALE_NAME_COLUMN_WEIGHT = 280;

export const SALE_MENU_COLUMN_WIDTH = 4;

export const SALE_COLUMN_WEIGHTS: Record<SaleTableColumnKey, number> = {
  cost: 110,
  retail: 130,
  wholesale: 130,
  quantity: 100,
  unit: 80,
};

export const SALE_ACTIONS: { key: SaleActionKey; icon: LucideIcon }[] = [
  { key: "offerCustomers", icon: Users },
  { key: "repayDebt", icon: HandCoins },
  { key: "online", icon: Wifi },
  { key: "returnGoods", icon: RotateCcw },
  { key: "oneTime", icon: Package },
];
