"use client";

import { useTranslations } from "next-intl";

import { SettingsNamedList } from "@/features/settings/SettingsNamedList";
import {
  useCreateExpenseTypeMutation,
  useDeleteExpenseTypeMutation,
  useExpenseTypesQuery,
  useUpdateExpenseTypeMutation,
} from "@/rest/query/expense-type/expense-type.query";
import {
  useCreateShelfNumberMutation,
  useDeleteShelfNumberMutation,
  useShelfNumbersQuery,
  useUpdateShelfNumberMutation,
} from "@/rest/query/shelf-number/shelf-number.query";
import {
  useCreateStockMutation,
  useDeleteStockMutation,
  useStocksQuery,
  useUpdateStockMutation,
} from "@/rest/query/stock/stock.query";

export function SettingsStocksTab() {
  const t = useTranslations("settingsGeneral");
  const { items, isPending } = useStocksQuery();
  const create = useCreateStockMutation();
  const update = useUpdateStockMutation();
  const remove = useDeleteStockMutation();

  return (
    <SettingsNamedList
      messages={{
        description: t("stocks.description"),
        placeholder: t("stocks.placeholder"),
        deleteTitle: t("stocks.deleteTitle"),
      }}
      items={items}
      loading={isPending}
      creating={create.isPending}
      updating={update.isPending}
      removing={remove.isPending}
      onCreate={(name, done) => create.mutate(name, { onSuccess: done })}
      onUpdate={(id, name, done) =>
        update.mutate({ id, name }, { onSuccess: done })
      }
      onRemove={(id, done) => remove.mutate(id, { onSuccess: done })}
    />
  );
}

export function SettingsExpenseTypesTab() {
  const t = useTranslations("settingsGeneral");
  const { items, isPending } = useExpenseTypesQuery();
  const create = useCreateExpenseTypeMutation();
  const update = useUpdateExpenseTypeMutation();
  const remove = useDeleteExpenseTypeMutation();

  return (
    <SettingsNamedList
      messages={{
        description: t("expenseTypes.description"),
        placeholder: t("expenseTypes.placeholder"),
        deleteTitle: t("expenseTypes.deleteTitle"),
      }}
      items={items}
      loading={isPending}
      creating={create.isPending}
      updating={update.isPending}
      removing={remove.isPending}
      onCreate={(name, done) => create.mutate(name, { onSuccess: done })}
      onUpdate={(id, name, done) =>
        update.mutate({ id, name }, { onSuccess: done })
      }
      onRemove={(id, done) => remove.mutate(id, { onSuccess: done })}
    />
  );
}

export function SettingsShelfNumbersTab() {
  const t = useTranslations("settingsGeneral");
  const { items, isPending } = useShelfNumbersQuery();
  const create = useCreateShelfNumberMutation();
  const update = useUpdateShelfNumberMutation();
  const remove = useDeleteShelfNumberMutation();

  return (
    <SettingsNamedList
      messages={{
        description: t("shelfNumbers.description"),
        placeholder: t("shelfNumbers.placeholder"),
        deleteTitle: t("shelfNumbers.deleteTitle"),
      }}
      items={items}
      loading={isPending}
      creating={create.isPending}
      updating={update.isPending}
      removing={remove.isPending}
      onCreate={(name, done) => create.mutate(name, { onSuccess: done })}
      onUpdate={(id, name, done) =>
        update.mutate({ id, name }, { onSuccess: done })
      }
      onRemove={(id, done) => remove.mutate(id, { onSuccess: done })}
    />
  );
}
