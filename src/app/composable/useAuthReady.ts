"use client";

import { useEffect, useState } from "react";

import { tokenStorage } from "@/api/intercept";

export type AuthStatus = "checking" | "authenticated" | "anonymous";

export function useAuthStatus(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    setStatus(tokenStorage.get() !== null ? "authenticated" : "anonymous");
  }, []);

  return status;
}

export function useAuthReady() {
  return useAuthStatus() === "authenticated";
}
