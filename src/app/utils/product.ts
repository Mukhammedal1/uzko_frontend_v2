import type {
  CurrencyMap,
  ProductBulkTarget,
  ProductRow,
  ProductsPage,
  ProductVariantRow,
} from "@/types/product.types";
import { getCurrencyCode } from "@/utils/currency";
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

const toLabel = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  if (typeof value.name === "string") return value.name;
  if (isRecord(value.name)) return toText(value.name.uz);
  return toText(value.title);
};

const toImageUrl = (raw: Raw): string | null => {
  const file = isRecord(raw.file) ? raw.file : isRecord(raw.image) ? raw.image : null;
  const fileId = file?.id ?? raw.file_id;

  if (typeof fileId === "number" || typeof fileId === "string") {
    return getFileUrl(Number(fileId));
  }
  return null;
};

const toCurrency = (
  nested: unknown,
  id: unknown,
  currencies: CurrencyMap,
): string => {
  const fromObject = getCurrencyCode(nested);
  if (fromObject) return fromObject;
  if (typeof id === "number") return currencies[id] ?? "";
  return "";
};

const toVariant = (raw: Raw, currencies: CurrencyMap): ProductVariantRow => ({
  id: toNumber(raw.id),
  name: toText(raw.name),
  article: toText(raw.artikul ?? raw.article ?? raw.sku),
  quantity: toNumber(raw.quantity),
  alertQuantity: toNumber(raw.alert_quantity),
  purchasePrice: toNumber(raw.purchase_price),
  purchaseCurrency: toCurrency(
    raw.purchase_price_currency ?? raw.purchase_currency,
    raw.purchase_price_currency_id,
    currencies,
  ),
  wholesalePrice: toNumber(raw.wholesale_price),
  wholesaleCurrency: toCurrency(
    raw.wholesale_price_currency ?? raw.wholesale_currency,
    raw.wholesale_price_currency_id,
    currencies,
  ),
  wholesalePercentage: toNumber(raw.wholesale_price_percentage),
  retailPrice: toNumber(raw.retail_price),
  retailCurrency: toCurrency(
    raw.retail_price_currency ?? raw.retail_currency,
    raw.retail_price_currency_id,
    currencies,
  ),
  retailPercentage: toNumber(raw.retail_price_percentage),
  imageUrl: toImageUrl(raw),
  stock: toLabel(raw.stock) || toText(raw.stock_name),
  shelf: toLabel(raw.shelf_number ?? raw.shelfNumber) || toText(raw.shelf_number_name),
  supplier: toLabel(raw.supplier) || toText(raw.supplier_name),
  barcodes: Array.isArray(raw.barcodes)
    ? raw.barcodes.map((barcode) =>
        isRecord(barcode) ? toText(barcode.barcode ?? barcode.code) : toText(barcode),
      )
    : [],
});

const toProduct = (raw: Raw, currencies: CurrencyMap): ProductRow => {
  const rawVariants = raw.variants ?? raw.product_variants ?? raw.productVariants;
  const variants = Array.isArray(rawVariants)
    ? rawVariants.filter(isRecord).map((variant) => toVariant(variant, currencies))
    : "purchase_price" in raw || "retail_price" in raw
      ? [toVariant(raw, currencies)]
      : [];

  return {
    id: toNumber(raw.id),
    name: toText(raw.name) || variants[0]?.name || "",
    unit: toLabel(raw.unit) || toText(raw.unit_name),
    imageUrl: toImageUrl(raw) ?? variants.find((variant) => variant.imageUrl)?.imageUrl ?? null,
    variants,
  };
};

const findList = (raw: unknown): unknown[] => {
  if (Array.isArray(raw)) return raw;
  if (!isRecord(raw)) return [];

  for (const key of ["data", "items", "products", "results", "rows"]) {
    const value = raw[key];
    if (Array.isArray(value)) return value;
    if (isRecord(value)) {
      const nested = findList(value);
      if (nested.length > 0) return nested;
    }
  }
  return [];
};

type NormalizeOptions = {
  currencies: CurrencyMap;
  page: number;
  limit: number;
};

export const normalizeProductsPage = (
  raw: unknown,
  { currencies, page, limit }: NormalizeOptions,
): ProductsPage => {
  const items = findList(raw)
    .filter(isRecord)
    .map((item) => toProduct(item, currencies));

  const root = isRecord(raw) ? raw : {};
  const dataRoot = isRecord(root.data) ? root.data : {};
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
    total,
    page: toNumber(meta.page ?? meta.current_page ?? meta.currentPage, page),
    limit: pageSize,
    totalPages: Math.max(1, totalPages),
  };
};

export const isLowStock = (variant: ProductVariantRow) =>
  variant.alertQuantity > 0 && variant.quantity <= variant.alertQuantity;

export const getProductSelectionKey = (id: number) => `p:${id}`;

export const getVariantSelectionKey = (id: number) => `v:${id}`;

export const pickSelectedProducts = (
  products: ProductRow[],
  selected: Set<string>,
): ProductRow[] =>
  products.flatMap((product) => {
    if (selected.has(getProductSelectionKey(product.id))) return [product];

    const variants = product.variants.filter((variant) =>
      selected.has(getVariantSelectionKey(variant.id)),
    );
    return variants.length > 0 ? [{ ...product, variants }] : [];
  });

export const buildBulkEditQuery = (products: ProductRow[]) =>
  products
    .map(
      (product) =>
        `${product.id}:${product.variants.map((variant) => variant.id).join(".")}`,
    )
    .join(",");

export const parseBulkEditQuery = (value: unknown): ProductBulkTarget[] => {
  if (typeof value !== "string") return [];

  return value.split(",").flatMap((part) => {
    const [idText = "", variantsText = ""] = part.split(":");
    const productId = Number(idText);
    if (!Number.isInteger(productId) || productId <= 0) return [];

    const variantIds = variantsText
      .split(".")
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0);

    return [{ productId, variantIds }];
  });
};
