import { cn } from "@/lib/utils";
import { formatNumber, formatPercent } from "@/utils/format";

type BasePriceProps = {
  value: number;
  currency: string;
  percentage?: number;
};

export function BasePrice({ value, currency, percentage }: BasePriceProps) {
  return (
    <div className="flex flex-col items-center leading-tight tabular-nums">
      <span className="font-medium">
        {formatNumber(value)}{" "}
        <span className="text-sm font-normal text-muted-foreground">
          {currency}
        </span>
      </span>
      {percentage ? (
        <span
          className={cn(
            "text-sm",
            percentage > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive",
          )}
        >
          {formatPercent(percentage)}
        </span>
      ) : null}
    </div>
  );
}
