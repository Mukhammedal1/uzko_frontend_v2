import { ImageUp, X } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/component/ui/button";
import { Label } from "@/component/ui/label";

type BaseInputFileProps = {
  id: string;
  label: string;
  placeholder: string;
  fileName?: string;
  previewUrl?: string;
  accept?: string;
  round?: boolean;
  loading?: boolean;
  clearLabel?: string;
  onSelect: (file: File) => void;
  onClear?: () => void;
};

export function BaseInputFile({
  id,
  label,
  placeholder,
  fileName,
  previewUrl,
  accept,
  round = false,
  loading,
  clearLabel,
  onSelect,
  onClear,
}: BaseInputFileProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (round) {
    return (
      <div className="relative mx-auto size-24 shrink-0">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onSelect(file);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          aria-label={label}
          title={placeholder}
          disabled={loading}
          className="flex size-full items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
          onClick={() => inputRef.current?.click()}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <ImageUp className="size-7" />
          )}
        </button>
        {onClear && (previewUrl || fileName) && !loading ? (
          <button
            type="button"
            aria-label={clearLabel}
            title={clearLabel}
            className="absolute top-0 right-0 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-destructive"
            onClick={onClear}
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="whitespace-nowrap">
        {label}
      </Label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
          event.target.value = "";
        }}
      />
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          className="h-9 w-full min-w-0 justify-start gap-2 pr-8 font-normal"
          onClick={() => inputRef.current?.click()}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              className="size-7 shrink-0 rounded object-contain"
            />
          ) : (
            <ImageUp className="shrink-0" />
          )}
          {previewUrl && !loading ? null : (
            <span className="truncate">{fileName || placeholder}</span>
          )}
        </Button>
        {onClear && (previewUrl || fileName) && !loading ? (
          <button
            type="button"
            aria-label={clearLabel}
            title={clearLabel}
            className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
            onClick={onClear}
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
