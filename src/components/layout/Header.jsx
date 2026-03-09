import { useState } from "react";
import { Bell, Search, User, ChevronDown } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { cn } from "../../utils/cn";
import { format } from "date-fns";

export const Header = () => {
  const { notifications, markNotificationRead, currentUser, sidebarCollapsed } =
    useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-amber-500";
      case "success":
        return "bg-emerald-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30 transition-all duration-300",
        sidebarCollapsed ? "left-20" : "left-64",
      )}
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients, folios, transactions..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <span className="text-xs text-slate-500">
                  {unreadCount} unread
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={cn(
                      "px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors",
                      !notif.read && "bg-blue-50/50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mt-2",
                          getSeverityColor(notif.severity),
                        )}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900">
                          {notif.title}
                        </p>
                        <p className="text-sm text-slate-600 mt-0.5">
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {format(new Date(notif.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 bg-slate-50">
                <button className="w-full text-sm text-[#1e3a5f] font-medium hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-sm font-medium">
              {currentUser?.name.charAt(0) || <User className="w-4 h-4" />}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-200">
                <p className="font-semibold text-slate-900">
                  {currentUser?.name}
                </p>
                <p className="text-sm text-slate-500">{currentUser?.email}</p>
                <p className="text-xs text-emerald-600 mt-1">
                  {currentUser?.role}
                </p>
              </div>
              <div className="py-2">
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors">
                  Profile Settings
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors">
                  Security
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors">
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
