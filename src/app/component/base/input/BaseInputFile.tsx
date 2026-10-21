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
  loading,
  clearLabel,
  onSelect,
  onClear,
}: BaseInputFileProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
