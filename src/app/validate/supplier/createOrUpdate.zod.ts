import { z } from "zod";

export const supplierFormSchema = z.object({
  fullname: z.string().trim().min(1, "validation.required"),
  phone_number: z.string().trim(),
  organization_name: z.string().trim(),
  organization_inn: z.string().trim(),
  bank_account_number: z.string().trim(),
  address: z.string().trim(),
  note: z.string().trim(),
  debts: z.array(
    z.object({
      currency_id: z.string(),
      amount: z
        .string()
        .trim()
        .refine(
          (value) =>
            value === "" || Number.isFinite(Number(value.replace(/\s/g, ""))),
          "validation.numberInvalid",
        ),
    }),
  ),
});
