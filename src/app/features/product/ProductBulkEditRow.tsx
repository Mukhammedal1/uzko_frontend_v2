"use client";

import { useTranslations } from "next-intl";
import { Layers, Plus } from "lucide-react";
import {
  Controller,
  useFieldArray,
  useWatch,
  type UseFormReturn,
} from "react-hook-form";

import { BaseButtonDelete } from "@/component/base/button/BaseButtonDelete";
import { BaseInputAddon } from "@/component/base/input/BaseInputAddon";
import { BaseSelect } from "@/component/base/select/BaseSelect";
import { Button } from "@/component/ui/button";
import { ProductCreateVariant } from "@/features/product/ProductCreateVariant";
import type { SelectOption } from "@/types/common.types";
import type { ProductCreateFormValues } from "@/types/product.types";
import { createEmptyVariant } from "@/utils/product-create";

type ProductBulkEditRowProps = {
  form: UseFormReturn<
    ProductCreateFormValues,
    unknown,
    ProductCreateFormValues
  >;
  rowIndex: number;
  variantIds: number[];
  unitOptions: SelectOption[];
  currencyOptions: SelectOption[];
  currencyRates: Record<string, number>;
  defaultCurrencyId: string;
  stockOptions: SelectOption[];
  shelfOptions: SelectOption[];
};

export function ProductBulkEditRow({
  form,
  rowIndex,
  variantIds,
  unitOptions,
  currencyOptions,
  currencyRates,
  defaultCurrencyId,
  stockOptions,
  shelfOptions,
}: ProductBulkEditRowProps) {
  const tCreate = useTranslations("productCreate");
  const tAll = useTranslations();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `rows.${rowIndex}.variants`,
  });
  const variants = useWatch({
    control: form.control,
    name: `rows.${rowIndex}.variants`,
  });

  const multi = fields.length > 1;
  const visibleVariantIndexes = fields.flatMap((_, index) => {
    const id = variants?.[index]?.id ?? null;
    return id === null || variantIds.length === 0 || variantIds.includes(id)
      ? [index]
      : [];
  });

  const handleAddVariant = () => {
    const first = form.getValues(`rows.${rowIndex}.variants.0`);

    if (!multi) {
      if (!first.name.trim()) {
        form.setValue(
          `rows.${rowIndex}.variants.0.name`,
          form.getValues(`rows.${rowIndex}.name`),
          { shouldDirty: true },
        );
      }
      form.setValue(`rows.${rowIndex}.mode`, "variants");
    }

    append(createEmptyVariant(first));
  };

  const translateError = (message?: string) =>
    message ? tAll(message as Parameters<typeof tAll>[0]) : undefined;

  const nameField = (
    <Controller
      control={form.control}
      name={`rows.${rowIndex}.name`}
      render={({ field, fieldState }) => (
        <BaseInputAddon
          id={`product-bulk-${rowIndex}-name`}
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
      name={`rows.${rowIndex}.unitId`}
      render={({ field, fieldState }) => (
        <div className="flex min-w-0 flex-col gap-1.5">
          <BaseSelect
            id={`product-bulk-${rowIndex}-unit`}
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

  const variantProps = {
    form,
    rowIndex,
    currencyOptions,
    currencyRates,
    defaultCurrencyId,
    stockOptions,
    shelfOptions,
  };

  if (!multi) {
    return (
      <div className="flex flex-col gap-1 rounded-lg border bg-card px-3 pb-3 pt-5 shadow-sm">
        <ProductCreateVariant
          {...variantProps}
          variantIndex={0}
          showName={false}
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

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card px-3 pb-3 pt-5 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        {nameField}
        {unitField}
      </div>

      <div className="flex flex-col gap-3">
        {visibleVariantIndexes.map((index) => (
          <div
            key={index}
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
              {...variantProps}
              variantIndex={index}
              showName
            />
          </div>
        ))}
      </div>

      <div>{addVariantButton}</div>
    </div>
  );
}
