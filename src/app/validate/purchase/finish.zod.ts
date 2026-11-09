import { z } from "zod";

import { PURCHASE_PAYMENT_PROVIDERS } from "@/constants/purchase/purchase.constants";
import type { PurchasePaymentMethod } from "@/types/purchase.types";

const isNonNegative = (value: string) => {
  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0;
};

export const purchasePaymentSchema = z.object({
  currencyId: z.string(),
  amount: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || isNonNegative(value),
      "validation.numberInvalid",
    ),
});

export const purchaseFinishSchema = z
  .object({
    paymentMethod: z.string().min(1, "validation.required"),
    paymentProvider: z.string(),
    paidAmounts: z.array(purchasePaymentSchema),
    note: z.string().trim(),
    editReason: z.string().trim(),
  })
  .superRefine((values, context) => {
    const providers = PURCHASE_PAYMENT_PROVIDERS[
      values.paymentMethod as PurchasePaymentMethod
    ] ?? [];

    if (providers.length > 0 && !values.paymentProvider) {
      context.addIssue({
        code: "custom",
        message: "validation.required",
        path: ["paymentProvider"],
      });
    }
  });
