"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import { BaseIconMask } from "@/component/base/icon/BaseIconMask";
import { Button } from "@/component/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/component/ui/sheet";
import { LAYOUT_BRAND } from "@/constants/layout/layout.constants";
import { useAppLocale } from "@/composable/useAppLocale";
import { useMenu } from "@/composable/useMenu";
import { cn } from "@/lib/utils";
import { getLocalizedName } from "@/utils/menu";

const SKELETON_COUNT = 5;

export function DefaultMobileMenu() {
  const t = useTranslations("layout.menu");
  const { pathname } = useRouter();
  const locale = useAppLocale();
  const { modules, isPending } = useMenu();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label={t("open")}
            title={t("open")}
          />
        }
      >
        <Menu />
      </SheetTrigger>

      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-80 max-w-[85vw] gap-0 p-0 sm:max-w-80"
      >
        <SheetHeader className="flex-row items-center justify-between border-b p-4">
          <SheetTitle className="text-lg font-bold tracking-[0.12em]">
            {LAYOUT_BRAND}
          </SheetTitle>
          <SheetClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("close")}
              />
            }
          >
            <X />
          </SheetClose>
        </SheetHeader>

        <nav
          aria-label={LAYOUT_BRAND}
          className="min-h-0 flex-1 overflow-y-auto p-3"
        >
          {isPending && modules.length === 0 ? (
            <ul aria-busy="true" aria-label={t("loading")} className="flex flex-col gap-2">
              {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <li
                  key={index}
                  className="h-10 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </ul>
          ) : (
            <ul className="flex flex-col gap-4">
              {modules.map((module) => {
                const label = getLocalizedName(module.name, locale);
                const moduleActive =
                  pathname === `/${module.key}` ||
                  pathname.startsWith(`/${module.key}/`);
                const heading = (
                  <>
                    {module.iconUrl ? (
                      <BaseIconMask src={module.iconUrl} />
                    ) : null}
                    <span className="truncate">{label}</span>
                  </>
                );
                const headingClass = cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold",
                  moduleActive ? "text-primary" : "text-foreground",
                );

                return (
                  <li key={module.key} className="flex flex-col gap-1">
                    {module.pages.length === 0 ? (
                      <Link
                        href={module.href}
                        className={cn(headingClass, "hover:bg-muted")}
                        aria-current={moduleActive ? "page" : undefined}
                        onClick={close}
                      >
                        {heading}
                      </Link>
                    ) : (
                      <>
                        <div className={headingClass}>{heading}</div>
                        <ul className="flex flex-col gap-0.5 border-l pl-3 ml-5">
                          {module.pages.map((page) => {
                            const active = pathname === page.href;

                            return (
                              <li key={page.key}>
                                <Link
                                  href={page.href}
                                  aria-current={active ? "page" : undefined}
                                  className={cn(
                                    "flex min-h-10 items-center rounded-lg px-3 py-2 text-sm transition-colors",
                                    active
                                      ? "bg-primary text-primary-foreground"
                                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                  )}
                                  onClick={close}
                                >
                                  {getLocalizedName(page.name, locale)}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
