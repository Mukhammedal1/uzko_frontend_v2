import { z } from "zod";

import { PRODUCT_CREATE_MAX_ROWS } from "@/constants/product/product.constants";

const isNonNegative = (value: string) => {
  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0;
};

const optionalNumber = z
  .string()
  .trim()
  .refine((value) => value === "" || isNonNegative(value), "validation.numberInvalid");

const margin = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || Number(value.replace(/\s/g, "").replace(",", ".")) >= 0,
    "validation.marginNegative",
  );

const requiredNumber = z
  .string()
  .trim()
  .min(1, "validation.required")
  .refine(isNonNegative, "validation.numberInvalid");

export const productVariantSchema = z.object({
  id: z.number().nullable(),
  name: z.string().trim(),
  limit: optionalNumber,
  boxQuantity: optionalNumber,
  purchasePrice: optionalNumber,
  purchaseCurrencyId: z.string(),
  wholesalePrice: optionalNumber,
  wholesaleCurrencyId: z.string(),
  wholesalePercent: margin,
  retailPrice: requiredNumber,
  retailCurrencyId: z.string(),
  retailPercent: margin,
  allowBelowCost: z.boolean(),
  barcodes: z.array(z.string()),
  article: z.string().trim(),
  fileId: z.number().nullable(),
  fileName: z.string(),
  stockId: z.string(),
  shelfId: z.string(),
});

export const productRowSchema = z
  .object({
    name: z.string().trim().min(1, "validation.required"),
    unitId: z.string().min(1, "validation.required"),
    mode: z.enum(["single", "variants", "done"]),
    variants: z.array(productVariantSchema).min(1),
  })
  .superRefine((row, context) => {
    if (row.mode === "single") return;

    row.variants.forEach((variant, index) => {
      if (variant.name.length === 0) {
        context.addIssue({
          code: "custom",
          message: "validation.required",
          path: ["variants", index, "name"],
        });
      }
    });
  });

export const productCreateSchema = z.object({
  roundPrices: z.boolean(),
  rows: z.array(productRowSchema).min(1).max(PRODUCT_CREATE_MAX_ROWS),
});
