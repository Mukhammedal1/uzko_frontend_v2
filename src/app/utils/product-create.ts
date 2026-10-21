import {
  PRODUCT_CREATE_ROUND_STEP,
  PRODUCT_DEFAULT_BOX_QUANTITY,
} from "@/constants/product/product.constants";
import type {
  CreateProductPayload,
  CreateProductVariantPayload,
  CreateProductsPayload,
  ProductCreateFormValues,
  ProductRowFormValues,
  ProductVariantFormValues,
} from "@/types/product.types";

export const createEmptyVariant = (
  margins?: Pick<ProductVariantFormValues, "wholesalePercent" | "retailPercent">,
): ProductVariantFormValues => ({
  id: null,
  name: "",
  limit: "",
  boxQuantity: "",
  purchasePrice: "",
  purchaseCurrencyId: "",
  wholesalePrice: "",
  wholesaleCurrencyId: "",
  wholesalePercent: margins?.wholesalePercent ?? "",
  retailPrice: "",
  retailCurrencyId: "",
  retailPercent: margins?.retailPercent ?? "",
  allowBelowCost: false,
  barcodes: [],
  article: "",
  fileId: null,
  fileName: "",
  stockId: "",
  shelfId: "",
});

export const createEmptyRow = (
  unitId = "",
  margins?: Parameters<typeof createEmptyVariant>[0],
): ProductRowFormValues => ({
  name: "",
  unitId,
  mode: "single",
  variants: [createEmptyVariant(margins)],
});

export const parseNumber = (value: string) => {
  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const toTwoDecimals = (value: number) => Math.round(value * 100) / 100;

const toText = (value: number) => String(toTwoDecimals(value));

const convert = (amount: number, fromRate: number, toRate: number) =>
  fromRate > 0 && toRate > 0 ? (amount * fromRate) / toRate : amount;

export const roundPrice = (price: number, rate = 1) => {
  const step = rate === 1 ? PRODUCT_CREATE_ROUND_STEP : 1;
  return Math.round(price / step) * step;
};

export const priceFromPercent = (
  cost: string,
  percent: string,
  round: boolean,
  costRate = 1,
  priceRate = 1,
) => {
  if (cost.trim() === "" || percent.trim() === "") return "";

  const withMargin = parseNumber(cost) * (1 + parseNumber(percent) / 100);
  const price = convert(withMargin, costRate, priceRate);
  return toText(round ? roundPrice(price, priceRate) : price);
};

export const percentFromPrice = (
  cost: string,
  price: string,
  costRate = 1,
  priceRate = 1,
) => {
  const costValue = parseNumber(cost);
  if (price.trim() === "" || costValue <= 0) return "";

  const priceInCostCurrency = convert(parseNumber(price), priceRate, costRate);
  return toText((priceInCostCurrency / costValue - 1) * 100);
};

const optionalPositive = (value: string) => {
  const parsed = parseNumber(value);
  return value.trim() !== "" && parsed > 0 ? toTwoDecimals(parsed) : undefined;
};

export const toVariantPayload = (
  variant: ProductVariantFormValues,
  fallbackName: string,
  defaultCurrencyId: number,
): CreateProductVariantPayload => {
  const purchaseCurrencyId =
    Number(variant.purchaseCurrencyId) || defaultCurrencyId;
  const wholesaleCurrencyId =
    Number(variant.wholesaleCurrencyId) || defaultCurrencyId;
  const retailCurrencyId =
    Number(variant.retailCurrencyId) || defaultCurrencyId;
  const wholesale = optionalPositive(variant.wholesalePrice);
  const wholesalePercent = optionalPositive(variant.wholesalePercent);
  const retailPercent = optionalPositive(variant.retailPercent);
  const barcodes = [
    ...new Set(variant.barcodes.map((code) => code.trim()).filter(Boolean)),
  ];
  const article = variant.article.trim();
  const limit = optionalPositive(variant.limit);
  const box =
    optionalPositive(variant.boxQuantity) ?? PRODUCT_DEFAULT_BOX_QUANTITY;

  return {
    name: variant.name.trim() || fallbackName,
    ...(article ? { artikul: article } : {}),
    ...(limit !== undefined ? { alert_quantity: limit } : {}),
    box_quantity: box,
    allow_below_cost_sale: variant.allowBelowCost,
    purchase_price: toTwoDecimals(parseNumber(variant.purchasePrice)),
    purchase_price_currency_id: purchaseCurrencyId,
    retail_price: toTwoDecimals(parseNumber(variant.retailPrice)),
    retail_price_currency_id: retailCurrencyId,
    ...(retailPercent !== undefined
      ? { retail_price_percentage: retailPercent }
      : {}),
    ...(wholesale !== undefined
      ? {
          wholesale_price: wholesale,
          wholesale_price_currency_id: wholesaleCurrencyId,
        }
      : {}),
    ...(wholesalePercent !== undefined
      ? { wholesale_price_percentage: wholesalePercent }
      : {}),
    ...(variant.fileId !== null ? { file_id: variant.fileId } : {}),
    ...(barcodes.length > 0 ? { barcodes } : {}),
  };
};

export const buildCreatePayload = (
  values: ProductCreateFormValues,
  defaultCurrencyId: number,
): CreateProductsPayload => ({
  products: values.rows.map<CreateProductPayload>((row) => ({
    name: row.name.trim(),
    unit_id: Number(row.unitId),
    variants: row.variants.map((variant) =>
      toVariantPayload(variant, row.name.trim(), defaultCurrencyId),
    ),
  })),
});
