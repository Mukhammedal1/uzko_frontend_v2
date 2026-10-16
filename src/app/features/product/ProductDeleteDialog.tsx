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
import type { ProductDeleteTarget } from "@/types/product.types";

type ProductDeleteDialogProps = {
  target: ProductDeleteTarget | null;
  pending: boolean;
  failed: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ProductDeleteDialog({
  target,
  pending,
  failed,
  onConfirm,
  onClose,
}: ProductDeleteDialogProps) {
  const t = useTranslations("product");
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
          <AlertDialogTitle>
            {target?.kind === "variant"
              ? t("deleteVariantTitle")
              : t("deleteTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDescription", { name: target?.name ?? "" })}
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
