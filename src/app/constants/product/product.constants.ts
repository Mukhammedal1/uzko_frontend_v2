import type {
  ProductBoolFilterKey,
  ProductBoolFilterValue,
  ProductColumnKey,
  ProductColumnVisibility,
  ProductFilters,
  ProductSelectFilterKey,
  ProductTableColumnKey,
} from "@/types/product.types";

export const PRODUCTS_DEFAULT_PAGE = 1;

export const PRODUCTS_DEFAULT_LIMIT = 20;

export const PRODUCTS_LIMIT_OPTIONS = [10, 20, 50, 100];

export const PRODUCTS_SEARCH_DEBOUNCE_MS = 400;

export const PRODUCTS_FILTER_ALL = "all";

export const PRODUCTS_SELECT_FILTER_KEYS: ProductSelectFilterKey[] = [
  "stock_id",
  "supplier_id",
  "unit_id",
  "shelf_number_id",
];

export const PRODUCTS_BOOL_FILTER_KEYS: ProductBoolFilterKey[] = [
  "available_image",
  "in_stock",
  "available_limit",
  "available_barcode",
];

export const PRODUCTS_BOOL_FILTER_VALUES: ProductBoolFilterValue[] = [
  "all",
  "yes",
  "no",
];

export const PRODUCTS_DEFAULT_FILTERS: ProductFilters = {
  stock_id: PRODUCTS_FILTER_ALL,
  supplier_id: PRODUCTS_FILTER_ALL,
  unit_id: PRODUCTS_FILTER_ALL,
  shelf_number_id: PRODUCTS_FILTER_ALL,
  available_image: "all",
  in_stock: "all",
  available_limit: "all",
  available_barcode: "all",
};

export const PRODUCTS_SKELETON_ROWS = 8;

export const PRODUCTS_COLLAPSE_DURATION_MS = 150;

export const PRODUCTS_EXPORT_FILE_NAME = "products.csv";

export const PRODUCTS_COLUMN_KEYS: ProductColumnKey[] = [
  "limit",
  "cost",
  "wholesale",
  "retail",
  "article",
  "quantity",
  "unit",
  "shelf",
  "stock",
  "supplier",
  "image",
  "margin",
  "barcode",
];

export const PRODUCTS_TABLE_COLUMN_KEYS: ProductTableColumnKey[] = [
  "limit",
  "cost",
  "wholesale",
  "retail",
  "article",
  "quantity",
  "unit",
  "shelf",
  "stock",
  "supplier",
];

export const PRODUCTS_DEFAULT_COLUMNS: ProductColumnVisibility = {
  limit: true,
  cost: true,
  wholesale: true,
  retail: true,
  article: true,
  quantity: true,
  unit: true,
  shelf: true,
  stock: true,
  supplier: true,
  image: true,
  margin: true,
  barcode: true,
};

export const PRODUCTS_COLUMNS_STORAGE_KEY = "products.columns";

export const PRODUCTS_SELECT_COLUMN_WIDTH = 3;

export const PRODUCTS_ACTIONS_COLUMN_WIDTH = 9;

export const PRODUCTS_NAME_COLUMN_WEIGHT = 280;

export const PRODUCTS_COLUMN_WEIGHTS: Record<ProductTableColumnKey, number> = {
  limit: 90,
  cost: 100,
  wholesale: 125,
  retail: 125,
  article: 110,
  quantity: 80,
  unit: 80,
  shelf: 140,
  stock: 90,
  supplier: 130,
};

export const PRODUCT_CREATE_MAX_ROWS = 300;

export const PRODUCT_CREATE_ROUND_STEP = 1000;

export const PRODUCT_CREATE_PATH = "/product/all-products/create";

export const PRODUCTS_LIST_PATH = "/product/all-products";

export const PRODUCT_CREATE_DEFAULT_UNIT = "dona";

export const PRODUCT_CREATE_IMAGE_ACCEPT = "image/*";
