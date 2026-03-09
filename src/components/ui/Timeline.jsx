import React from "react";
import { Phone, Users, Mail, FileText } from "lucide-react";

const getIcon = (type) => {
  switch (type) {
    case "Call":
      return <Phone className="w-4 h-4 text-blue-600" />;
    case "Meeting":
      return <Users className="w-4 h-4 text-emerald-600" />;
    case "Email":
      return <Mail className="w-4 h-4 text-purple-600" />;
    default:
      return <FileText className="w-4 h-4 text-slate-600" />;
  }
};

export function Timeline({ items = [] }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No communication logs recorded yet.
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 py-2">
      {items.map((item, index) => (
        <div key={item.id || index} className="relative pl-6 sm:pl-8">
          <span className="absolute flex items-center justify-center w-8 h-8 bg-white rounded-full -left-[17px] ring-4 ring-white border border-slate-200 shadow-sm z-10 transition-transform hover:scale-110">
            {getIcon(item.type)}
          </span>
          <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 hover:shadow-md transition-shadow group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">
                  {item.type}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-500 font-medium">
                  {new Date(item.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                Logged by {item.rmName || "RM"}
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mt-1">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
