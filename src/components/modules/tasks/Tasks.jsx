import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Routes,
  Route,
  Navigate,
  NavLink,
  useLocation,
} from "react-router-dom";
import { useTaskStore } from "../../../store/useTaskStore";
import { TASK_STATUS } from "../../../data/mockTasks";
import { cn } from "../../../utils/cn";
import { Card, CardContent } from "../../ui/card";
import {
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle,
  Plus,
  Download,
  List,
  KanbanSquare,
} from "lucide-react";
import { toast } from "sonner";

// Sub-components
import { TaskDashboard } from "./TaskDashboard";
import { TaskList } from "./TaskList";
import { TaskKanban } from "./TaskKanban";
import { TaskFormSlideover } from "./TaskFormSlideover";
import { TaskDetailsModal } from "./TaskDetailsModal";

const MetricCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
  <Card
    className={cn(
      "border-none shadow-sm overflow-hidden h-20 transition-all hover:shadow-md",
      colorClass,
    )}
  >
    <CardContent className="px-4 py-3 flex items-center justify-between h-full">
      <div>
        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">
            {value}
          </h3>
          {subtitle && (
            <span className="text-[10px] text-slate-400 font-normal">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
        <Icon className="w-5 h-5" />
      </div>
    </CardContent>
  </Card>
);

export const Tasks = () => {
  const location = useLocation();
  const { tasks, openTaskForm, moveTaskStatus, deleteTask } = useTaskStore();
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("tasks_view_mode") || "list";
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem("tasks_view_mode", mode);
  };

  const totalTasks = tasks.length;
  const inProgress = tasks.filter(
    (t) =>
      t.status === TASK_STATUS.IN_PROGRESS || t.status === TASK_STATUS.OVERDUE,
  ).length;
  const completed = tasks.filter(
    (t) => t.status === TASK_STATUS.COMPLETED,
  ).length;

  const today = new Date().toISOString().split("T")[0];
  const overdue = tasks.filter(
    (t) => t.status !== TASK_STATUS.COMPLETED && t.dueDate < today,
  ).length;

  const progressToday =
    totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-200 px-0 pt-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Task Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Organize, track, and manage all your CRM tasks
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg mr-2">
              <button
                onClick={() => handleViewModeChange("list")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                  viewMode === "list"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
              <button
                onClick={() => handleViewModeChange("kanban")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                  viewMode === "kanban"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                <KanbanSquare className="w-3.5 h-3.5" />
                Board
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const headers = [
                  "Title",
                  "Assignee",
                  "Deadline",
                  "Priority",
                  "Status",
                ];
                const csvData = tasks.map((t) => [
                  t.title,
                  t.assignee,
                  t.dueDate,
                  t.priority,
                  t.status,
                ]);
                const csvContent = [
                  headers.join(","),
                  ...csvData.map((r) => r.join(",")),
                ].join("\n");
                const blob = new Blob([csvContent], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `tasks_export_${new Date().toISOString().split("T")[0]}.csv`;
                a.click();
                toast.success("Tasks exported to CSV");
              }}
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
              onClick={() => openTaskForm()}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              New Task
            </motion.button>
          </div>
        </div>

        {/* Stats Grid - Moved here from Dashboard */}
        <div className="px-0 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Tasks"
              value={totalTasks}
              icon={ListTodo}
              colorClass="bg-indigo-50/50 border-indigo-100"
            />
            <MetricCard
              title="In Progress"
              value={inProgress}
              icon={Clock}
              colorClass="bg-amber-50/50 border-amber-100"
            />
            <MetricCard
              title="Completed"
              value={completed}
              icon={CheckCircle2}
              colorClass="bg-emerald-50/50 border-emerald-100"
            />
            <MetricCard
              title="Overdue"
              value={overdue}
              icon={AlertCircle}
              colorClass="bg-rose-50/50 border-rose-100"
            />
          </div>

          <Card className="mt-4 bg-slate-900 border-slate-800 shadow-sm overflow-hidden">
            <CardContent className="px-5 py-2.5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    Team Momentum
                    <span className="text-indigo-400 text-sm">
                      {progressToday}%
                    </span>
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Overall task completion rate across all projects.
                  </p>
                </div>
              </div>
              <div className="flex-1 w-full max-w-md bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToday}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto pt-4">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route
            path="dashboard"
            element={<TaskDashboard viewMode={viewMode} />}
          />
          <Route path="list" element={<TaskList />} />
          <Route path="kanban" element={<TaskKanban />} />
        </Routes>
      </div>

      <TaskFormSlideover />
      <TaskDetailsModal />
    </div>
  );
};
