import React from "react";
import {
  X,
  Calendar as CalendarIcon,
  Flag,
  Tag,
  Users,
  AlignLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useTaskStore } from "../../../store/useTaskStore";
import { TASK_STATUS, TASK_PRIORITY, TASK_TYPE } from "../../../data/mockTasks";
import { cn } from "../../../utils/cn";
import { useEffect } from "react";

export const TaskDetailsModal = () => {
  const { isDetailsOpen, viewingTask, closeTaskDetails, openTaskForm } =
    useTaskStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isDetailsOpen) {
        closeTaskDetails();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDetailsOpen, closeTaskDetails]);

  if (!isDetailsOpen || !viewingTask) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case TASK_PRIORITY.URGENT:
        return "bg-red-100 text-red-700 border-red-200";
      case TASK_PRIORITY.HIGH:
        return "bg-orange-100 text-orange-700 border-orange-200";
      case TASK_PRIORITY.MEDIUM:
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case TASK_STATUS.PENDING:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
            Pending
          </span>
        );
      case TASK_STATUS.IN_PROGRESS:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-700">
            In Progress
          </span>
        );
      case TASK_STATUS.COMPLETED:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">
            Completed
          </span>
        );
      case TASK_STATUS.OVERDUE:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700">
            Overdue
          </span>
        );
      case TASK_STATUS.CANCELLED:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity"
        onClick={closeTaskDetails}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between bg-slate-50">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  {viewingTask.title}
                </h2>
                {getStatusBadge(viewingTask.status)}
              </div>
              <p className="text-sm text-gray-400">Task ID: {viewingTask.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  closeTaskDetails();
                  openTaskForm(viewingTask);
                }}
                className="px-4 py-1.5 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#1e3a5f]/90 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={closeTaskDetails}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Properties Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" /> Priority
                </p>
                <span
                  className={cn(
                    "inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border",
                    getPriorityColor(viewingTask.priority),
                  )}
                >
                  {viewingTask.priority}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" /> Due Date
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(viewingTask.dueDate).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Type
                </p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {viewingTask.type}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Assignee
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                    {viewingTask.assignee?.charAt(0) || "?"}
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {viewingTask.assignee}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                <AlignLeft className="w-4 h-4 text-gray-400" /> Description
              </h3>
              {viewingTask.description ? (
                <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {viewingTask.description}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No description provided.
                </p>
              )}
            </div>

            {/* Metadata Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <p>
                Created: {new Date(viewingTask.createdAt).toLocaleDateString()}
              </p>
              {viewingTask.clientId && (
                <p>Client Ref: {viewingTask.clientId}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
