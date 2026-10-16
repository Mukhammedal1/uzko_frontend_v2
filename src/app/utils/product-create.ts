import { PRODUCT_CREATE_ROUND_STEP } from "@/constants/product/product.constants";
import type {
  CreateProductPayload,
  CreateProductVariantPayload,
  CreateProductsPayload,
  ProductCreateFormValues,
  ProductRowFormValues,
  ProductVariantFormValues,
} from "@/types/product.types";

export const createEmptyVariant = (): ProductVariantFormValues => ({
  name: "",
  limit: "",
  boxQuantity: "",
  purchasePrice: "",
  wholesalePrice: "",
  wholesalePercent: "",
  retailPrice: "",
  retailPercent: "",
  allowBelowCost: false,
  barcode: "",
  article: "",
  fileId: null,
  fileName: "",
});

export const createEmptyRow = (unitId = ""): ProductRowFormValues => ({
  name: "",
  unitId,
  mode: "single",
  variants: [createEmptyVariant()],
});

export const parseNumber = (value: string) => {
  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const toTwoDecimals = (value: number) => Math.round(value * 100) / 100;

const toText = (value: number) => String(toTwoDecimals(value));

export const priceFromPercent = (
  cost: string,
  percent: string,
  round: boolean,
) => {
  if (cost.trim() === "" || percent.trim() === "") return "";

  const price = parseNumber(cost) * (1 + parseNumber(percent) / 100);
  return toText(
    round
      ? Math.ceil(price / PRODUCT_CREATE_ROUND_STEP) * PRODUCT_CREATE_ROUND_STEP
      : price,
  );
};

export const percentFromPrice = (cost: string, price: string) => {
  const costValue = parseNumber(cost);
  if (price.trim() === "" || costValue <= 0) return "";

  return toText((parseNumber(price) / costValue - 1) * 100);
};

const digits = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10));

export const generateBarcode = () => {
  const body = digits(12);
  const sum = body.reduce(
    (total, digit, index) => total + digit * (index % 2 === 0 ? 1 : 3),
    0,
  );
  const check = (10 - (sum % 10)) % 10;

  return [...body, check].join("");
};

export const generateArticle = () => `UZKO${digits(5).join("")}`;

const optionalPositive = (value: string) => {
  const parsed = parseNumber(value);
  return value.trim() !== "" && parsed > 0 ? toTwoDecimals(parsed) : undefined;
};

const toVariantPayload = (
  variant: ProductVariantFormValues,
  fallbackName: string,
  currencyId: number,
): CreateProductVariantPayload => {
  const wholesale = optionalPositive(variant.wholesalePrice);
  const wholesalePercent = optionalPositive(variant.wholesalePercent);
  const retailPercent = optionalPositive(variant.retailPercent);
  const barcode = variant.barcode.trim();
  const article = variant.article.trim();
  const limit = optionalPositive(variant.limit);
  const box = optionalPositive(variant.boxQuantity);

  return {
    name: variant.name.trim() || fallbackName,
    ...(article ? { artikul: article } : {}),
    ...(limit !== undefined ? { alert_quantity: limit } : {}),
    ...(box !== undefined ? { box_quantity: box } : {}),
    allow_below_cost_sale: variant.allowBelowCost,
    purchase_price: toTwoDecimals(parseNumber(variant.purchasePrice)),
    purchase_price_currency_id: currencyId,
    retail_price: toTwoDecimals(parseNumber(variant.retailPrice)),
    retail_price_currency_id: currencyId,
    ...(retailPercent !== undefined
      ? { retail_price_percentage: retailPercent }
      : {}),
    ...(wholesale !== undefined
      ? {
          wholesale_price: wholesale,
          wholesale_price_currency_id: currencyId,
        }
      : {}),
    ...(wholesalePercent !== undefined
      ? { wholesale_price_percentage: wholesalePercent }
      : {}),
    ...(variant.fileId !== null ? { file_id: variant.fileId } : {}),
    ...(barcode ? { barcodes: [barcode] } : {}),
  };
};

export const buildCreatePayload = (
  values: ProductCreateFormValues,
  currencyId: number,
): CreateProductsPayload => ({
  products: values.rows.map<CreateProductPayload>((row) => ({
    name: row.name.trim(),
    unit_id: Number(row.unitId),
    variants: row.variants.map((variant) =>
      toVariantPayload(variant, row.name.trim(), currencyId),
    ),
  })),
});
