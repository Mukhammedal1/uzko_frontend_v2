"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { ApiError } from "@/api/intercept";
import { getApiErrorMessage, isNetworkError } from "@/utils/error";

export function useApiErrorToast() {
  const t = useTranslations("errors");
  const queryClient = useQueryClient();

  useEffect(() => {
    const show = (error: unknown, source: "query" | "mutation") => {
      if (source === "query" && error instanceof ApiError && error.status === 401) {
        return;
      }

      const message =
        getApiErrorMessage(error) ??
        (isNetworkError(error)
          ? t("network")
          : error instanceof ApiError
            ? t("server")
            : t("unknown"));

      toast.error(message, { toastId: message });
    };

    const unsubscribeQueries = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated" || event.action.type !== "error") return;
      if (event.query.meta?.silent) return;
      show(event.action.error, "query");
    });

    const unsubscribeMutations = queryClient
      .getMutationCache()
      .subscribe((event) => {
        if (event.type !== "updated" || event.action.type !== "error") return;
        if (event.mutation.meta?.silent) return;
        show(event.action.error, "mutation");
      });

    return () => {
      unsubscribeQueries();
      unsubscribeMutations();
    };
  }, [queryClient, t]);
}
