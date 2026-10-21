"use client";

import { ArrowLeft, Check, Layers, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { toast } from "react-toastify";

import { BaseButtonDelete } from "@/component/base/button/BaseButtonDelete";
import { BaseInputAddon } from "@/component/base/input/BaseInputAddon";
import { BaseSelect } from "@/component/base/select/BaseSelect";
import { Button } from "@/component/ui/button";
import { PRODUCTS_LIST_PATH } from "@/constants/product/product.constants";
import { ProductCreateVariant } from "@/features/product/ProductCreateVariant";
import { useZodForm } from "@/plugins/react-hook-form";
import { useMainCurrencyQuery } from "@/rest/query/currency/currency.query";
import {
  useProductDetailQuery,
  useUpdateProductMutation,
} from "@/rest/query/product/product.query";
import { useShelfNumbersQuery } from "@/rest/query/shelf-number/shelf-number.query";
import { useStocksQuery } from "@/rest/query/stock/stock.query";
import { useUnitsQuery } from "@/rest/query/unit/unit.query";
import type { ProductCreateFormValues } from "@/types/product.types";
import { createEmptyRow, createEmptyVariant } from "@/utils/product-create";
import {
  buildProductEditSubmit,
  normalizeProductForEdit,
} from "@/utils/product-edit";
import { productCreateSchema } from "@/validate/product/create.zod";

export function ProductEdit() {
  const t = useTranslations("productEdit");
  const tCreate = useTranslations("productCreate");
  const tAll = useTranslations();
  const router = useRouter();

  const productId = router.isReady ? Number(router.query.id) : Number.NaN;

  const detail = useProductDetailQuery(productId);
  const { options: unitOptions } = useUnitsQuery();
  const { options: stockOptions } = useStocksQuery();
  const { options: shelfOptions } = useShelfNumbersQuery();
  const { mainCurrency, currencyOptions, currencyRates } =
    useMainCurrencyQuery();
  const updateProduct = useUpdateProductMutation();

  const form = useZodForm(productCreateSchema, {
    defaultValues: { roundPrices: false, rows: [createEmptyRow()] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rows.0.variants",
  });

  const loaded = useMemo(
    () =>
      detail.data === undefined ? null : normalizeProductForEdit(detail.data),
    [detail.data],
  );

  useEffect(() => {
    if (!loaded) return;

    form.reset({
      roundPrices: false,
      rows: [
        loaded.variants.length > 0
          ? loaded
          : { ...loaded, variants: [createEmptyVariant()] },
      ],
    });
  }, [loaded, form]);

  const variants = useWatch({ control: form.control, name: "rows.0.variants" });
  const { dirtyFields } = form.formState;

  const multi = (variants?.length ?? 0) > 1;

  const variantParam = router.isReady ? Number(router.query.variant) : Number.NaN;
  const targetIndex = Number.isFinite(variantParam)
    ? (variants ?? []).findIndex((variant) => variant.id === variantParam)
    : -1;
  const variantMode = multi && targetIndex >= 0;
  const defaultCurrencyId = mainCurrency ? String(mainCurrency.id) : "";

  const translateError = (message?: string) =>
    message ? tAll(message as Parameters<typeof tAll>[0]) : undefined;

  const handleAddVariant = () => {
    const first = form.getValues("rows.0.variants.0");

    if (!multi) {
      if (!first.name.trim()) {
        form.setValue("rows.0.variants.0.name", form.getValues("rows.0.name"), {
          shouldDirty: true,
        });
      }
      form.setValue("rows.0.mode", "variants");
    }

    append(createEmptyVariant(first));
  };

  const handleSubmit = form.handleSubmit((values: ProductCreateFormValues) => {
    if (!mainCurrency) {
      toast.error(tCreate("noCurrency"), { toastId: "product-edit-currency" });
      return;
    }

    const submit = buildProductEditSubmit(
      productId,
      values.rows[0],
      dirtyFields.rows?.[0],
      mainCurrency.id,
    );

    if (!submit.product && !submit.updates.length && !submit.creates.length) {
      router.push(PRODUCTS_LIST_PATH);
      return;
    }

    updateProduct.mutate(submit, {
      onSuccess: () => router.push(PRODUCTS_LIST_PATH),
    });
  });

  const nameField = (
    <Controller
      control={form.control}
      name="rows.0.name"
      render={({ field, fieldState }) => (
        <BaseInputAddon
          id="product-edit-name"
          label={tCreate("name")}
          required
          placeholder={tCreate("namePlaceholder")}
          value={field.value}
          error={translateError(fieldState.error?.message)}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
      )}
    />
  );

  const unitField = (
    <Controller
      control={form.control}
      name="rows.0.unitId"
      render={({ field, fieldState }) => (
        <div className="flex min-w-0 flex-col gap-1.5">
          <BaseSelect
            id="product-edit-unit"
            label={tCreate("unit")}
            required
            labelClassName="text-foreground"
            triggerClassName="data-[size=default]:h-9 py-1 px-2.5"
            value={field.value}
            options={unitOptions}
            onChange={field.onChange}
          />
          {fieldState.error ? (
            <p role="alert" className="text-xs text-destructive">
              {translateError(fieldState.error.message)}
            </p>
          ) : null}
        </div>
      )}
    />
  );

  const addVariantButton = (
    <Button
      type="button"
      variant="ghost"
      className="h-7 gap-2 px-2 text-primary hover:bg-transparent hover:text-primary hover:underline"
      onClick={handleAddVariant}
    >
      {multi ? <Plus /> : <Layers />}
      {multi ? tCreate("addVariant") : tCreate("addVariants")}
    </Button>
  );

  const renderBody = () => {
    if (detail.isPending || !loaded || fields.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          {detail.isError ? t("notFound") : t("loading")}
        </p>
      );
    }

    if (!multi) {
      return (
        <div className="flex flex-col gap-1 rounded-lg border bg-card px-3 pb-3 pt-5 shadow-sm">
          <ProductCreateVariant
            form={form}
            rowIndex={0}
            variantIndex={0}
            showName={false}
            currencyOptions={currencyOptions}
            currencyRates={currencyRates}
            defaultCurrencyId={defaultCurrencyId}
            stockOptions={stockOptions}
            shelfOptions={shelfOptions}
            leading={
              <>
                <div className="sm:col-span-2 xl:col-span-1">{nameField}</div>
                {unitField}
              </>
            }
          />
          <div>{addVariantButton}</div>
        </div>
      );
    }

    if (variantMode) {
      return (
        <div className="flex flex-col gap-2 rounded-lg border bg-card px-3 pb-3 pt-5 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
            {nameField}
            {unitField}
          </div>

          <div className="flex flex-col gap-3">
            {fields.map((field, index) =>
              index === targetIndex || variants?.[index]?.id === null ? (
                <div
                  key={field.id}
                  className="flex flex-col gap-3 rounded-lg border bg-card p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {tCreate("variant", { index: index + 1 })}
                    </span>
                    {variants?.[index]?.id === null ? (
                      <BaseButtonDelete
                        label={tCreate("removeVariant")}
                        onClick={() => remove(index)}
                      />
                    ) : null}
                  </div>
                  <ProductCreateVariant
                    form={form}
                    rowIndex={0}
                    variantIndex={index}
                    showName
                    currencyOptions={currencyOptions}
                    currencyRates={currencyRates}
                    defaultCurrencyId={defaultCurrencyId}
                    stockOptions={stockOptions}
                    shelfOptions={shelfOptions}
                  />
                </div>
              ) : null,
            )}
          </div>

          <div>{addVariantButton}</div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 rounded-lg border bg-card px-3 pb-3 pt-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          {nameField}
          {unitField}
        </div>

        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-3 rounded-lg border bg-card p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {tCreate("variant", { index: index + 1 })}
                </span>
                {variants?.[index]?.id === null ? (
                  <BaseButtonDelete
                    label={tCreate("removeVariant")}
                    onClick={() => remove(index)}
                  />
                ) : null}
              </div>
              <ProductCreateVariant
                form={form}
                rowIndex={0}
                variantIndex={index}
                showName
                currencyOptions={currencyOptions}
                currencyRates={currencyRates}
                defaultCurrencyId={defaultCurrencyId}
                stockOptions={stockOptions}
                shelfOptions={shelfOptions}
              />
            </div>
          ))}
        </div>

        <div>{addVariantButton}</div>
      </div>
    );
  };

  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col p-3 sm:px-5"
      onSubmit={handleSubmit}
    >
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex min-w-0 flex-col gap-0.5">
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
              {tCreate("back")}
            </Button>
            <Button
              type="submit"
              className="h-10 gap-2"
              disabled={updateProduct.isPending || !loaded}
            >
              <Check />
              {updateProduct.isPending ? tCreate("saving") : tCreate("save")}
            </Button>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 pb-6">
          {renderBody()}
        </div>
      </section>
    </form>
  );
}
