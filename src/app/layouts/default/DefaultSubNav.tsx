"use client";

import Link from "next/link";

import { useAppLocale } from "@/composable/useAppLocale";
import { useCurrentPath } from "@/composable/useCurrentPath";
import { useMenu } from "@/composable/useMenu";
import { cn } from "@/lib/utils";
import { getLocalizedName, isMenuPageActive } from "@/utils/menu";

export function DefaultSubNav() {
  const pathname = useCurrentPath();
  const locale = useAppLocale();
  const { modules } = useMenu();

  const activeModule = modules.find(
    (module) =>
      pathname === `/${module.key}` || pathname.startsWith(`/${module.key}/`),
  );

  if (!activeModule || activeModule.pages.length < 2) return null;

  const moduleLabel = getLocalizedName(activeModule.name, locale);

  return (
    <nav aria-label={moduleLabel} className="shrink-0 bg-page px-2 pt-[5px]">
      <ul className="flex items-center gap-2 overflow-x-auto rounded-xl border bg-card p-1 shadow-sm">
        {activeModule.pages.map((page) => {
          const active = isMenuPageActive(page, pathname);

          return (
            <li key={page.key} className="shrink-0">
              <Link
                href={page.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center rounded-lg border px-3 py-2 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                {getLocalizedName(page.name, locale)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
