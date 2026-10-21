"use client";

import { Check, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller } from "react-hook-form";

import { BaseButtonDelete } from "@/component/base/button/BaseButtonDelete";
import { BaseButtonEdit } from "@/component/base/button/BaseButtonEdit";
import { BaseTable } from "@/component/base/table/BaseTable";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { SettingsDeleteDialog } from "@/features/settings/SettingsDeleteDialog";
import { useZodForm } from "@/plugins/react-hook-form";
import type { BaseTableColumn } from "@/types/common.types";
import type {
  NamedItem,
  NamedListMessages,
  SettingsNameFormValues,
} from "@/types/settings.types";
import { settingsNameSchema } from "@/validate/settings/name.zod";

type SettingsNamedListProps = {
  messages: NamedListMessages;
  items: NamedItem[];
  loading: boolean;
  creating: boolean;
  updating: boolean;
  removing: boolean;
  onCreate: (name: string, done: () => void) => void;
  onUpdate: (id: number, name: string, done: () => void) => void;
  onRemove: (id: number, done: () => void) => void;
};

export function SettingsNamedList({
  messages,
  items,
  loading,
  creating,
  updating,
  removing,
  onCreate,
  onUpdate,
  onRemove,
}: SettingsNamedListProps) {
  const t = useTranslations("settingsGeneral");
  const tAll = useTranslations();
  const tCommon = useTranslations("common");

  const form = useZodForm(settingsNameSchema, { defaultValues: { name: "" } });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<NamedItem | null>(null);

  const handleCreate = form.handleSubmit((values: SettingsNameFormValues) => {
    onCreate(values.name, () => form.reset({ name: "" }));
  });

  const startEdit = (item: NamedItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = (item: NamedItem) => {
    const name = editName.trim();
    if (!name) return;
    if (name === item.name) {
      cancelEdit();
      return;
    }
    onUpdate(item.id, name, cancelEdit);
  };

  const columns: BaseTableColumn<NamedItem>[] = [
    {
      key: "id",
      header: t("columns.id"),
      headerClassName: "w-24",
      cellClassName: "tabular-nums",
      cell: (item) => item.id,
    },
    {
      key: "name",
      header: t("columns.name"),
      cell: (item) =>
        editingId === item.id ? (
          <Input
            autoFocus
            value={editName}
            aria-label={t("columns.name")}
            className="h-9"
            onChange={(event) => setEditName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") saveEdit(item);
              if (event.key === "Escape") cancelEdit();
            }}
          />
        ) : (
          <span className="break-words">{item.name}</span>
        ),
    },
    {
      key: "actions",
      header: t("columns.actions"),
      headerClassName: "w-32 text-right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-2">
          {editingId === item.id ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={tCommon("save")}
                title={tCommon("save")}
                disabled={updating || editName.trim() === ""}
                onClick={() => saveEdit(item)}
              >
                <Check />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={tCommon("cancel")}
                title={tCommon("cancel")}
                disabled={updating}
                onClick={cancelEdit}
              >
                <X />
              </Button>
            </>
          ) : item.isSystem ? null : (
            <>
              <BaseButtonEdit
                label={tCommon("edit")}
                onClick={() => startEdit(item)}
              />
              <BaseButtonDelete
                label={tCommon("delete")}
                onClick={() => setDeleteTarget(item)}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="text-sm text-muted-foreground">{messages.description}</p>

      <form noValidate className="flex items-start gap-2" onSubmit={handleCreate}>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Input
                value={field.value}
                placeholder={messages.placeholder}
                aria-label={messages.placeholder}
                aria-invalid={fieldState.error ? true : undefined}
                className="h-10"
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
              />
              {fieldState.error ? (
                <p role="alert" className="text-xs text-destructive">
                  {tAll(fieldState.error.message as Parameters<typeof tAll>[0])}
                </p>
              ) : null}
            </div>
          )}
        />
        <Button type="submit" className="h-10 shrink-0 gap-2" disabled={creating}>
          <Plus />
          {t("add")}
        </Button>
      </form>

      <BaseTable
        columns={columns}
        rows={items}
        getRowKey={(item) => item.id}
        loading={loading}
        emptyLabel={t("empty")}
      />

      <SettingsDeleteDialog
        target={deleteTarget}
        title={messages.deleteTitle}
        pending={removing}
        onConfirm={() => {
          if (deleteTarget) {
            onRemove(deleteTarget.id, () => setDeleteTarget(null));
          }
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
