import type { HTMLInputTypeAttribute } from "react";

import { Input } from "@/component/ui/input";
import { Label } from "@/component/ui/label";

type BaseInputTextProps = {
  id: string;
  label: string;
  value: string;
  type?: HTMLInputTypeAttribute;
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
  placeholder,
  autoComplete,
  error,
  disabled,
  onChange,
  onBlur,
}: BaseInputTextProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-10"
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
