import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target,
  Users,
  PlusCircle,
  UserSquare2,
  PhoneCall,
  GitMerge,
  PieChart,
  Settings as SettingsIcon,
  List,
  Grid,
  Download,
  Plus,
  Clock,
  LayoutGrid,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useLeadStore } from "../../store/useLeadStore";
import { LeadDashboard } from "./leads/LeadDashboard";
import { LeadList } from "./leads/LeadList";
import { LeadCapture } from "./leads/LeadCapture";
import { LeadProfile } from "./leads/LeadProfile";
import { ActivityLogging } from "./leads/ActivityLogging";
import { ConversionWizard } from "./leads/ConversionWizard";
import { LeadAnalytics } from "./leads/LeadAnalytics";
import { LeadSettings } from "./leads/LeadSettings";

export const Leads = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname.replace("/leads", "").replace("/", "");
    return path || "list";
  };

  const activeTab = getActiveTab();
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'kanban'
  const [leadCaptureMode, setLeadCaptureMode] = useState("direct"); // 'direct' | 'bulk'
  const { leads } = useLeadStore();

  const setActiveTab = (tabId) => {
    navigate(`/leads/${tabId}`);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <LeadDashboard onNavigate={setActiveTab} />;
      case "list":
        return (
          <LeadList
            onNavigate={setActiveTab}
            viewModeProps={viewMode}
            setViewModeProps={setViewMode}
          />
        );
      case "capture":
        return (
          <LeadCapture
            onNavigate={setActiveTab}
            captureMode={leadCaptureMode}
            setCaptureMode={setLeadCaptureMode}
          />
        );
      case "profile":
        return <LeadProfile onNavigate={setActiveTab} />;
      case "logging":
        return (
          <ActivityLogging onNavigate={setActiveTab} initialType="notes" />
        );
      case "logging_reminder":
        return (
          <ActivityLogging onNavigate={setActiveTab} initialType="reminders" />
        );
      case "logging_file":
        return (
          <ActivityLogging onNavigate={setActiveTab} initialType="files" />
        );
      case "conversion":
        return <ConversionWizard onNavigate={setActiveTab} />;
      case "analytics":
        return <LeadAnalytics onNavigate={setActiveTab} />;
      case "settings":
        return <LeadSettings onNavigate={setActiveTab} />;
    }
  };

  const hideHeaderTabs = [
    "profile",
    "logging",
    "logging_reminder",
    "logging_file",
    "conversion",
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-10">
      {/* Header Area */}
      {!hideHeaderTabs.includes(activeTab) && (
        <div className="bg-white  px-0 pt-6 pb-0 mb-0">
          <div className="flex items-center justify-between mb-6 px-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === "dashboard"
                  ? "Leads Dashboard"
                  : activeTab === "capture"
                    ? "Add New Lead"
                    : "Leads Management"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === "dashboard"
                  ? "Comprehensive overview of your sales pipeline and team performance"
                  : activeTab === "capture"
                    ? "Create a new prospect manually or import in bulk"
                    : "Track, manage, and convert your prospects efficiently"}
              </p>
            </div>

            {activeTab === "list" && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg mr-2">
                  <button
                    onClick={() => setViewMode("table")}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                      viewMode === "table"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    <List className="w-3.5 h-3.5" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode("kanban")}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                      viewMode === "kanban"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    Board
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Export
                </motion.button>

                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 15px -3px rgba(30, 58, 95, 0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab("capture")}
                  className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  New Lead
                </motion.button>
              </div>
            )}

            {activeTab === "capture" && (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("list")}
                  className="flex items-center gap-2 text-slate-600 mr-2"
                >
                  <List className="w-4 h-4" />
                  View Leads
                </Button>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setLeadCaptureMode("direct")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
                      leadCaptureMode === "direct"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    <UserSquare2 className="w-3.5 h-3.5" />
                    Direct Entry
                  </button>
                  <button
                    onClick={() => setLeadCaptureMode("bulk")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
                      leadCaptureMode === "bulk"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Bulk Import
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto pt-4">{renderTab()}</div>
    </div>
  );
};
