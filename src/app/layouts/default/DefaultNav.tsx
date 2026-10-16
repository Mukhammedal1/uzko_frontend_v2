"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";

import { BaseIconMask } from "@/component/base/icon/BaseIconMask";
import { LAYOUT_BRAND } from "@/constants/layout/layout.constants";
import { useAppLocale } from "@/composable/useAppLocale";
import { useMenu } from "@/composable/useMenu";
import { cn } from "@/lib/utils";
import { getLocalizedName } from "@/utils/menu";

const SKELETON_COUNT = 5;

export function DefaultNav() {
  const t = useTranslations("layout");
  const { pathname } = useRouter();
  const locale = useAppLocale();
  const { modules, isPending } = useMenu();

  if (isPending && modules.length === 0) {
    return (
      <nav
        aria-label={LAYOUT_BRAND}
        className="hidden min-w-0 flex-1 justify-center lg:flex"
      >
        <div
          aria-busy="true"
          aria-label={t("loadingMenu")}
          className="flex items-center gap-1 rounded-xl bg-muted p-0.5"
        >
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <span
              key={index}
              className="h-8 w-10 animate-pulse rounded-lg bg-background/70 lg:w-24"
            />
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label={LAYOUT_BRAND}
      className="hidden min-w-0 flex-1 justify-center lg:flex"
    >
      <ul className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-muted p-0.5">
        {modules.map((module) => {
          const label = getLocalizedName(module.name, locale);
          const active =
            pathname === `/${module.key}` ||
            pathname.startsWith(`/${module.key}/`);

          return (
            <li key={module.key} className="shrink-0">
              <Link
                href={module.href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                title={label}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {module.iconUrl ? <BaseIconMask src={module.iconUrl} /> : null}
                <span>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
