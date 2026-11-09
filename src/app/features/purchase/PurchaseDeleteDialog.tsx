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
import type { PurchaseDeleteTarget } from "@/types/purchase.types";

type PurchaseDeleteDialogProps = {
  target: PurchaseDeleteTarget | null;
  pending: boolean;
  failed: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function PurchaseDeleteDialog({
  target,
  pending,
  failed,
  onConfirm,
  onClose,
}: PurchaseDeleteDialogProps) {
  const t = useTranslations("purchase");
  const tCommon = useTranslations("common");

  return (
    <AlertDialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDescription", { number: `${target?.id ?? ""}` })}
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
