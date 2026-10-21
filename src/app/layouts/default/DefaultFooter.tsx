import { Calculator, CalendarDays, DollarSign, Maximize } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { BaseCalculator } from "@/component/base/calculator/BaseCalculator";
import { BaseCalendar } from "@/component/base/calendar/BaseCalendar";
import { Button } from "@/component/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/component/ui/popover";
import {
  CALCULATOR_OPERATOR_SYMBOLS,
  CALENDAR_LOCALES,
  LAYOUT_CURRENCY_RATES,
} from "@/constants/layout/layout.constants";
import { useAppLocale } from "@/composable/useAppLocale";
import { useCalculator } from "@/composable/useCalculator";
import { formatNumeric } from "@/utils/number-input";

export function DefaultFooter() {
  const t = useTranslations("layout.footer");
  const locale = useAppLocale();
  const calculator = useCalculator();
  const [date, setDate] = useState<Date | undefined>(() => new Date());

  const { display, accumulator, operator } = calculator.state;
  const expression =
    accumulator !== null && operator
      ? `${formatNumeric(String(accumulator), { decimals: 12 })} ${CALCULATOR_OPERATOR_SYMBOLS[operator]}`
      : "";

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

        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="hidden hover:border-primary hover:text-primary aria-expanded:border-primary aria-expanded:text-primary sm:inline-flex"
                aria-label={t("calendar")}
                title={t("calendar")}
              />
            }
          >
            <CalendarDays />
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-auto p-0">
            <BaseCalendar
              value={date}
              locale={CALENDAR_LOCALES[locale]}
              onChange={setDate}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="hidden hover:border-primary hover:text-primary aria-expanded:border-primary aria-expanded:text-primary sm:inline-flex"
                aria-label={t("calculator")}
                title={t("calculator")}
              />
            }
          >
            <Calculator />
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-auto p-2.5">
            <BaseCalculator
              display={
                display.includes("Error")
                  ? display
                  : formatNumeric(display, { decimals: 12 })
              }
              expression={expression}
              backspaceLabel={t("backspace")}
              onDigit={calculator.digit}
              onDot={calculator.dot}
              onOperator={calculator.operator}
              onEquals={calculator.equals}
              onClear={calculator.clear}
              onBackspace={calculator.backspace}
              onToggleSign={calculator.toggleSign}
              onPercent={calculator.percent}
            />
          </PopoverContent>
        </Popover>
      </div>

      <ul className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto [scrollbar-width:none] sm:flex-none [&::-webkit-scrollbar]:hidden">
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
