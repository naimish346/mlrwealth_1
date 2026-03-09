import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  Mail,
  Calendar,
  User,
  FileText,
  Check,
  ChevronRight,
  Loader2,
  FileSearch,
  X,
  Printer,
} from "lucide-react";
import { useAppStore } from "../../../store/appStore";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";

export const ReportGeneratorDrawer = ({
  isOpen,
  onClose,
  reportType,
  onGenerate,
}) => {
  const { clients } = useAppStore();
  const [selectedClient, setSelectedClient] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [format, setFormat] = useState("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState({
    includeCharts: true,
    emailCopy: false,
    detailedAnalysis: true,
  });

  const selectedReportInfo = useMemo(() => {
    if (!reportType) return null;
    const items = [
      {
        id: "portfolio_summary",
        name: "Portfolio Summary",
        icon: FileText,
        color: "text-blue-600",
        bg: "bg-blue-50",
        gradient: "from-blue-500 to-indigo-600",
      },
      {
        id: "transaction_statement",
        name: "Transaction Statement",
        icon: FileSearch,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        gradient: "from-indigo-500 to-purple-600",
      },
      {
        id: "family_aum",
        name: "Family AUM",
        icon: User,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        gradient: "from-emerald-500 to-teal-600",
      },
      {
        id: "risk_profile",
        name: "Risk Profile",
        icon: FileText,
        color: "text-amber-600",
        bg: "bg-amber-50",
        gradient: "from-amber-500 to-orange-600",
      },
      {
        id: "goal_tracker",
        name: "Goal Tracker",
        icon: FileText,
        color: "text-rose-600",
        bg: "bg-rose-50",
        gradient: "from-rose-500 to-pink-600",
      },
      {
        id: "capital_gains",
        name: "Capital Gains",
        icon: FileSearch,
        color: "text-orange-600",
        bg: "bg-orange-50",
        gradient: "from-orange-500 to-red-600",
      },
    ];
    return items.find((i) => i.id === reportType);
  }, [reportType]);

  const handleGenerate = async () => {
    if (!selectedClient) {
      toast.error("Please select a client first");
      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onGenerate?.({
      reportType,
      clientId: selectedClient,
      dateRange,
      format,
      options,
    });

    setIsGenerating(false);
    onClose();
    toast.success(`${selectedReportInfo?.name} generated successfully`);
  };

  const Icon = selectedReportInfo?.icon || FileText;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Back Reference: Task/Reminder) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Slideover Panel (Back Reference: Task/Reminder style) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header (Matching Task/Reminder Sidebar Style) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-sm",
                    selectedReportInfo?.gradient ||
                      "from-indigo-500 to-indigo-600",
                  )}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    {selectedReportInfo?.name || "Generate Report"}
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                    Configuration Portal
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body - Matching Task layout with space-y-6 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
              {/* Recipient Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  Attached To
                </label>
                <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent text-sm focus:outline-none font-medium text-slate-700"
                  >
                    <option value="">Select a lead or client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>

              {/* Date Range Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-3"
              >
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Reporting Period
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          from: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-transparent text-sm focus:outline-none font-medium text-slate-600"
                    />
                  </div>
                  <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-transparent text-sm focus:outline-none font-medium text-slate-600"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Format Toggles */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Output Format
                </label>
                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex gap-2">
                  {["pdf", "excel", "csv"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      type="button"
                      className={cn(
                        "flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                        format === fmt
                          ? "bg-slate-900 text-white shadow-md"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                      )}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Preferences Checklist */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-3"
              >
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  Preferences
                </label>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  {[
                    {
                      id: "includeCharts",
                      label: "Include Visual Analytics",
                      desc: "Add charts and heatmaps",
                    },
                    {
                      id: "emailCopy",
                      label: "Email Copy to Client",
                      desc: "Direct send to registered email",
                    },
                    {
                      id: "detailedAnalysis",
                      label: "Detailed SEBI Footnotes",
                      desc: "Include full disclosures",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-start gap-4 cursor-pointer group"
                    >
                      <div
                        className={cn(
                          "mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-all",
                          options[opt.id]
                            ? "bg-indigo-600 text-white shadow-indigo-200 shadow-lg"
                            : "bg-slate-100 border border-slate-200",
                        )}
                      >
                        {options[opt.id] && (
                          <Check className="w-3 h-3 stroke-[3]" />
                        )}
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={options[opt.id]}
                          onChange={(e) =>
                            setOptions((prev) => ({
                              ...prev,
                              [opt.id]: e.target.checked,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Footer actions - Matching Task/Reminder style exactly */}
            <div className="p-6 border-t border-gray-200 bg-slate-50 flex items-center justify-end gap-4 mt-auto shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "#1e3a5f",
                  boxShadow: "0 0 15px rgba(30, 58, 95, 0.4)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-8 py-2.5 text-sm font-semibold text-white bg-[#1e3a5f] rounded-lg transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Generate Report
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};
