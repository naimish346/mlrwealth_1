import React from "react";
import { X } from "lucide-react";

export function FilterChips({ filters = [], onRemove, onClearAll }) {
  if (!filters || filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
      {filters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full border border-slate-200 shadow-sm"
        >
          <span className="font-medium text-slate-900">{filter.label}:</span>
          <span>{filter.value}</span>
          <button
            onClick={() => onRemove(filter.id)}
            className="ml-1 p-0.5 hover:bg-slate-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="w-3.5 h-3.5 text-slate-500 hover:text-slate-700" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-[#1e3a5f] hover:text-[#1e3a5f]/80 hover:bg-[#1e3a5f]/5 font-medium px-3 py-1 rounded-md transition-all active:scale-95"
      >
        Clear All
      </button>
    </div>
  );
}
