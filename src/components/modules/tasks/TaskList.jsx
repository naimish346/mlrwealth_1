import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  ArrowUpDown,
  Clock,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { toast } from "sonner";
import { useTaskStore } from "../../../store/useTaskStore";
import { TASK_STATUS, TASK_PRIORITY } from "../../../data/mockTasks";
import { cn } from "../../../utils/cn";
import { Card, CardContent } from "../../ui/card";
import { Input, Select } from "../../ui/input";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Pagination } from "../../ui/pagination";

const PriorityBadge = ({ priority }) => {
  const styles = {
    [TASK_PRIORITY.URGENT]: "bg-rose-100 text-rose-700 border-rose-200",
    [TASK_PRIORITY.HIGH]: "bg-amber-100 text-amber-700 border-amber-200",
    [TASK_PRIORITY.MEDIUM]: "bg-blue-100 text-blue-700 border-blue-200",
    [TASK_PRIORITY.LOW]: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize",
        styles[priority],
      )}
    >
      {priority.toLowerCase()}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    [TASK_STATUS.PENDING]: "bg-slate-100 text-slate-700 border-slate-200",
    [TASK_STATUS.IN_PROGRESS]: "bg-blue-100 text-blue-700 border-blue-200",
    [TASK_STATUS.COMPLETED]:
      "bg-emerald-100 text-emerald-700 border-emerald-200",
    [TASK_STATUS.OVERDUE]: "bg-rose-100 text-rose-700 border-rose-200",
    [TASK_STATUS.CANCELLED]: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn("w-1.5 h-1.5 rounded-full", {
          "bg-slate-400": status === TASK_STATUS.PENDING,
          "bg-blue-500": status === TASK_STATUS.IN_PROGRESS,
          "bg-emerald-500": status === TASK_STATUS.COMPLETED,
          "bg-rose-500": status === TASK_STATUS.OVERDUE,
          "bg-gray-400": status === TASK_STATUS.CANCELLED,
        })}
      />
      <span
        className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize",
          styles[status],
        )}
      >
        {status.toLowerCase().replace("_", " ")}
      </span>
    </div>
  );
};

export const TaskList = () => {
  const {
    tasks,
    openTaskForm,
    openTaskDetails,
    moveTaskStatus,
    deleteTask,
    itemsPerPage = 10,
  } = useTaskStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "dueDate",
    direction: "asc",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = (paginatedTasks) => {
    if (selectedIds.size === paginatedTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedTasks.map((t) => t.id)));
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "ALL" || task.status === statusFilter;
        const matchesPriority =
          priorityFilter === "ALL" || task.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        return sortConfig.direction === "asc"
          ? valA > valB
            ? 1
            : -1
          : valA < valB
            ? 1
            : -1;
      });
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortConfig]);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 space-y-4">
      {/* Filters & Actions Header */}
      <div className="shrink-0 px-0">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-40 shrink-0">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "ALL", label: "All Status" },
                  { value: TASK_STATUS.PENDING, label: "Pending" },
                  { value: TASK_STATUS.IN_PROGRESS, label: "In Progress" },
                  { value: TASK_STATUS.COMPLETED, label: "Completed" },
                  { value: TASK_STATUS.OVERDUE, label: "Overdue" },
                  { value: TASK_STATUS.CANCELLED, label: "Cancelled" },
                ]}
              />
            </div>

            <div className="w-40 shrink-0">
              <Select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "ALL", label: "All Priorities" },
                  { value: TASK_PRIORITY.URGENT, label: "Urgent" },
                  { value: TASK_PRIORITY.HIGH, label: "High" },
                  { value: TASK_PRIORITY.MEDIUM, label: "Medium" },
                  { value: TASK_PRIORITY.LOW, label: "Low" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Area - Now in its own Card */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 z-10 border-b border-slate-200 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={
                      paginatedTasks.length > 0 &&
                      selectedIds.size === paginatedTasks.length
                    }
                    onChange={() => toggleSelectAll(paginatedTasks)}
                  />
                </th>
                <th className="px-4 py-3.5 font-medium text-slate-500 text-sm tracking-wider">
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center hover:text-indigo-600 transition-colors"
                  >
                    Task Title
                    <ArrowUpDown className="ml-2 w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="px-4 py-3.5 font-medium text-slate-500 text-sm tracking-wider">
                  Assignee
                </th>
                <th className="px-4 py-3.5 font-medium text-slate-500 text-sm tracking-wider">
                  <button
                    onClick={() => handleSort("dueDate")}
                    className="flex items-center hover:text-indigo-600 transition-colors"
                  >
                    Deadline
                    <ArrowUpDown className="ml-2 w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th className="px-4 py-3.5 font-medium text-slate-500 text-sm tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3.5 font-medium text-slate-500 text-sm tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3.5 font-medium text-slate-500 text-sm tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map((task) => (
                  <tr
                    key={task.id}
                    className={cn(
                      "group transition-all hover:bg-slate-50/80",
                      selectedIds.has(task.id) && "bg-indigo-50/30",
                    )}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        checked={selectedIds.has(task.id)}
                        onChange={() => toggleSelection(task.id)}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span
                          onClick={() => openTaskDetails(task)}
                          className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          {task.title}
                        </span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">
                          {task.description || "No description provided"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {task.assignee?.charAt(0) || "U"}
                        </div>
                        <span className="text-xs text-slate-600 font-medium">
                          {task.assignee}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {task.dueDate && isValid(new Date(task.dueDate))
                          ? format(new Date(task.dueDate), "dd-MM-yyyy")
                          : task.dueDate || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center outline-none">
                            <StatusBadge status={task.status} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase">
                            Update Status
                          </DropdownMenuLabel>
                          {Object.values(TASK_STATUS).map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => {
                                moveTaskStatus(task.id, status);
                                toast.success(
                                  `Task updated to ${status.toLowerCase().replace("_", " ")}`,
                                );
                              }}
                              className="text-xs capitalize"
                            >
                              {status.toLowerCase().replace("_", " ")}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 text-indigo-600"
                          onClick={() => openTaskDetails(task)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 text-amber-600"
                          onClick={() => openTaskForm(task)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 text-rose-600"
                          onClick={() => setDeleteTaskId(task.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      No tasks found
                    </p>
                    <p>Try modifying your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Container */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200">
            <Pagination
              totalItems={filteredTasks.length}
              pageSize={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

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
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  selectedIds.forEach((id) =>
                    moveTaskStatus(id, TASK_STATUS.COMPLETED),
                  );
                  toast.success(
                    `${selectedIds.size} tasks marked as completed`,
                  );
                  setSelectedIds(new Set());
                }}
                className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Complete
              </button>
              <button
                onClick={() => setBatchDeleteOpen(true)}
                className="flex items-center gap-2 hover:bg-rose-500/20 px-3 py-1.5 rounded-full transition-colors text-sm font-medium text-rose-300"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="ml-2 text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTaskId}
        onOpenChange={(open) => !open && setDeleteTaskId(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Delete Task
            </DialogTitle>
            <DialogDescription className="py-2">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setDeleteTaskId(null)}>
              Cancel
            </Button>
            <Button
              className="bg-rose-600 text-white hover:bg-rose-700 font-medium"
              onClick={() => {
                if (deleteTaskId) {
                  deleteTask(deleteTaskId);
                  toast.success("Task deleted successfully");
                  setDeleteTaskId(null);
                }
              }}
            >
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
