import React, { useMemo } from "react";
import { useLeadStore } from "../../../store/useLeadStore";
import { useTaskStore } from "../../../store/useTaskStore";
import { TASK_STATUS } from "../../../data/mockTasks";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Plus,
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
  parse,
  isValid,
} from "date-fns";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";

const getStatusColor = (status, isOverdue) => {
  if (status === "completed") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
  if (isOverdue) {
    return "bg-rose-100 text-rose-800 border-rose-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
};

export const GlobalRemindersCalendar = ({
  onOpenEdit,
  onOpenCreate,
  searchQuery = "",
  selectedDate = new Date(),
  onDateChange,
}) => {
  const { reminders } = useLeadStore();
  const { tasks } = useTaskStore();

  const nextMonth = () => onDateChange(addMonths(selectedDate, 1));
  const prevMonth = () => onDateChange(subMonths(selectedDate, 1));
  const goToToday = () => onDateChange(new Date());

  const monthStart = startOfMonth(selectedDate);
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

  const remindersMap = useMemo(() => {
    const map = {};

    // 1. Process Reminders (dd-MM-yyyy)
    reminders
      .filter((r) => {
        if (
          searchQuery &&
          !r.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(r.lead || "").toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .forEach((reminder) => {
        if (!reminder.date || typeof reminder.date !== "string") return;
        const parsedDate = parse(reminder.date, "dd-MM-yyyy", new Date());
        if (!isValid(parsedDate)) return;

        const dateKey = format(parsedDate, "yyyy-MM-dd");
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push({ ...reminder, eventType: "reminder" });
      });

    // 2. Process Tasks (yyyy-MM-dd)
    tasks
      .filter((t) => {
        if (
          searchQuery &&
          !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(t.description || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .forEach((task) => {
        if (!task.dueDate) return;
        const parsedDate = parse(task.dueDate, "yyyy-MM-dd", new Date());
        if (!isValid(parsedDate)) return;

        const dateKey = format(parsedDate, "yyyy-MM-dd");
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push({
          ...task,
          eventType: "task",
          date: task.dueDate, // unify field name for logic below if needed
          lead: task.assignee, // use assignee as the lead equivalent for display
        });
      });

    return map;
  }, [reminders, tasks, searchQuery]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 w-48">
            {format(selectedDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-50 rounded-md transition-colors text-gray-600"
            >
              <ChevronLeft className="w-5 h-5" />
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
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />{" "}
            Completed
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Overdue
          </div>
        </div>
      </div>

      {/* Calendar Grid Header */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white min-h-[40px]">
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
          const dayReminders = remindersMap[dateKey] || [];

          return (
            <div
              key={day.toString()}
              className={cn(
                "bg-white p-2 flex flex-col transition-colors hover:bg-slate-50 overflow-hidden group border-b border-r border-gray-100",
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

                {dayReminders.length > 0 && (
                  <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-600 px-1.5 py-0.5 rounded-full bg-gray-100">
                    {dayReminders.length}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-hide">
                {dayReminders.map((event) => {
                  const isTask = event.eventType === "task";
                  const eventDate = isTask
                    ? parse(event.dueDate, "yyyy-MM-dd", new Date())
                    : parse(event.date, "dd-MM-yyyy", new Date());

                  const isOverdue =
                    event.status !== "completed" &&
                    eventDate < new Date(new Date().setHours(0, 0, 0, 0)) &&
                    !isSameDay(eventDate, new Date());

                  return (
                    <div
                      key={`${event.eventType}-${event.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEdit(event.id, event.eventType);
                      }}
                      className={cn(
                        "text-[10px] p-1.5 rounded border shadow-sm relative pl-2.5 group/task cursor-pointer hover:shadow-md transition-all",
                        getStatusColor(event.status, isOverdue),
                        isTask && "border-l-2",
                        !isCurrentMonth && "opacity-60 hover:opacity-100",
                      )}
                      title={`${isTask ? "[TASK] " : ""}${event.title}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {isTask ? (
                          <div className="bg-indigo-600 text-[8px] text-white px-1 rounded-sm font-bold leading-tight mr-0.5">
                            T
                          </div>
                        ) : null}
                        {event.status === "completed" ? (
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Clock className="w-2.5 h-2.5 text-current opacity-70 shrink-0" />
                        )}
                        <span className="font-semibold truncate">
                          {event.title}
                        </span>
                      </div>

                      <div className="flex justify-between items-center opacity-70 shrink-0">
                        <span className="text-[8px] truncate">
                          {isTask ? event.assignee : event.lead || "General"}
                        </span>
                        {event.time && (
                          <span className="text-[8px]">{event.time}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
