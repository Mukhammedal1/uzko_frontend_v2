"use client";

import { ArrowLeft, Check, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { toast } from "react-toastify";

import { Button } from "@/component/ui/button";
import { Label } from "@/component/ui/label";
import { Switch } from "@/component/ui/switch";
import {
  PRODUCT_CREATE_DEFAULT_UNIT,
  PRODUCT_CREATE_MAX_ROWS,
  PRODUCTS_LIST_PATH,
} from "@/constants/product/product.constants";
import { ProductCreateRow } from "@/features/product/ProductCreateRow";
import { useZodForm } from "@/plugins/react-hook-form";
import { useMainCurrencyQuery } from "@/rest/query/currency/currency.query";
import { useCreateProductsMutation } from "@/rest/query/product/product.query";
import { useUnitsQuery } from "@/rest/query/unit/unit.query";
import type { ProductCreateFormValues } from "@/types/product.types";
import { buildCreatePayload, createEmptyRow } from "@/utils/product-create";
import { productCreateSchema } from "@/validate/product/create.zod";

export function ProductCreate() {
  const t = useTranslations("productCreate");
  const router = useRouter();

  const { options: unitOptions } = useUnitsQuery();
  const { mainCurrency } = useMainCurrencyQuery();
  const createProducts = useCreateProductsMutation();

  const form = useZodForm(productCreateSchema, {
    defaultValues: { roundPrices: false, rows: [createEmptyRow()] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rows",
  });

  const roundPrices = useWatch({ control: form.control, name: "roundPrices" });
  const rows = useWatch({ control: form.control, name: "rows" });

  const defaultUnitId = useMemo(() => {
    const preferred = unitOptions.find(
      (option) =>
        option.label.trim().toLowerCase() === PRODUCT_CREATE_DEFAULT_UNIT,
    );
    return (preferred ?? unitOptions[0])?.value ?? "";
  }, [unitOptions]);

  useEffect(() => {
    if (!defaultUnitId) return;

    form.getValues("rows").forEach((row, index) => {
      if (!row.unitId) form.setValue(`rows.${index}.unitId`, defaultUnitId);
    });
  }, [defaultUnitId, form]);

  const hasOpenVariants = (rows ?? []).some((row) => row.mode === "variants");
  const limitReached = fields.length >= PRODUCT_CREATE_MAX_ROWS;
  const canAddRow = !limitReached && !hasOpenVariants;

  const handleAddRow = () => {
    if (canAddRow) append(createEmptyRow(defaultUnitId));
  };

  const handleSubmit = form.handleSubmit((values: ProductCreateFormValues) => {
    if (values.rows.some((row) => row.mode === "variants")) {
      toast.error(t("finishHint"), { toastId: "product-create-variants" });
      return;
    }
    if (!mainCurrency) {
      toast.error(t("noCurrency"), { toastId: "product-create-currency" });
      return;
    }

    createProducts.mutate(buildCreatePayload(values, mainCurrency.id), {
      onSuccess: () => {
        toast.success(t("saved"));
        router.push(PRODUCTS_LIST_PATH);
      },
    });
  });

  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col p-3 sm:px-5"
      onSubmit={handleSubmit}
    >
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b p-3 sm:p-4">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <Switch
                id="product-create-round"
                checked={roundPrices}
                onCheckedChange={(checked) =>
                  form.setValue("roundPrices", checked, { shouldDirty: true })
                }
              />
              <Label htmlFor="product-create-round" className="font-normal">
                {t("roundPrices")}
              </Label>
            </div>
            <h1 className="text-base font-semibold">{t("title")}</h1>
            <p className="text-xs text-muted-foreground">{t("description")}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2"
              onClick={() => router.push(PRODUCTS_LIST_PATH)}
            >
              <ArrowLeft />
              {t("back")}
            </Button>
            <Button
              type="submit"
              className="h-10 gap-2"
              disabled={createProducts.isPending}
            >
              <Check />
              {createProducts.isPending ? t("saving") : t("save")}
            </Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 pb-6">
          <div className="flex flex-col gap-4">
            {fields.map((field, index) => (
              <ProductCreateRow
                key={field.id}
                form={form}
                index={index}
                unitOptions={unitOptions}
                currencyCode={mainCurrency?.code ?? ""}
                canRemove={fields.length > 1}
                corner={
                  index === fields.length - 1 ? (
                    <Button
                      type="button"
                      size="icon"
                      className="size-8 rounded-full shadow-md"
                      disabled={!canAddRow}
                      aria-label={t("addRow")}
                      title={
                        limitReached
                          ? t("maxRows", { count: PRODUCT_CREATE_MAX_ROWS })
                          : hasOpenVariants
                            ? t("finishHint")
                            : t("addRow")
                      }
                      onClick={handleAddRow}
                    >
                      <Plus />
                    </Button>
                  ) : null
                }
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        </div>
      </section>
    </form>
  );
}
