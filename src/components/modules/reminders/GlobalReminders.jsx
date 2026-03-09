import { useState, useMemo, useEffect, Fragment } from "react";
import { motion } from "framer-motion";
import {
  format,
  isToday,
  isPast,
  isFuture,
  parse,
  addDays,
  isValid,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  MoreVertical,
  Plus,
  Search,
  AlertCircle,
  Edit2,
  Trash2,
  User,
  ChevronDown,
  List,
  XCircle,
  Target,
  ArrowUpDown,
  Maximize2,
  Minimize2,
  Download,
  Flag,
  AlertTriangle,
} from "lucide-react";

import { useLocation } from "react-router-dom";
import { toast } from "sonner";

import { useLeadStore } from "../../../store/useLeadStore";
import { useAppStore } from "../../../store/appStore";
import { useTaskStore } from "../../../store/useTaskStore";
import { TaskDetailsModal } from "../tasks/TaskDetailsModal";
import { TaskFormSlideover } from "../tasks/TaskFormSlideover";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Input, Select } from "../../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../ui/dialog";
import { cn } from "../../../lib/utils";
import { Pagination } from "../../ui/pagination";
import { GlobalRemindersCreate } from "./GlobalRemindersCreate";
import { GlobalRemindersCalendar } from "./GlobalRemindersCalendar";

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

export const GlobalReminders = () => {
  const {
    reminders,
    addReminder,
    updateReminder,
    updateReminderStatus,
    deleteReminder,
    leads,
  } = useLeadStore();

  const { clients } = useAppStore();
  const location = useLocation();

  const [statusFilter, setStatusFilter] = useState("all");
  const [leadFilter, setLeadFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("reminders_view_mode") || "list";
  });
  const [density, setDensity] = useState("comfortable"); // 'comfortable' | 'compact'
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "asc",
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem("reminders_view_mode", mode);
  };

  const [selectedIds, setSelectedIds] = useState(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Advanced Interaction State
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [highlightedId, setHighlightedId] = useState(null);
  const [deleteReminderId, setDeleteReminderId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlight = params.get("highlight");
    if (highlight) {
      setHighlightedId(Number(highlight));
      const timer = setTimeout(() => {
        setHighlightedId(null);
        // optionally remove from URL without reload
        window.history.replaceState({}, document.title, location.pathname);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.search, location.pathname]);

  const toggleSelection = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedList.map((r) => r.id)));
    }
  };

  const handleBulkComplete = () => {
    selectedIds.forEach((id) => updateReminderStatus(id, "completed"));
    toast.success(`${selectedIds.size} tasks marked as completed`);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.size} reminders?`,
      )
    )
      return;
    selectedIds.forEach((id) => deleteReminder(id));
    toast.success(`${selectedIds.size} tasks deleted`);
    setSelectedIds(new Set());
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleExportCSV = () => {
    if (filteredList.length === 0) return toast.error("No data to export");

    const headers = [
      "Title",
      "Lead",
      "Date",
      "Time",
      "Status",
      "Created At",
      "Created By",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredList.map((r) =>
        [
          `"${r.title}"`,
          `"${r.lead || ""}"`,
          r.date,
          r.time,
          r.status,
          r.createdAt || "",
          r.createdBy || "",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `reminders_export_${format(new Date(), "yyyyMMdd")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully");
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Grouping for Stats Strip
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = format(now, "dd-MM-yyyy");

    let dueToday = 0;
    let overdue = 0;
    let upcoming = 0;
    let completedGlobal = 0;
    let completedToday = 0;

    reminders.forEach((r) => {
      const rDate = parse(r.date, "dd-MM-yyyy", new Date());
      const isTaskToday = isValid(rDate) && isToday(rDate);

      if (r.status === "completed") {
        completedGlobal++;
        if (isTaskToday) completedToday++;
        return;
      }

      if (isTaskToday) {
        dueToday++;
      } else if (isValid(rDate)) {
        if (isPast(rDate)) {
          overdue++;
        }
      } else if (isFuture(rDate)) {
        upcoming++;
      }
    });

    // Momentum includes both Today's tasks AND anything that is Overdue
    const totalTodayWorkload = dueToday + completedToday + overdue;
    const progressToday =
      totalTodayWorkload > 0
        ? Math.round((completedToday / totalTodayWorkload) * 100)
        : 0;

    return {
      dueToday,
      overdue,
      upcoming,
      completed: completedGlobal,
      progressToday,
    };
  }, [reminders, viewMode, selectedDate]);

  // Derived list based on selected tab and calendar date
  const filteredList = useMemo(() => {
    return reminders
      .filter((r) => {
        // Status filter
        if (statusFilter === "pending" && r.status === "completed")
          return false;
        if (statusFilter === "completed" && r.status === "pending")
          return false;

        // Date filter
        const selectedDateStr =
          viewMode === "calendar" && selectedDate
            ? format(selectedDate, "dd-MM-yyyy")
            : null;
        if (selectedDateStr && r.date !== selectedDateStr) return false;

        // Client/Lead filter
        if (
          leadFilter !== "all" &&
          r.leadId !== Number(leadFilter) &&
          r.lead !== leadFilter
        )
          return false;

        // Search filter
        if (
          searchQuery &&
          !r.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(r.lead || "").toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(r.notes || "").toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by date then time
        const direction = sortConfig.direction === "asc" ? 1 : -1;

        if (sortConfig.key === "date") {
          const dateA = parse(a.date, "dd-MM-yyyy", new Date());
          const dateB = parse(b.date, "dd-MM-yyyy", new Date());
          if (dateA.getTime() !== dateB.getTime()) {
            return (dateA.getTime() - dateB.getTime()) * direction;
          }
          return a.time.localeCompare(b.time) * direction;
        }

        if (sortConfig.key === "title") {
          return a.title.localeCompare(b.title) * direction;
        }

        if (sortConfig.key === "lead") {
          return (a.lead || "").localeCompare(b.lead || "") * direction;
        }

        return 0;
      });
  }, [
    reminders,
    statusFilter,
    selectedDate,
    searchQuery,
    sortConfig,
    viewMode,
  ]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    reminders,
    statusFilter,
    leadFilter,
    selectedDate,
    searchQuery,
    sortConfig,
    viewMode,
  ]);

  // Derived paginated list
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredList.slice(startIndex, startIndex + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Custom visual indicators for Calendar
  const getDayAlerts = (day) => {
    const dayStr = format(day, "dd-MM-yyyy");
    const tasksOnDay = reminders.filter(
      (r) => r.date === dayStr && r.status === "pending",
    );

    if (tasksOnDay.length === 0) return null;

    const hasOverdue = tasksOnDay.some(
      (r) =>
        isPast(parse(r.date, "dd-MM-yyyy", new Date())) &&
        !isToday(parse(r.date, "dd-MM-yyyy", new Date())),
    );

    if (hasOverdue) return "bg-red-500";
    return "bg-blue-500";
  };

  const handleStatusToggle = (id, currentStatus) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    updateReminderStatus(id, newStatus);
    toast.success(
      newStatus === "completed"
        ? "Reminder marked as completed"
        : "Reminder marked as pending",
    );
  };

  const { openTaskDetails, tasks } = useTaskStore();

  const openCreateDrawer = () => {
    setEditingId(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (id, eventType = "reminder") => {
    if (eventType === "task") {
      const task = tasks.find((t) => t.id === id);
      if (task) openTaskDetails(task);
      return;
    }
    setEditingId(id);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-10">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-200 px-0 pt-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Global Reminders
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all cross-client tasks and scheduled touchpoints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg mr-2">
              <button
                onClick={() => handleViewModeChange("calendar")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === "calendar"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Calendar
              </button>
              <button
                onClick={() => handleViewModeChange("list")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
            </div>

            {viewMode === "list" && (
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
            )}

            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 15px -3px rgba(30, 58, 95, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateDrawer}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              New Reminder
            </motion.button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-0 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Due Today"
              value={stats.dueToday}
              icon={CalendarIcon}
              colorClass="bg-indigo-50/50 border-indigo-100"
            />
            <MetricCard
              title="Overdue"
              value={stats.overdue}
              icon={AlertCircle}
              colorClass="bg-rose-50/50 border-rose-100"
            />
            <MetricCard
              title="Upcoming"
              value={stats.upcoming}
              icon={Clock}
              colorClass="bg-blue-50/50 border-blue-100"
            />
            <MetricCard
              title="Completed"
              value={stats.completed}
              icon={CheckCircle}
              colorClass="bg-emerald-50/50 border-emerald-100"
            />
          </div>

          <Card className="mt-4 bg-slate-900 border-slate-800 shadow-sm overflow-hidden">
            <CardContent className="px-5 py-2.5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    Team Momentum
                    <span className="text-indigo-400 text-sm">
                      {stats.progressToday}%
                    </span>
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Overall reminder completion rate for today.
                  </p>
                </div>
              </div>
              <div className="flex-1 w-full max-w-md bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progressToday}%` }}
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
        {viewMode === "calendar" ? (
          <div className="">
            <GlobalRemindersCalendar
              onOpenEdit={openEditDrawer}
              onOpenCreate={openCreateDrawer}
              searchQuery={searchQuery}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full p-0 space-y-4">
            {/* Filters & Actions Header */}
            <div className="shrink-0 px-0">
              <div className="flex items-center gap-3 w-full md:w-auto flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search reminders..."
                    className="pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-40 shrink-0">
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      options={[
                        { value: "all", label: "All Statuses" },
                        { value: "pending", label: "Pending" },
                        { value: "completed", label: "Completed" },
                      ]}
                    />
                  </div>

                  <div className="w-40 shrink-0">
                    <Select
                      value={leadFilter}
                      onChange={(e) => setLeadFilter(e.target.value)}
                      options={[
                        { value: "all", label: "All Clients" },
                        ...leads.map((lead) => ({
                          value: lead.id.toString(),
                          label: lead.name,
                        })),
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 px-0 h-full">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                <div className="flex-1 overflow-y-auto">
                  {paginatedList.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-100 rounded-2xl">
                      <Clock className="w-12 h-12 mb-3 text-slate-200" />
                      <p className="font-medium text-slate-600">
                        No Reminders Found
                      </p>
                      <p className="text-sm mt-1 text-center max-w-sm">
                        {searchQuery || selectedDate
                          ? "Try altering your search query, or clear your date filter to view more."
                          : "You're all caught up on all fronts! Enjoy your day."}
                      </p>
                      {(searchQuery ||
                        selectedDate ||
                        leadFilter !== "all" ||
                        statusFilter !== "all") && (
                        <Button
                          variant="link"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedDate(null);
                            setLeadFilter("all");
                            setStatusFilter("all");
                          }}
                          className="mt-2 text-indigo-600"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 w-10 text-center">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              checked={
                                paginatedList.length > 0 &&
                                selectedIds.size === paginatedList.length
                              }
                              onChange={toggleSelectAll}
                            />
                          </th>
                          <th className="px-4 py-3 font-medium text-slate-500">
                            <button
                              onClick={() => handleSort("title")}
                              className="flex items-center hover:text-indigo-600 transition-colors"
                            >
                              Reminder Title
                              <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />
                            </button>
                          </th>
                          <th className="px-4 py-3 font-medium text-slate-500">
                            <button
                              onClick={() => handleSort("lead")}
                              className="flex items-center hover:text-indigo-600 transition-colors"
                            >
                              Related Lead
                              <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />
                            </button>
                          </th>
                          <th className="px-4 py-3 font-medium text-slate-500">
                            <button
                              onClick={() => handleSort("date")}
                              className="flex items-center hover:text-indigo-600 transition-colors"
                            >
                              Date & Time
                              <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />
                            </button>
                          </th>
                          <th className="px-4 py-3 font-medium text-slate-500">
                            Created At
                          </th>
                          <th className="px-4 py-3 font-medium text-slate-500">
                            Created By
                          </th>
                          <th className="px-4 py-3 font-medium text-slate-500 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedList.map((reminder) => {
                          const isOverdue =
                            reminder.status === "pending" &&
                            isPast(
                              parse(reminder.date, "dd-MM-yyyy", new Date()),
                            ) &&
                            !isToday(
                              parse(reminder.date, "dd-MM-yyyy", new Date()),
                            );

                          const associatedLead = leads.find(
                            (l) => l.id === reminder.leadId,
                          );
                          const leadNameTag = associatedLead
                            ? associatedLead.name
                            : reminder.lead;

                          const isExpanded = expandedRows.has(reminder.id);
                          const isHighlighted = highlightedId === reminder.id;

                          return (
                            <Fragment key={reminder.id}>
                              <tr
                                className={`group transition-all hover:bg-slate-50 ${
                                  isHighlighted ? "bg-indigo-50/50" : ""
                                } ${
                                  selectedIds.has(reminder.id)
                                    ? "bg-indigo-50/30"
                                    : ""
                                } ${
                                  reminder.status === "completed"
                                    ? "opacity-60 bg-slate-50/50"
                                    : isOverdue
                                      ? "bg-rose-50/30"
                                      : ""
                                }`}
                              >
                                <td className="px-4 py-3 text-center">
                                  <input
                                    type="checkbox"
                                    className="rounded border-slate-300 w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    checked={selectedIds.has(reminder.id)}
                                    onChange={() =>
                                      toggleSelection(reminder.id)
                                    }
                                  />
                                </td>
                                <td
                                  className={cn(
                                    "px-4 py-3 pl-6 relative",
                                    density === "compact" && "py-1.5",
                                  )}
                                >
                                  <div
                                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                                      reminder.status === "completed"
                                        ? "bg-slate-300"
                                        : isOverdue
                                          ? "bg-rose-500"
                                          : "bg-indigo-500"
                                    }`}
                                  />
                                  <div
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() =>
                                      toggleRowExpansion(reminder.id)
                                    }
                                  >
                                    <span
                                      className={`font-semibold ${
                                        reminder.status === "completed"
                                          ? "line-through text-slate-500"
                                          : "text-slate-800"
                                      }`}
                                    >
                                      {reminder.title}
                                    </span>
                                    {reminder.notes && (
                                      <ChevronDown
                                        className={`w-4 h-4 text-slate-400 transition-transform ${
                                          isExpanded ? "rotate-180" : ""
                                        }`}
                                      />
                                    )}
                                  </div>
                                </td>

                                <td
                                  className={cn(
                                    "px-4 py-3",
                                    density === "compact" && "py-1.5",
                                  )}
                                >
                                  {leadNameTag ? (
                                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                                      <User className="w-3.5 h-3.5 text-indigo-400" />{" "}
                                      {leadNameTag}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>

                                <td
                                  className={cn(
                                    "px-4 py-3",
                                    density === "compact" && "py-1.5",
                                  )}
                                >
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                      <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                                      {reminder.date}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                                      <Clock className="w-3 h-3" />
                                      {reminder.time}
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-3">
                                  <span className="text-slate-500 text-xs">
                                    {reminder.createdAt || "N/A"}
                                  </span>
                                </td>

                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                                      {(reminder.createdBy || "S").charAt(0)}
                                    </div>
                                    <span className="text-slate-600 text-xs font-medium">
                                      {reminder.createdBy || "System"}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleStatusToggle(
                                          reminder.id,
                                          reminder.status,
                                        )
                                      }
                                      className={cn(
                                        "h-8 w-8",
                                        reminder.status === "completed"
                                          ? "text-slate-400"
                                          : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
                                      )}
                                      title={
                                        reminder.status === "completed"
                                          ? "Mark as Pending"
                                          : "Mark as Completed"
                                      }
                                    >
                                      {reminder.status === "completed" ? (
                                        <XCircle className="h-4 w-4" />
                                      ) : (
                                        <CheckCircle className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        openEditDrawer(reminder.id)
                                      }
                                      className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                      title="Edit Reminder"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        setDeleteReminderId(reminder.id)
                                      }
                                      className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                      title="Delete Reminder"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>

                              {isExpanded && (
                                <tr>
                                  <td
                                    colSpan={7}
                                    className="px-0 py-0 border-0 bg-slate-50/50"
                                  >
                                    <div className="p-4 pl-16 text-sm text-slate-600 border-b border-slate-100 shadow-inner animate-in slide-in-from-top-2">
                                      {reminder.notes ? (
                                        <p className="whitespace-pre-wrap">
                                          {reminder.notes}
                                        </p>
                                      ) : (
                                        <p className="italic text-slate-400">
                                          No additional notes provided.
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination Controls */}
                {filteredList.length > 0 && (
                  <div className="border-t border-slate-100 pt-2 bg-white">
                    <Pagination
                      totalItems={filteredList.length}
                      pageSize={pageSize}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <GlobalRemindersCreate
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        editReminderId={editingId}
      />

      <TaskDetailsModal />
      <TaskFormSlideover />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteReminderId}
        onOpenChange={(open) => !open && setDeleteReminderId(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Delete Reminder
            </DialogTitle>
            <DialogDescription className="py-2">
              Are you sure you want to delete this reminder? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteReminderId(null)}
              className="mt-2 sm:mt-0"
            >
              Cancel
            </Button>
            <Button
              className="bg-rose-600 text-white hover:bg-rose-700 font-medium"
              onClick={() => {
                deleteReminder(deleteReminderId);
                toast.success("Reminder deleted successfully");
                setDeleteReminderId(null);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-6 border border-slate-700/50 backdrop-blur-md">
            <div className="flex items-center gap-2 border-r border-slate-700 pr-6">
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {selectedIds.size}
              </span>
              <span className="text-sm font-medium">Selected</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleBulkComplete}
                className="flex items-center gap-2 text-sm font-medium hover:text-indigo-400 transition-colors"
                title="Mark Selected as Complete"
              >
                <CheckCircle className="w-4 h-4" />
                Complete
              </button>

              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 text-sm font-medium hover:text-rose-400 transition-colors"
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>

              <button
                onClick={() => setSelectedIds(new Set())}
                className="ml-2 text-slate-400 hover:text-white transition-colors"
                title="Clear Selection"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
