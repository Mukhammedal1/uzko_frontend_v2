"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "react-toastify";

import type { MutationToastKind } from "@/types/common.types";

export function useApiSuccessToast() {
  const t = useTranslations("toast");
  const queryClient = useQueryClient();

  useEffect(
    () =>
      queryClient.getMutationCache().subscribe((event) => {
        if (event.type !== "updated" || event.action.type !== "success") return;

        const kind = event.mutation.meta?.toast as MutationToastKind | undefined;
        if (!kind) return;

        toast.success(t(kind));
      }),
    [queryClient, t],
  );
}
