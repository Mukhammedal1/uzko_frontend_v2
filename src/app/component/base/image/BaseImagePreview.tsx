import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/component/ui/dialog";

type BaseImagePreviewProps = {
  open: boolean;
  src: string | null;
  title: string;
  onClose: () => void;
};

export function BaseImagePreview({
  open,
  src,
  title,
  onClose,
}: BaseImagePreviewProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-w-[calc(100%-2rem)] gap-0 p-2 sm:max-w-3xl">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={title}
            className="mx-auto max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
