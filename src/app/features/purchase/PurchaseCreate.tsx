"use client";

import { Check, PackagePlus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { toast } from "react-toastify";

import { Button } from "@/component/ui/button";
import {
  PURCHASE_MAX_ITEMS,
  PURCHASES_LIST_PATH,
} from "@/constants/purchase/purchase.constants";
import { PurchaseCreateRow } from "@/features/purchase/PurchaseCreateRow";
import { PurchaseFinishDialog } from "@/features/purchase/PurchaseFinishDialog";
import { PurchaseHistory } from "@/features/purchase/PurchaseHistory";
import { useZodForm } from "@/plugins/react-hook-form";
import { useMainCurrencyQuery } from "@/rest/query/currency/currency.query";
import {
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
} from "@/rest/query/purchase/purchase.query";
import { useShelfNumbersQuery } from "@/rest/query/shelf-number/shelf-number.query";
import { useStocksQuery } from "@/rest/query/stock/stock.query";
import { useSuppliersQuery } from "@/rest/query/supplier/supplier.query";
import type {
  PurchaseCreateFormValues,
  PurchaseEditData,
  PurchaseFinishFormValues,
} from "@/types/purchase.types";
import {
  buildPurchasePayload,
  buildPurchaseUpdatePayload,
  calcPurchaseTotals,
  createEmptyPurchaseItem,
} from "@/utils/purchase";
import { purchaseCreateSchema } from "@/validate/purchase/create.zod";

type PurchaseCreateProps = {
  initial?: PurchaseEditData;
};

export function PurchaseCreate({ initial }: PurchaseCreateProps) {
  const t = useTranslations("purchase.create");
  const router = useRouter();

  const { options: supplierOptions } = useSuppliersQuery();
  const { options: stockOptions } = useStocksQuery();
  const { options: shelfOptions } = useShelfNumbersQuery();
  const { mainCurrency, currencyOptions, currencyRates } =
    useMainCurrencyQuery();
  const createMutation = useCreatePurchaseMutation();
  const updateMutation = useUpdatePurchaseMutation(initial?.id ?? 0);
  const createPurchase = initial ? updateMutation : createMutation;
  const editing = initial !== undefined;

  const [pendingValues, setPendingValues] =
    useState<PurchaseCreateFormValues | null>(null);

  const form = useZodForm(purchaseCreateSchema, {
    defaultValues: { items: initial?.items ?? [createEmptyPurchaseItem()] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = useWatch({ control: form.control, name: "items" });

  const defaultStockId = stockOptions[0]?.value ?? "";
  const defaultCurrencyId = mainCurrency ? String(mainCurrency.id) : "";

  useEffect(() => {
    if (!defaultStockId) return;

    form.getValues("items").forEach((item, index) => {
      if (!item.stockId)
        form.setValue(`items.${index}.stockId`, defaultStockId);
    });
  }, [defaultStockId, form]);

  const limitReached = fields.length >= PURCHASE_MAX_ITEMS;

  const handleAddRow = () => {
    if (limitReached) return;

    const last = items?.[items.length - 1];
    append(
      createEmptyPurchaseItem(
        last?.stockId || defaultStockId,
        last?.shelfId,
        items?.[0]?.supplierId,
      ),
    );
  };

  const handleSupplierChange = (supplierId: string) => {
    form.getValues("items").forEach((_, index) => {
      form.setValue(`items.${index}.supplierId`, supplierId, {
        shouldDirty: true,
        shouldValidate: form.formState.isSubmitted,
      });
    });
  };

  const handleSubmit = form.handleSubmit((values: PurchaseCreateFormValues) => {
    if (!mainCurrency) {
      toast.error(t("noCurrency"), { toastId: "purchase-create-currency" });
      return;
    }

    setPendingValues(values);
  });

  const handleCloseFinish = () => {
    createPurchase.reset();
    setPendingValues(null);
  };

  const handleConfirm = (finish: PurchaseFinishFormValues) => {
    if (!pendingValues || !mainCurrency) return;

    const onSuccess = () => router.push(PURCHASES_LIST_PATH);

    if (initial) {
      updateMutation.mutate(
        buildPurchaseUpdatePayload(pendingValues, finish, mainCurrency.id),
        { onSuccess },
      );
      return;
    }

    createMutation.mutate(
      buildPurchasePayload(pendingValues, finish, mainCurrency.id),
      { onSuccess },
    );
  };

  return (
    <>
      <form
        noValidate
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={handleSubmit}
      >
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-3 py-2 sm:px-4 sm:py-3">
            <h1 className="flex items-center gap-2 text-base font-semibold">
              <PackagePlus className="size-5 shrink-0 text-primary" />
              {editing ? t("editTitle") : t("title")}
            </h1>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10"
                onClick={() => router.push(PURCHASES_LIST_PATH)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" className="h-10 gap-2">
                <Check />
                {t("save")}
              </Button>
            </div>
          </header>

          <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 pb-16">
            <div className="flex flex-col gap-4">
              {fields.map((field, index) => (
                <PurchaseCreateRow
                  key={field.id}
                  form={form}
                  index={index}
                  currencyOptions={currencyOptions}
                  currencyRates={currencyRates}
                  defaultCurrencyId={
                    mainCurrency ? String(mainCurrency.id) : ""
                  }
                  stockOptions={stockOptions}
                  shelfOptions={shelfOptions}
                  supplierOptions={supplierOptions}
                  onSupplierChange={handleSupplierChange}
                  canRemove={fields.length > 1}
                  corner={
                    index === fields.length - 1 ? (
                      <Button
                        type="button"
                        size="icon"
                        className="size-8 rounded-full shadow-md"
                        disabled={limitReached}
                        aria-label={t("addRow")}
                        title={
                          limitReached
                            ? t("maxRows", { count: PURCHASE_MAX_ITEMS })
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
              {initial ? <PurchaseHistory purchaseId={initial.id} /> : null}
            </div>
          </div>
        </section>
      </form>

      <PurchaseFinishDialog
        open={pendingValues !== null}
        totals={
          pendingValues
            ? calcPurchaseTotals(pendingValues, defaultCurrencyId)
            : { count: 0, firstName: "", firstQuantity: 0, byCurrency: [] }
        }
        currencyOptions={currencyOptions}
        defaultCurrencyId={defaultCurrencyId}
        supplierId={pendingValues?.items[0]?.supplierId ?? ""}
        pending={createPurchase.isPending}
        editing={editing}
        defaults={initial?.finish}
        onConfirm={handleConfirm}
        onClose={handleCloseFinish}
      />
    </>
  );
}
