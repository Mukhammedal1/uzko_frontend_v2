"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import { Button } from "@/component/ui/button";
import { PurchaseCreate } from "@/features/purchase/PurchaseCreate";
import { useMainCurrencyQuery } from "@/rest/query/currency/currency.query";
import { usePurchaseEditQuery } from "@/rest/query/purchase/purchase.query";

export function PurchaseEdit() {
  const t = useTranslations("purchase.create");
  const router = useRouter();
  const id = Number(router.query.id);

  const { mainCurrency } = useMainCurrencyQuery();
  const { data, isError, refetch } = usePurchaseEditQuery(
    Number.isFinite(id) ? id : 0,
    mainCurrency ? String(mainCurrency.id) : "",
  );

  if (data && mainCurrency)
    return <PurchaseCreate key={data.id} initial={data} />;

  return (
    <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-xl border bg-card p-6 text-sm text-muted-foreground">
      {isError ? (
        <>
          <span>{t("loadError")}</span>
          <Button variant="outline" onClick={() => refetch()}>
            {t("retry")}
          </Button>
        </>
      ) : (
        <span className="h-4 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      )}
    </section>
  );
}
