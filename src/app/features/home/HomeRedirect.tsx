"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";

import { useMenu } from "@/composable/useMenu";

export function HomeRedirect() {
  const router = useRouter();
  const { modules } = useMenu();
  const target = modules[0]?.href;

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  return null;
}
