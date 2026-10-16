import { Label } from "@/component/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/ui/select";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types/common.types";

type BaseSelectProps = {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  disabled?: boolean;
  active?: boolean;
  required?: boolean;
  labelClassName?: string;
  triggerClassName?: string;
  onChange: (value: string) => void;
};

export function BaseSelect({
  id,
  label,
  value,
  options,
  disabled,
  active = false,
  required = false,
  labelClassName,
  triggerClassName,
  onChange,
}: BaseSelectProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label
        htmlFor={id}
        className={cn(
          active ? "text-primary" : "text-muted-foreground",
          labelClassName,
        )}
      >
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Select
        value={value}
        items={options}
        disabled={disabled}
        onValueChange={(next) => {
          if (typeof next === "string") onChange(next);
        }}
      >
        <SelectTrigger
          id={id}
          className={cn(
            "w-full",
            triggerClassName,
            active &&
              "border-primary bg-primary/10 font-medium text-primary dark:bg-primary/15",
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className="min-w-0 p-1">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="py-1.5 pl-2.5"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
