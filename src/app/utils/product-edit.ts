import type {
  ProductEditSubmit,
  ProductRowFormValues,
  ProductVariantFormValues,
  VariantWritePayload,
} from "@/types/product.types";
import { PRODUCT_DEFAULT_BOX_QUANTITY } from "@/constants/product/product.constants";
import { getFileUrl } from "@/utils/menu";
import { toVariantPayload } from "@/utils/product-create";

type Raw = Record<string, unknown>;

const isRecord = (value: unknown): value is Raw =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toText = (value: unknown) => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

const toNumeric = (value: unknown, keepZero = false) => {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isFinite(parsed)) return "";
  if (parsed === 0 && !keepZero) return "";
  return String(Math.round(parsed * 100) / 100);
};

const toId = (direct: unknown, nested: unknown) => {
  if (typeof direct === "number") return String(direct);
  if (isRecord(nested) && typeof nested.id === "number") {
    return String(nested.id);
  }
  return "";
};

const toBarcodes = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) =>
          isRecord(item) ? toText(item.barcode ?? item.code) : toText(item),
        )
        .filter(Boolean)
    : [];

const toVariantValues = (raw: Raw): ProductVariantFormValues => {
  const file = isRecord(raw.file) ? raw.file : isRecord(raw.image) ? raw.image : null;
  const fileIdRaw = raw.file_id ?? file?.id;
  const fileId = typeof fileIdRaw === "number" ? fileIdRaw : null;

  return {
    id: typeof raw.id === "number" ? raw.id : null,
    name: toText(raw.name),
    limit: toNumeric(raw.alert_quantity),
    boxQuantity:
      Number(raw.box_quantity) > PRODUCT_DEFAULT_BOX_QUANTITY
        ? toNumeric(raw.box_quantity)
        : "",
    purchasePrice: toNumeric(raw.purchase_price, true),
    purchaseCurrencyId: toId(
      raw.purchase_price_currency_id,
      raw.purchase_price_currency ?? raw.purchase_currency,
    ),
    wholesalePrice: toNumeric(raw.wholesale_price),
    wholesaleCurrencyId: toId(
      raw.wholesale_price_currency_id,
      raw.wholesale_price_currency ?? raw.wholesale_currency,
    ),
    wholesalePercent: toNumeric(raw.wholesale_price_percentage, true),
    retailPrice: toNumeric(raw.retail_price, true),
    retailCurrencyId: toId(
      raw.retail_price_currency_id,
      raw.retail_price_currency ?? raw.retail_currency,
    ),
    retailPercent: toNumeric(raw.retail_price_percentage, true),
    allowBelowCost: raw.allow_below_cost_sale === true,
    barcodes: toBarcodes(raw.barcodes),
    article: toText(raw.artikul ?? raw.article ?? raw.sku),
    fileId,
    fileName:
      fileId === null
        ? ""
        : toText(file?.original_name ?? file?.name ?? file?.filename),
    stockId: toId(raw.stock_id, raw.stock),
    shelfId: toId(raw.shelf_number_id, raw.shelf_number ?? raw.shelfNumber),
  };
};

const VARIANT_KEYS = ["variants", "product_variants", "productVariants"];

const getRawVariants = (product: Raw) => {
  for (const key of VARIANT_KEYS) {
    if (Array.isArray(product[key])) return product[key] as unknown[];
  }
  return null;
};

const findProduct = (raw: unknown, depth = 0): Raw | null => {
  if (!isRecord(raw) || depth > 4) return null;
  if (getRawVariants(raw)) return raw;

  for (const value of Object.values(raw)) {
    const found = findProduct(value, depth + 1);
    if (found) return found;
  }
  return null;
};

export const normalizeProductForEdit = (raw: unknown): ProductRowFormValues => {
  const product = findProduct(raw) ?? (isRecord(raw) ? raw : {});

  const variants = (getRawVariants(product) ?? [])
    .filter(isRecord)
    .map(toVariantValues);

  return {
    name: toText(product.name) || variants[0]?.name || "",
    unitId: toId(product.unit_id, product.unit),
    mode: variants.length > 1 ? "variants" : "single",
    variants,
  };
};

export const getProductImageUrl = (fileId: number | null) =>
  fileId === null ? undefined : getFileUrl(fileId);

const hasDirty = (value: unknown): boolean => {
  if (value === true) return true;
  if (Array.isArray(value)) return value.some(hasDirty);
  if (isRecord(value)) return Object.values(value).some(hasDirty);
  return false;
};

const toWritePayload = (
  variant: ProductVariantFormValues,
  fallbackName: string,
  defaultCurrencyId: number,
): VariantWritePayload => {
  const base = toVariantPayload(variant, fallbackName, defaultCurrencyId);
  const stock = Number(variant.stockId);
  const shelf = Number(variant.shelfId);

  return {
    ...base,
    alert_quantity: base.alert_quantity ?? 0,
    file_id: variant.fileId,
    ...(stock ? { stock_id: stock } : {}),
    ...(shelf ? { shelf_number_id: shelf } : {}),
  };
};

export const buildProductEditSubmit = (
  productId: number,
  row: ProductRowFormValues,
  dirty: unknown,
  defaultCurrencyId: number,
): ProductEditSubmit => {
  const dirtyRow = isRecord(dirty) ? dirty : {};
  const dirtyVariants = Array.isArray(dirtyRow.variants) ? dirtyRow.variants : [];
  const name = row.name.trim();
  const single = row.variants.length === 1;
  const nameChanged = hasDirty(dirtyRow.name);

  const updates: ProductEditSubmit["updates"] = [];
  const creates: ProductEditSubmit["creates"] = [];

  row.variants.forEach((variant, index) => {
    const fallbackName = single ? name : variant.name.trim();

    if (variant.id === null) {
      const { file_id: fileId, ...payload } = toWritePayload(
        variant,
        fallbackName,
        defaultCurrencyId,
      );
      creates.push({
        ...payload,
        ...(fileId !== null && fileId !== undefined ? { file_id: fileId } : {}),
      });
      return;
    }

    if (!hasDirty(dirtyVariants[index]) && !(single && nameChanged)) return;

    const payload = toWritePayload(variant, fallbackName, defaultCurrencyId);
    updates.push({
      id: variant.id,
      payload: single ? { ...payload, name } : payload,
    });
  });

  const productChanged = nameChanged || hasDirty(dirtyRow.unitId);

  return {
    productId,
    product: productChanged ? { name, unit_id: Number(row.unitId) } : null,
    updates,
    creates,
  };
};
