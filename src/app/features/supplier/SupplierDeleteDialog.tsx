"use client";

import { useTranslations } from "next-intl";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/component/ui/alert-dialog";
import type { SupplierDeleteTarget } from "@/types/supplier.types";

type SupplierDeleteDialogProps = {
  target: SupplierDeleteTarget | null;
  pending: boolean;
  failed: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function SupplierDeleteDialog({
  target,
  pending,
  failed,
  onConfirm,
  onClose,
}: SupplierDeleteDialogProps) {
  const t = useTranslations("supplier");
  const tCommon = useTranslations("common");

  const bulk = (target?.ids.length ?? 0) > 1;

  return (
    <AlertDialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {bulk ? t("deleteBulkTitle") : t("deleteTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {bulk
              ? t("deleteBulkDescription", { count: target?.ids.length ?? 0 })
              : t("deleteDescription", { name: target?.name ?? "" })}
          </AlertDialogDescription>
          {failed ? (
            <p role="alert" className="text-sm text-destructive">
              {t("deleteError")}
            </p>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            {tCommon("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? tCommon("loading") : tCommon("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
