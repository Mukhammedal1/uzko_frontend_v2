import { cn } from "@/lib/utils";

type BaseIconMaskProps = {
  src: string;
  className?: string;
};

export function BaseIconMask({ src, className }: BaseIconMaskProps) {
  const mask = `url("${src}")`;

  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-4 shrink-0 bg-current", className)}
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  );
}
