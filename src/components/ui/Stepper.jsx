import React from "react";
import { cn } from "../../utils/cn";
import { Check } from "lucide-react";

export function Stepper({
  steps = [],
  currentStep = 0,
  onStepClick,
  vertical = false,
}) {
  return (
    <div
      className={cn(
        "flex w-full",
        vertical ? "flex-col space-y-0" : "items-center pb-10",
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={step.id}>
            {!vertical && index > 0 && (
              <div
                className={cn(
                  "flex-1 h-0.5 transition-colors duration-300",
                  index <= currentStep ? "bg-[#1e3a5f]" : "bg-slate-200",
                )}
              />
            )}
            <div
              className={cn(
                "flex relative group",
                vertical
                  ? "flex-row items-center gap-4 pb-12 last:pb-0"
                  : "flex-col items-center",
              )}
            >
              {/* Vertical Connector Line */}
              {vertical && index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-4 top-8 w-0.5 h-full -ml-[1px] transition-colors duration-300",
                    index < currentStep ? "bg-[#1e3a5f]" : "bg-slate-200",
                  )}
                />
              )}

              <button
                onClick={() => onStepClick && onStepClick(index)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 z-10 shrink-0",
                  isCompleted
                    ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
                    : isCurrent
                      ? "bg-white text-[#1e3a5f] border-2 border-[#1e3a5f] ring-4 ring-[#1e3a5f]/10"
                      : "bg-white text-slate-400 border-2 border-slate-200 hover:border-slate-300",
                )}
                disabled={!onStepClick || index > currentStep + 1}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </button>

              <div
                className={cn(
                  "flex flex-col",
                  vertical
                    ? "text-left"
                    : "absolute top-10 left-1/2 -translate-x-1/2 text-center min-w-[120px]",
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-semibold transition-colors duration-300 uppercase tracking-widest whitespace-nowrap",
                    isCurrent || isCompleted
                      ? "text-slate-800"
                      : "text-slate-400 font-medium",
                  )}
                >
                  {step.label}
                </span>
                {vertical && step.desc && (
                  <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    {step.desc}
                  </span>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function StatusStepper({ steps = [], currentStatus, onAction }) {
  const currentIndex = steps.findIndex((s) => s.id === currentStatus);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <React.Fragment key={step.id}>
              {index > 0 && (
                <div
                  className={cn(
                    "flex-1 h-1 transition-colors duration-300 rounded-full mx-1",
                    index <= currentIndex ? "bg-[#1e3a5f]" : "bg-slate-200",
                  )}
                />
              )}
              <div className="flex flex-col items-center relative group">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300 z-10",
                    isCompleted
                      ? "bg-[#1e3a5f] ring-4 ring-[#1e3a5f]/20"
                      : "bg-slate-300",
                  )}
                  title={step.label}
                />
                <span
                  className={cn(
                    "absolute -bottom-6 text-center w-max text-xs font-medium transition-colors duration-300",
                    isCurrent || isCompleted
                      ? "text-slate-900"
                      : "text-slate-500",
                  )}
                >
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {currentIndex !== -1 && steps[currentIndex].actions?.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          {steps[currentIndex].actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction && onAction(action.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                action.variant === "primary"
                  ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
                  : action.variant === "danger"
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
