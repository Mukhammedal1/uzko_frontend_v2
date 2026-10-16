import {
  Calculator,
  CalendarDays,
  DollarSign,
  Maximize,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/component/ui/button";
import { LAYOUT_CURRENCY_RATES } from "@/constants/layout/layout.constants";

export function DefaultFooter() {
  const t = useTranslations("layout.footer");

  return (
    <footer className="flex shrink-0 items-center gap-2 border-t bg-background px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:gap-3 sm:px-5">
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label={t("fullscreen")}
          title={t("fullscreen")}
        >
          <Maximize />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="hidden sm:inline-flex"
          aria-label={t("calendar")}
          title={t("calendar")}
        >
          <CalendarDays />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="hidden sm:inline-flex"
          aria-label={t("calculator")}
          title={t("calculator")}
        >
          <Calculator />
        </Button>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:min-w-0 sm:flex-1 sm:justify-center">
        <span
          aria-current="true"
          className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
        >
          1
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="border-dashed"
          aria-label={t("addTab")}
          title={t("addTab")}
        >
          <Plus />
        </Button>
      </div>

      <ul className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] sm:flex-none [&::-webkit-scrollbar]:hidden">
        {LAYOUT_CURRENCY_RATES.map((currency) => (
          <li
            key={currency.code}
            className="flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm"
          >
            <DollarSign className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">{currency.code}</span>
            <span className="font-semibold tabular-nums">{currency.rate}</span>
          </li>
        ))}
      </ul>
    </footer>
  );
}
