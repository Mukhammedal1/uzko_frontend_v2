import type { ReactNode } from "react";

import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Label } from "@/component/ui/label";
import { cn } from "@/lib/utils";
import type { NumericOptions } from "@/types/common.types";
import { formatNumeric, sanitizeNumeric } from "@/utils/number-input";

type BaseInputAddonProps = {
  id: string;
  label?: string;
  value: string;
  placeholder?: string;
  suffix?: string;
  compact?: boolean;
  numeric?: NumericOptions;
  error?: string;
  invalid?: boolean;
  actionIcon?: ReactNode;
  actionLabel?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onAction?: () => void;
};

export function BaseInputAddon({
  id,
  label,
  value,
  placeholder,
  suffix,
  compact = false,
  numeric,
  error,
  invalid = false,
  actionIcon,
  actionLabel,
  required,
  disabled,
  onChange,
  onBlur,
  onAction,
}: BaseInputAddonProps) {
  const isNegative = Boolean(numeric?.allowNegative) && value.startsWith("-");
  const alignRight = Boolean(numeric) && numeric?.grouping !== false;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label ? (
        <Label htmlFor={id} className="whitespace-nowrap">
          {label}
          {required ? <span className="text-destructive">*</span> : null}
        </Label>
      ) : null}
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Input
            id={id}
            value={numeric ? formatNumeric(value, numeric) : value}
            placeholder={placeholder}
            inputMode={
              numeric ? (numeric.decimals > 0 ? "decimal" : "numeric") : "text"
            }
            disabled={disabled}
            aria-invalid={error || invalid ? true : undefined}
            className={cn(
              compact ? "h-7 px-2" : "h-9",
              suffix && (compact ? "pr-6" : "pr-12"),
              alignRight && "text-right tabular-nums",
              isNegative && "font-medium text-destructive",
            )}
            onChange={(event) =>
              onChange(
                numeric
                  ? sanitizeNumeric(event.target.value, numeric)
                  : event.target.value,
              )
            }
            onBlur={onBlur}
          />
          {suffix ? (
            <span className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground",
                compact ? "right-2" : "right-3",
              )}>
              {suffix}
            </span>
          ) : null}
        </div>
        {actionIcon ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0"
            aria-label={actionLabel}
            title={actionLabel}
            disabled={disabled}
            onClick={onAction}
          >
            {actionIcon}
          </Button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
