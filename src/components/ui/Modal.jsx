import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

export function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  preventAutoFocus = false,
  children,
}) {
  const maxWidthClass =
    size === "sm"
      ? "max-w-sm"
      : size === "lg"
        ? "max-w-2xl"
        : size === "xl"
          ? "max-w-4xl"
          : "max-w-md";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && onClose) onClose();
      }}
    >
      <DialogContent
        className={`${maxWidthClass} w-full`}
        onOpenAutoFocus={(e) => preventAutoFocus && e.preventDefault()}
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
