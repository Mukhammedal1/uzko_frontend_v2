import type { z } from "zod";

import type { SelectOption } from "@/types/common.types";
import type { productCreateSchema } from "@/validate/product/create.zod";

export type ProductVariantRow = {
  id: number;
  name: string;
  article: string;
  quantity: number;
  alertQuantity: number;
  purchasePrice: number;
  purchaseCurrency: string;
  wholesalePrice: number;
  wholesaleCurrency: string;
  wholesalePercentage: number;
  retailPrice: number;
  retailCurrency: string;
  retailPercentage: number;
  imageUrl: string | null;
  stock: string;
  shelf: string;
  supplier: string;
  barcodes: string[];
};

export type ProductRow = {
  id: number;
  name: string;
  unit: string;
  imageUrl: string | null;
  variants: ProductVariantRow[];
};

export type ProductsPage = {
  items: ProductRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ProductsQueryParams = {
  page: number;
  limit: number;
  search?: string;
  stock_id?: number;
  supplier_id?: number;
  unit_id?: number;
  shelf_number_id?: number;
  in_stock?: boolean;
  available_limit?: boolean;
  available_image?: boolean;
  available_barcode?: boolean;
};

export type ProductSelectFilterKey =
  | "stock_id"
  | "supplier_id"
  | "unit_id"
  | "shelf_number_id";

export type ProductBoolFilterKey =
  | "available_image"
  | "in_stock"
  | "available_limit"
  | "available_barcode";

export type ProductFilterKey = ProductSelectFilterKey | ProductBoolFilterKey;

export type ProductBoolFilterValue = "all" | "yes" | "no";

export type ProductFilters = Record<ProductSelectFilterKey, string> &
  Record<ProductBoolFilterKey, ProductBoolFilterValue>;

export type ProductFilterOptions = Record<
  ProductSelectFilterKey,
  SelectOption[]
>;

export type BulkDeletePayload = {
  product_ids?: number[];
  variant_ids?: number[];
};

export type ProductDeleteTarget =
  | { kind: "product" | "variant"; id: number; name: string }
  | { kind: "bulk"; productIds: number[]; variantIds: number[]; count: number };

export type CurrencyMap = Record<number, string>;

export type PriceKey = "wholesalePrice" | "retailPrice";

export type CurrencyKey =
  | "purchaseCurrencyId"
  | "wholesaleCurrencyId"
  | "retailCurrencyId";

export type ProductColumnKey =
  | "limit"
  | "cost"
  | "wholesale"
  | "retail"
  | "article"
  | "quantity"
  | "unit"
  | "shelf"
  | "stock"
  | "supplier"
  | "image"
  | "margin"
  | "barcode";

export type ProductTableColumnKey = Exclude<
  ProductColumnKey,
  "image" | "margin" | "barcode"
>;

export type ProductColumnVisibility = Record<ProductColumnKey, boolean>;

export type ProductCreateFormValues = z.infer<typeof productCreateSchema>;

export type ProductRowFormValues = ProductCreateFormValues["rows"][number];

export type ProductVariantFormValues = ProductRowFormValues["variants"][number];

export type ProductRowMode = ProductRowFormValues["mode"];

export type CreateProductVariantPayload = {
  name: string;
  artikul?: string;
  alert_quantity?: number;
  box_quantity: number;
  allow_below_cost_sale: boolean;
  purchase_price: number;
  purchase_price_currency_id: number;
  retail_price: number;
  retail_price_currency_id: number;
  retail_price_percentage?: number;
  wholesale_price?: number;
  wholesale_price_currency_id?: number;
  wholesale_price_percentage?: number;
  file_id?: number;
  barcodes?: string[];
};

export type VariantWritePayload = Omit<CreateProductVariantPayload, "file_id"> & {
  file_id?: number | null;
  stock_id?: number;
  shelf_number_id?: number;
};

export type UpsertVariantItem = VariantWritePayload & { id?: number };

export type BulkUpdateProductItem = {
  id: number;
  name?: string;
  unit_id?: number;
  variants?: UpsertVariantItem[];
};

export type BulkUpdateProductsPayload = {
  products: BulkUpdateProductItem[];
};

export type UpdateProductPayload = {
  name?: string;
  unit_id: number;
};

export type ProductEditSubmit = {
  productId: number;
  product: UpdateProductPayload | null;
  updates: { id: number; payload: VariantWritePayload }[];
  creates: VariantWritePayload[];
};

export type CreateProductPayload = {
  name?: string;
  unit_id: number;
  variants: CreateProductVariantPayload[];
};

export type CreateProductsPayload = {
  products: CreateProductPayload[];
};

export type UploadedFile = {
  id: number;
};

export type MainCurrency = {
  id: number;
  code: string;
  rate: number;
};

export type ProductBulkTarget = {
  productId: number;
  variantIds: number[];
};
