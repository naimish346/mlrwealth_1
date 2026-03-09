import React, { useState, useMemo } from "react";
import { useTaskStore } from "../../../store/useTaskStore";
import { TASK_STATUS, TASK_PRIORITY } from "../../../data/mockTasks";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
} from "date-fns";
import { cn } from "../../../utils/cn";

const getStatusColor = (status) => {
  switch (status) {
    case TASK_STATUS.PENDING:
      return "bg-slate-100 text-slate-700 border-slate-200";
    case TASK_STATUS.IN_PROGRESS:
      return "bg-amber-100 text-amber-800 border-amber-200";
    case TASK_STATUS.COMPLETED:
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case TASK_STATUS.OVERDUE:
      return "bg-red-100 text-red-800 border-red-200";
    case TASK_STATUS.CANCELLED:
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getPriorityIndicator = (priority) => {
  switch (priority) {
    case TASK_PRIORITY.URGENT:
      return "bg-red-500";
    case TASK_PRIORITY.HIGH:
      return "bg-orange-500";
    case TASK_PRIORITY.MEDIUM:
      return "bg-blue-500";
    case TASK_PRIORITY.LOW:
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
};

export const TaskCalendar = () => {
  const { tasks, openTaskDetails } = useTaskStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = useMemo(() => {
    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [startDate, endDate]);

  const tasksMap = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      const dateKey = format(parseISO(task.dueDate), "yyyy-MM-dd");
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(task);
    });
    return map;
  }, [tasks]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 w-48">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-50 rounded-md transition-colors text-gray-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium hover:bg-slate-50 rounded-md transition-colors text-gray-700 border-x border-gray-100"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-50 rounded-md transition-colors text-gray-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Pending
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" /> In
            Progress
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />{" "}
            Completed
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Overdue
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Cancelled
          </div>
        </div>
      </div>

      {/* Calendar Grid Header */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-100 last:border-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid Body */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-gray-100 gap-px">
        {calendarDays.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const dateKey = format(day, "yyyy-MM-dd");
          const dayTasks = tasksMap[dateKey] || [];

          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[120px] bg-white p-2 flex flex-col transition-colors hover:bg-slate-50 cursor-pointer overflow-hidden group",
                !isCurrentMonth && "bg-slate-50/50",
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                    isToday
                      ? "bg-amber-500 text-white shadow-sm"
                      : isCurrentMonth
                        ? "text-gray-900"
                        : "text-gray-400",
                  )}
                >
                  {format(day, "d")}
                </span>

                {dayTasks.length > 0 && (
                  <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-600 px-1.5 py-0.5 rounded-full bg-gray-100">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      openTaskDetails(task);
                    }}
                    className={cn(
                      "text-xs p-1.5 rounded border shadow-sm relative pl-2.5 group/task cursor-pointer hover:shadow-md transition-all",
                      getStatusColor(task.status),
                      !isCurrentMonth && "opacity-60 hover:opacity-100",
                    )}
                    title={task.title}
                  >
                    {/* Priority Indicator Line */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 rounded-l-sm",
                        getPriorityIndicator(task.priority),
                      )}
                    />

                    <div className="flex items-center gap-1.5 mb-1">
                      {task.status === TASK_STATUS.COMPLETED ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-3 h-3 text-current opacity-70 shrink-0" />
                      )}
                      <span className="font-semibold truncate">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex justify-between items-center opacity-70 shrink-0">
                      <span className="text-[9px] truncate">
                        {task.assignee}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
