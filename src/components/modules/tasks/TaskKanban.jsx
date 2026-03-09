import React, { useState } from "react";
import { useTaskStore } from "../../../store/useTaskStore";
import { TASK_STATUS, TASK_PRIORITY } from "../../../data/mockTasks";
import {
  Settings,
  MoreHorizontal,
  Calendar,
  Plus,
  MessageSquare,
  Edit2,
  Trash2,
  Clock,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "../../../utils/cn";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../ui/dialog";

const PriorityBadge = ({ priority }) => {
  const styles = {
    [TASK_PRIORITY.URGENT]: "bg-red-100 text-red-700 border-red-200",
    [TASK_PRIORITY.HIGH]: "bg-orange-100 text-orange-700 border-orange-200",
    [TASK_PRIORITY.MEDIUM]: "bg-blue-100 text-blue-700 border-blue-200",
    [TASK_PRIORITY.LOW]: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        styles[priority],
      )}
    >
      {priority}
    </Badge>
  );
};

export const TaskKanban = () => {
  const { tasks, moveTaskStatus, openTaskDetails, openTaskForm, deleteTask } =
    useTaskStore();
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  const columns = [
    {
      id: TASK_STATUS.PENDING,
      title: "Backlog",
      color: "bg-slate-50/50",
      dot: "bg-slate-400",
    },
    {
      id: TASK_STATUS.IN_PROGRESS,
      title: "In Progress",
      color: "bg-indigo-50/30",
      dot: "bg-indigo-500",
    },
    {
      id: TASK_STATUS.COMPLETED,
      title: "Completed",
      color: "bg-emerald-50/30",
      dot: "bg-emerald-500",
    },
    {
      id: TASK_STATUS.OVERDUE,
      title: "Overdue",
      color: "bg-rose-50/30",
      dot: "bg-rose-500",
    },
    {
      id: TASK_STATUS.CANCELLED,
      title: "Cancelled",
      color: "bg-slate-100/50",
      dot: "bg-slate-300",
    },
  ];

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    // Needed for Firefox
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, statusId) => {
    e.preventDefault();
    if (draggedTaskId) {
      moveTaskStatus(draggedTaskId, statusId);
      toast.success(`Task status updated to ${statusId}`);
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              className={cn(
                "flex-shrink-0 w-80 rounded-xl flex flex-col",
                column.color,
              )}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full", column.dot)} />
                  <h3 className="font-semibold text-gray-900">
                    {column.title}
                  </h3>
                  <span className="bg-white/60 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-black/5 rounded text-gray-500">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:bg-black/5 rounded text-gray-500">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Column Body */}
              <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className={cn(
                      "bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:shadow-md transition-all relative group",
                      draggedTaskId === task.id ? "opacity-50" : "",
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <PriorityBadge priority={task.priority} />
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(
                              activeDropdown === task.id ? null : task.id,
                            );
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {activeDropdown === task.id && (
                          <div className="absolute right-0 top-6 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openTaskDetails(task);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors"
                            >
                              <Eye className="w-4 h-4" /> View Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openTaskForm(task);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" /> Edit Task
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTaskId(task.id);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm font-medium text-gray-900 mb-1 leading-snug">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center gap-1 text-[10px] text-slate-500 font-medium"
                          title="Due Date"
                        >
                          <Clock className="w-3 h-3" />
                          <span>
                            {format(new Date(task.dueDate), "dd-MM-yyyy")}
                          </span>
                        </div>
                        {task.type === "email" || task.type === "call" ? (
                          <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Client</span>
                          </div>
                        ) : null}
                      </div>

                      <div
                        className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold uppercase ring-2 ring-white"
                        title={task.assignee}
                      >
                        {task.assignee.charAt(0)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Drop Zone Placeholder for empty column styling */}
                {columnTasks.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-400">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
            <Button
              variant="outline"
              onClick={() => setDeleteTaskId(null)}
              className="mt-2 sm:mt-0"
            >
              Cancel
            </Button>
            <Button
              className="bg-rose-600 text-white hover:bg-rose-700 font-medium"
              onClick={() => {
                deleteTask(deleteTaskId);
                toast.success("Task deleted successfully");
                setDeleteTaskId(null);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
