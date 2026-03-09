import React from "react";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { cn } from "../../utils/cn";

const variants = {
  info: {
    icon: Info,
    classes: "bg-blue-50 text-blue-900 border-blue-200",
    iconClass: "text-blue-600",
  },
  warning: {
    icon: AlertTriangle,
    classes: "bg-amber-50 text-amber-900 border-amber-200",
    iconClass: "text-amber-600",
  },
  success: {
    icon: CheckCircle,
    classes: "bg-emerald-50 text-emerald-900 border-emerald-200",
    iconClass: "text-emerald-600",
  },
  error: {
    icon: XCircle,
    classes: "bg-red-50 text-red-900 border-red-200",
    iconClass: "text-red-600",
  },
};

export function AlertBanner({ variant = "info", title, message, className }) {
  const config = variants[variant] || variants.info;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border shadow-sm animate-fade-in",
        config.classes,
        className,
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconClass)} />
      <div>
        {title && <h4 className="font-semibold text-base mb-1">{title}</h4>}
        <p className="text-sm opacity-90 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
