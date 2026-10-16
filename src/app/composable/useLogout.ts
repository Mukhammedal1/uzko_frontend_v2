"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useCallback } from "react";

import { tokenStorage } from "@/api/intercept";
import { LAYOUT_LOGIN_PATH } from "@/constants/layout/layout.constants";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(() => {
    tokenStorage.clear();
    queryClient.clear();
    router.replace(LAYOUT_LOGIN_PATH);
  }, [router, queryClient]);
}
