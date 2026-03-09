import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, label, icon, ...props }) {
  if (!label && !icon) {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <div className={cn("w-full", label ? "space-y-1.5" : "", className)}>
      {label && (
        <label className="text-sm font-semibold text-slate-800">{label}</label>
      )}
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            icon && "pl-10",
          )}
          {...props}
        />
      </div>
    </div>
  );
}

function Select({ className, options, children, label, ...props }) {
  const selectClasses = cn(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    !label && className,
  );

  const selectElement = (
    <select className={selectClasses} {...props}>
      {options
        ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        : children}
    </select>
  );

  if (!label) return selectElement;

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      {selectElement}
    </div>
  );
}

function Textarea({ className, label, ...props }) {
  const textareaClasses = cn(
    "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    !label && className,
  );

  const textareaElement = <textarea className={textareaClasses} {...props} />;

  if (!label) return textareaElement;

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      {textareaElement}
    </div>
  );
}

export { Input, Select, Textarea };
