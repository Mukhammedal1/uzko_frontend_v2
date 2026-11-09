import { z } from "zod";

import { PURCHASE_MAX_ITEMS } from "@/constants/purchase/purchase.constants";

const toNumber = (value: string) =>
  Number(value.replace(/\s/g, "").replace(",", "."));

const isNonNegative = (value: string) => {
  const parsed = toNumber(value);
  return Number.isFinite(parsed) && parsed >= 0;
};

const optionalNumber = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || isNonNegative(value),
    "validation.numberInvalid",
  );

const requiredNumber = z
  .string()
  .trim()
  .min(1, "validation.required")
  .refine(isNonNegative, "validation.numberInvalid");

const requiredPositive = z
  .string()
  .trim()
  .min(1, "validation.required")
  .refine((value) => toNumber(value) > 0, "validation.numberInvalid");

const margin = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || toNumber(value) >= 0,
    "validation.marginNegative",
  );

export const purchaseItemSchema = z
  .object({
    itemId: z.number().nullable(),
    supplierId: z.string().min(1, "validation.required"),
    productId: z.number().nullable(),
    variantId: z.number().nullable(),
    productName: z.string().trim().min(1, "validation.required"),
    quantity: requiredPositive,
    purchasePrice: requiredNumber,
    purchaseCurrencyId: z.string(),
    wholesalePrice: optionalNumber,
    wholesaleCurrencyId: z.string(),
    wholesalePercent: margin,
    retailPrice: requiredNumber,
    retailCurrencyId: z.string(),
    retailPercent: margin,
    stockId: z.string().min(1, "validation.required"),
    shelfId: z.string(),
  })
  .superRefine((item, context) => {
    if (item.productName.length > 0 && item.variantId === null) {
      context.addIssue({
        code: "custom",
        message: "purchase.create.pickProduct",
        path: ["productName"],
      });
    }
  });

export const purchaseCreateSchema = z.object({
  items: z.array(purchaseItemSchema).min(1).max(PURCHASE_MAX_ITEMS),
});
