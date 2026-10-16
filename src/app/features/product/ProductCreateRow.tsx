"use client";

import { Check, Layers, Pencil, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
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
import type {
  ProductCreateFormValues,
  ProductRowMode,
} from "@/types/product.types";
import { createEmptyVariant } from "@/utils/product-create";

type ProductCreateRowProps = {
  form: UseFormReturn<ProductCreateFormValues, unknown, ProductCreateFormValues>;
  index: number;
  unitOptions: SelectOption[];
  currencyCode: string;
  canRemove: boolean;
  corner?: ReactNode;
  onRemove: () => void;
};

export function ProductCreateRow({
  form,
  index,
  unitOptions,
  currencyCode,
  canRemove,
  corner,
  onRemove,
}: ProductCreateRowProps) {
  const t = useTranslations("productCreate");
  const tAll = useTranslations();

  const base = `rows.${index}` as const;
  const variantsPath = `${base}.variants` as const;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: variantsPath,
  });

  const mode = useWatch({ control: form.control, name: `${base}.mode` });
  const name = useWatch({ control: form.control, name: `${base}.name` });
  const unitId = useWatch({ control: form.control, name: `${base}.unitId` });
  const variants = useWatch({ control: form.control, name: variantsPath });

  const translateError = (message?: string) =>
    message ? tAll(message as Parameters<typeof tAll>[0]) : undefined;

  const setMode = (next: ProductRowMode) =>
    form.setValue(`${base}.mode`, next, { shouldDirty: true });

  const handleCancelVariants = () => {
    for (let position = fields.length - 1; position > 0; position -= 1) {
      remove(position);
    }
    form.setValue(`${variantsPath}.0.name`, "");
    setMode("single");
  };

  const handleFinish = async () => {
    const valid = await form.trigger(base as never);
    if (valid) setMode("done");
  };

  const unitLabel = unitOptions.find((option) => option.value === unitId)?.label;

  const nameField = (
    <Controller
      control={form.control}
      name={`${base}.name`}
      render={({ field, fieldState }) => (
        <BaseInputAddon
          id={`product-${index}-name`}
          label={t("name")}
          required
          placeholder={t("namePlaceholder")}
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
      name={`${base}.unitId`}
      render={({ field, fieldState }) => (
        <div className="flex min-w-0 flex-col gap-1.5">
          <BaseSelect
            id={`product-${index}-unit`}
            label={t("unit")}
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

  return (
    <section className="relative flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-xs font-semibold">
          {index + 1}
        </span>
        {canRemove ? (
          <BaseButtonDelete
            label={t("removeRow")}
            className="size-6"
            onClick={onRemove}
          />
        ) : null}
      </div>

      {mode === "single" ? (
        <>
          <ProductCreateVariant
            form={form}
            rowIndex={index}
            variantIndex={0}
            showName={false}
            currencyCode={currencyCode}
            leading={
              <>
                <div className="sm:col-span-2 xl:col-span-1">{nameField}</div>
                {unitField}
              </>
            }
          />
          <div>
            <Button
              type="button"
              variant="ghost"
              className="h-8 gap-2 px-2 text-primary hover:bg-transparent hover:text-primary hover:underline"
              onClick={() => setMode("variants")}
            >
              <Layers />
              {t("addVariants")}
            </Button>
          </div>
        </>
      ) : null}

      {mode === "variants" ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_16rem]">
            {nameField}
            {unitField}
          </div>
          <p className="text-xs text-muted-foreground">{t("variantsHint")}</p>

          <div className="flex flex-col gap-3">
            {fields.map((field, variantIndex) => (
              <div
                key={field.id}
                className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("variant", { index: variantIndex + 1 })}
                  </span>
                  {fields.length > 1 ? (
                    <BaseButtonDelete
                      label={t("removeVariant")}
                      onClick={() => remove(variantIndex)}
                    />
                  ) : null}
                </div>
                <ProductCreateVariant
                  form={form}
                  rowIndex={index}
                  variantIndex={variantIndex}
                  showName
                  currencyCode={currencyCode}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2"
              onClick={() => append(createEmptyVariant())}
            >
              <Plus />
              {t("addVariant")}
            </Button>
            <Button type="button" className="h-10 gap-2" onClick={handleFinish}>
              <Check />
              {t("finishVariants")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2"
              onClick={handleCancelVariants}
            >
              <X />
              {t("cancelVariants")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("finishHint")}</p>
        </>
      ) : null}

      {mode === "done" ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">
              {[unitLabel, t("variantsCount", { count: variants?.length ?? 0 })]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <ul className="flex flex-wrap gap-1.5 pt-1">
              {(variants ?? []).map((variant, variantIndex) => (
                <li
                  key={variantIndex}
                  className="rounded-md border bg-muted px-2 py-0.5 text-xs"
                >
                  {variant.name}
                </li>
              ))}
            </ul>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-2"
            onClick={() => setMode("variants")}
          >
            <Pencil />
            {t("editVariants")}
          </Button>
        </div>
      ) : null}

      {corner ? (
        <div className="absolute -bottom-4 -right-4 z-10">{corner}</div>
      ) : null}
    </section>
  );
}
