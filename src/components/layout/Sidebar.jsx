import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Shield,
  Target,
  TrendingUp,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  PieChart,
  Building2,
  LogOut,
  Bell,
  CheckSquare,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useAppStore } from "../../store/appStore";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads/dashboard", label: "Lead Dashboard", icon: LayoutDashboard },
  {
    id: "leads",
    label: "Leads",
    icon: Target,
    subItems: [
      { id: "leads/capture", label: "Add New Lead" },
      { id: "leads", label: "Lead List" },
    ],
  },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  {
    id: "clients",
    label: "Clients",
    icon: Users,
    subItems: [
      { id: "clients/new", label: "Add New Client" },
      { id: "clients", label: "Client List" },
    ],
  },
  { id: "kyc", label: "KYC & Compliance", icon: Shield },
  { id: "risk", label: "Risk Profiling", icon: ClipboardCheck },
  { id: "goals", label: "Goal Planning", icon: Target },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: PieChart,
    subItems: [
      { id: "portfolio/dashboard", label: "Dashboard" },
      { id: "portfolio/mutual-funds", label: "Mutual Funds" },
      { id: "portfolio/external-assets", label: "External Assets" },
      { id: "portfolio/sip-management", label: "SIP Management" },
    ],
  },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, currentUser, logout } =
    useAppStore();
  const [expandedMenus, setExpandedMenus] = useState([]);

  const toggleMenu = (id) => {
    setExpandedMenus((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-[#1e3a5f] text-white flex flex-col transition-all duration-300 z-40",
        sidebarCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-bold text-[#1e3a5f]">
              MLR
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">MLR Wealth</h1>
              <p className="text-xs text-white/60">SEBI RIA</p>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-bold text-[#1e3a5f] mx-auto">
            M
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(`/${item.id}`);
          const isExpanded = expandedMenus.includes(item.id);

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.subItems && !sidebarCollapsed) {
                    toggleMenu(item.id);
                  } else {
                    navigate(`/${item.id}`);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 transition-all duration-200",
                  isActive && !item.subItems
                    ? "bg-white/15 border-r-4 border-amber-400"
                    : "hover:bg-white/10",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive && "text-amber-400",
                    )}
                  />
                  {!sidebarCollapsed && (
                    <span
                      className={cn(
                        "font-medium",
                        isActive && "text-amber-400",
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
                {!sidebarCollapsed && item.subItems && (
                  <div className="text-white/50">
                    {isExpanded ? (
                      <ChevronRight className="w-4 h-4 rotate-90 transition-transform" />
                    ) : (
                      <ChevronRight className="w-4 h-4 transition-transform" />
                    )}
                  </div>
                )}
              </button>

              {/* Sub Menu Items */}
              {!sidebarCollapsed && item.subItems && isExpanded && (
                <div className="bg-[#162d4a] py-1">
                  {item.subItems.map((subItem) => {
                    const isSubActive = location.pathname === `/${subItem.id}`;
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => navigate(`/${subItem.id}`)}
                        className={cn(
                          "w-full flex items-center text-left pl-12 pr-4 py-2.5 text-sm transition-colors",
                          isSubActive
                            ? "text-amber-400 bg-white/5 border-r-4 border-amber-400"
                            : "text-white/70 hover:text-white hover:bg-white/5",
                        )}
                      >
                        {subItem.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-white/10 p-4">
        {!sidebarCollapsed && currentUser && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-white/60">{currentUser.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white",
            sidebarCollapsed && "justify-center",
          )}
        >
          <LogOut className="w-5 h-5" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
