"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/component/ui/button";
import { LAYOUT_BRAND } from "@/constants/layout/layout.constants";
import { DefaultMobileMenu } from "@/layouts/default/DefaultMobileMenu";
import { DefaultNav } from "@/layouts/default/DefaultNav";
import { DefaultUserMenu } from "@/layouts/default/DefaultUserMenu";

export function DefaultHeader() {
  const t = useTranslations("layout.actions");

  return (
    <header className="flex shrink-0 items-center gap-2 border-b bg-background px-3 py-2 sm:gap-4 sm:px-3">
      <DefaultMobileMenu />

      <Link
        href="/"
        className="shrink-0 text-lg font-bold tracking-[0.12em] sm:text-xl"
      >
        {LAYOUT_BRAND}
      </Link>

      <DefaultNav />

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t("notifications")}
          title={t("notifications")}
        >
          <Bell />
        </Button>
        <DefaultUserMenu />
      </div>
    </header>
  );
}
