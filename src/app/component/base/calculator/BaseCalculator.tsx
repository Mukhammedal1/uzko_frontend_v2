import { Delete } from "lucide-react";
import type { KeyboardEvent } from "react";

import { Button } from "@/component/ui/button";
import { CALCULATOR_OPERATOR_SYMBOLS } from "@/constants/layout/layout.constants";
import { cn } from "@/lib/utils";
import type { CalculatorOperator } from "@/types/layout.types";

type BaseCalculatorProps = {
  display: string;
  expression: string;
  backspaceLabel: string;
  onDigit: (digit: string) => void;
  onDot: () => void;
  onOperator: (operator: CalculatorOperator) => void;
  onEquals: () => void;
  onClear: () => void;
  onBackspace: () => void;
  onToggleSign: () => void;
  onPercent: () => void;
};

const OPERATOR_KEYS: Record<string, CalculatorOperator> = {
  "+": "+",
  "-": "-",
  "*": "*",
  "/": "/",
};

export function BaseCalculator({
  display,
  expression,
  backspaceLabel,
  onDigit,
  onDot,
  onOperator,
  onEquals,
  onClear,
  onBackspace,
  onToggleSign,
  onPercent,
}: BaseCalculatorProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const onButton = (event.target as HTMLElement).tagName === "BUTTON";
    const { key } = event;

    if (/^\d$/.test(key)) onDigit(key);
    else if (key === "." || key === ",") onDot();
    else if (OPERATOR_KEYS[key]) onOperator(OPERATOR_KEYS[key]);
    else if (key === "=" || (key === "Enter" && !onButton)) onEquals();
    else if (key === "Backspace") onBackspace();
    else if (key === "Escape" || key === "Delete") onClear();
    else if (key === "%") onPercent();
    else return;

    event.preventDefault();
  };

  const key = (
    label: React.ReactNode,
    onClick: () => void,
    variant: "outline" | "secondary" | "default" = "outline",
    ariaLabel?: string,
    className?: string,
  ) => (
    <Button
      type="button"
      variant={variant}
      aria-label={ariaLabel}
      className={cn("h-10 text-base font-medium", className)}
      onClick={onClick}
    >
      {label}
    </Button>
  );

  const operatorKey = (operator: CalculatorOperator) =>
    key(CALCULATOR_OPERATOR_SYMBOLS[operator], () => onOperator(operator), "secondary");

  const digitKey = (digit: string) => key(digit, () => onDigit(digit));

  return (
    <div className="flex w-64 flex-col gap-2" onKeyDown={handleKeyDown}>
      <div className="flex min-h-16 flex-col items-end justify-end gap-0.5 rounded-lg border bg-muted/40 px-3 py-2">
        <span className="h-4 text-xs text-muted-foreground tabular-nums">
          {expression}
        </span>
        <span
          className="max-w-full truncate text-2xl font-semibold tabular-nums"
          aria-live="polite"
        >
          {display}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {key("C", onClear, "secondary")}
        {key("±", onToggleSign, "secondary")}
        {key("%", onPercent, "secondary")}
        {operatorKey("/")}
        {digitKey("7")}
        {digitKey("8")}
        {digitKey("9")}
        {operatorKey("*")}
        {digitKey("4")}
        {digitKey("5")}
        {digitKey("6")}
        {operatorKey("-")}
        {digitKey("1")}
        {digitKey("2")}
        {digitKey("3")}
        {operatorKey("+")}
        {key(<Delete />, onBackspace, "outline", backspaceLabel)}
        {digitKey("0")}
        {key(",", onDot)}
        {key("=", onEquals, "default")}
      </div>
    </div>
  );
}
