"use client";

import { useRouter } from "next/router";
import { useEffect, type ReactNode } from "react";

import { LAYOUT_LOGIN_PATH } from "@/constants/layout/layout.constants";
import { useAuthStatus } from "@/composable/useAuthReady";
import { useCurrentPath } from "@/composable/useCurrentPath";
import { useMenu } from "@/composable/useMenu";
import { isMenuPageActive } from "@/utils/menu";

export function DefaultRouteGuard({ children }: { children?: ReactNode }) {
  const router = useRouter();
  const pathname = useCurrentPath();
  const authStatus = useAuthStatus();
  const { modules, isPending } = useMenu();

  const ready = !isPending && modules.length > 0;
  const isHome = pathname === "/";

  const moduleRoot = modules.find((module) => pathname === `/${module.key}`);
  const allowed =
    isHome ||
    modules.some((module) =>
      module.pages.some((page) => isMenuPageActive(page, pathname)),
    );

  const redirectTo = moduleRoot?.href ?? modules[0]?.href;

  useEffect(() => {
    if (authStatus === "anonymous") router.replace(LAYOUT_LOGIN_PATH);
  }, [authStatus, router]);

  useEffect(() => {
    if (ready && !allowed && redirectTo) router.replace(redirectTo);
  }, [ready, allowed, redirectTo, router]);

  if (authStatus === "anonymous") return null;
  if (ready && !allowed) return null;

  return <>{children}</>;
}
