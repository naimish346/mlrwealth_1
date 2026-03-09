import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./sheet";
import { cn } from "../../utils/cn";

export function Drawer({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
  className,
}) {
  const sizeClasses = {
    sm: "sm:max-w-sm w-[400px]",
    md: "sm:max-w-md w-[500px]",
    lg: "sm:max-w-lg w-[600px]",
    xl: "sm:max-w-xl w-[800px]",
    full: "w-screen sm:max-w-[100vw]",
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && onClose) onClose();
      }}
    >
      <SheetContent
        className={cn(
          "overflow-y-auto sm:border-l border-slate-200 shadow-2xl p-6",
          sizeClasses[size],
          className,
        )}
      >
        {title && (
          <SheetHeader className="mb-6 pb-4 border-b border-slate-100">
            <SheetTitle className="text-xl font-semibold text-slate-800">
              {title}
            </SheetTitle>
          </SheetHeader>
        )}
        <div className="relative">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
