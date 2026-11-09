"use client";

import { useTranslations } from "next-intl";

import { BasePagePlaceholder } from "@/component/base/page/BasePagePlaceholder";
import { useAppLocale } from "@/composable/useAppLocale";
import { useMenu } from "@/composable/useMenu";
import { DefaultChildTabs } from "@/layouts/default/DefaultChildTabs";
import { flattenMenuPages, getLocalizedName } from "@/utils/menu";

type PageStubProps = {
  pageKey: string;
};

export function PageStub({ pageKey }: PageStubProps) {
  const t = useTranslations("common");
  const locale = useAppLocale();
  const { modules } = useMenu();

  const page = modules
    .flatMap((module) => flattenMenuPages(module.pages))
    .find((item) => item.key === pageKey);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
      <DefaultChildTabs />
      <BasePagePlaceholder
        title={page ? getLocalizedName(page.name, locale) : pageKey}
        description={t("comingSoon")}
      />
    </section>
  );
}
