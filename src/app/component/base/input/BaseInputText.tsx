import type { HTMLInputTypeAttribute, ReactNode } from "react";

import { Input } from "@/component/ui/input";
import { Label } from "@/component/ui/label";
import { cn } from "@/lib/utils";

type BaseInputTextProps = {
  id: string;
  label: string;
  value: string;
  type?: HTMLInputTypeAttribute;
  icon?: ReactNode;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export function BaseInputText({
  id,
  label,
  value,
  type = "text",
  icon,
  required,
  placeholder,
  autoComplete,
  error,
  disabled,
  onChange,
  onBlur,
}: BaseInputTextProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 items-center text-muted-foreground [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
        <Input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn("h-10", icon && "pl-9")}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
