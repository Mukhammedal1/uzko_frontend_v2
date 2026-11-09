"use client";

import { Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { BaseSelect } from "@/component/base/select/BaseSelect";
import { Button } from "@/component/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/component/ui/dialog";
import { useProductFilterOptions } from "@/composable/useProductFilterOptions";
import type { ProductAssignKind } from "@/types/product.types";

type ProductAssignDialogProps = {
  kind: ProductAssignKind | null;
  count: number;
  pending: boolean;
  failed: boolean;
  onConfirm: (id: number) => void;
  onClose: () => void;
};

const OPTION_KEYS = {
  supplier: "supplier_id",
  stock: "stock_id",
  shelf: "shelf_number_id",
} as const;

type FormProps = Omit<ProductAssignDialogProps, "kind"> & {
  kind: ProductAssignKind;
};

function ProductAssignForm({
  kind,
  count,
  pending,
  failed,
  onConfirm,
  onClose,
}: FormProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const options = useProductFilterOptions(true);
  const [value, setValue] = useState("");

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Link2 className="size-4" />
          {t(`assign.${kind}.title`)}
        </DialogTitle>
      </DialogHeader>

      <div className="rounded-lg border bg-muted/40 p-3 text-sm">
        <p className="font-semibold">{t("assign.selected", { count })}</p>
        <p className="mt-1 text-muted-foreground">
          {t(`assign.${kind}.description`)}
        </p>
      </div>

      <BaseSelect
        id={`products-assign-${kind}`}
        label={t(`assign.${kind}.label`)}
        required
        placeholder={t(`assign.${kind}.placeholder`)}
        value={value}
        options={options[OPTION_KEYS[kind]]}
        disabled={pending}
        onChange={setValue}
      />

      {failed ? (
        <p role="alert" className="text-sm text-destructive">
          {t("assign.error")}
        </p>
      ) : null}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={pending}
          onClick={onClose}
        >
          {tCommon("cancel")}
        </Button>
        <Button
          type="button"
          className="h-10"
          disabled={pending || value === ""}
          onClick={() => onConfirm(Number(value))}
        >
          {pending ? tCommon("loading") : t("assign.confirm")}
        </Button>
      </DialogFooter>
    </>
  );
}

export function ProductAssignDialog({
  kind,
  onClose,
  pending,
  ...rest
}: ProductAssignDialogProps) {
  return (
    <Dialog
      open={kind !== null}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
        {kind ? (
          <ProductAssignForm
            {...rest}
            kind={kind}
            pending={pending}
            onClose={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
