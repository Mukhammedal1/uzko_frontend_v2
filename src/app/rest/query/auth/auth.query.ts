"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError, tokenStorage } from "@/api/intercept";
import { useAuthReady } from "@/composable/useAuthReady";
import { authService } from "@/rest/service/auth/auth.service";
import type { LoginPayload } from "@/types/auth.types";
import { extractTokens } from "@/utils/auth";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await authService.login(payload);
      const tokens = extractTokens(response);

      if (!tokens) {
        throw new ApiError(500, response, "Token not found in login response");
      }

      return tokens;
    },
    onSuccess: ({ accessToken, refreshToken, userId }) => {
      tokenStorage.set(accessToken);
      if (refreshToken) tokenStorage.setRefresh(refreshToken);
      if (userId !== undefined) tokenStorage.setUserId(userId);
      queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

export function useMeQuery() {
  const authReady = useAuthReady();

  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => authService.me(),
    enabled: authReady,
    staleTime: 5 * 60 * 1000,
  });
}
