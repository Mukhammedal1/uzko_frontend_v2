"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Label } from "@/component/ui/label";

type BaseInputPasswordProps = {
  id: string;
  label: string;
  value: string;
  showLabel: string;
  hideLabel: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export function BaseInputPassword({
  id,
  label,
  value,
  showLabel,
  hideLabel,
  placeholder,
  autoComplete,
  error,
  disabled,
  onChange,
  onBlur,
}: BaseInputPasswordProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-10 pr-11"
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
