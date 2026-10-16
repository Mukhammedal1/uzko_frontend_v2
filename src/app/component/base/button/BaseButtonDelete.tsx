import { Trash2 } from "lucide-react";

import { Button } from "@/component/ui/button";
import { cn } from "@/lib/utils";

type BaseButtonDeleteProps = {
  label: string;
  title?: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

export function BaseButtonDelete({
  label,
  title,
  disabled,
  className,
  onClick,
}: BaseButtonDeleteProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      disabled={disabled}
      aria-label={label}
      title={title ?? label}
      className={cn(
        "border-destructive/30 bg-background text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive dark:border-destructive/30 dark:bg-background dark:hover:bg-destructive/15",
        className,
      )}
      onClick={onClick}
    >
      <Trash2 />
    </Button>
  );
}
