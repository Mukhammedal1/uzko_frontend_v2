"use client";

import { useRouter } from "next/router";

import { BaseTabs } from "@/component/base/tabs/BaseTabs";
import { useAppLocale } from "@/composable/useAppLocale";
import { useCurrentPath } from "@/composable/useCurrentPath";
import { useMenu } from "@/composable/useMenu";
import { findChildPageGroup, getLocalizedName } from "@/utils/menu";

export function DefaultChildTabs() {
  const router = useRouter();
  const pathname = useCurrentPath();
  const locale = useAppLocale();
  const { modules } = useMenu();

  const group = findChildPageGroup(modules, pathname);
  if (!group) return null;

  return (
    <BaseTabs
      label={getLocalizedName(group.name, locale)}
      items={group.children.map((page) => ({
        key: page.href,
        label: getLocalizedName(page.name, locale),
        active: page.href === pathname,
      }))}
      onSelect={(href) => router.push(href)}
    />
  );
}
