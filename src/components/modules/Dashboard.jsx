import {
  Users,
  TrendingUp,
  Target,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useAppStore } from "../../store/appStore";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const formatCurrency = (value) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
};

const assetAllocationData = [
  { name: "Equity", value: 45, color: "#1e3a5f" },
  { name: "Debt", value: 30, color: "#2563eb" },
  { name: "Real Estate", value: 15, color: "#059669" },
  { name: "Gold", value: 5, color: "#d4af37" },
  { name: "Others", value: 5, color: "#94a3b8" },
];

const aumTrendData = [
  { month: "Aug", aum: 180 },
  { month: "Sep", aum: 195 },
  { month: "Oct", aum: 188 },
  { month: "Nov", aum: 210 },
  { month: "Dec", aum: 225 },
  { month: "Jan", aum: 245 },
];

const sipFlowData = [
  { month: "Aug", inflow: 45, outflow: 12 },
  { month: "Sep", inflow: 52, outflow: 15 },
  { month: "Oct", inflow: 48, outflow: 18 },
  { month: "Nov", inflow: 58, outflow: 14 },
  { month: "Dec", inflow: 62, outflow: 16 },
  { month: "Jan", inflow: 68, outflow: 12 },
];

export const Dashboard = () => {
  const { clients, goals, notifications, currentUser } = useAppStore();

  const totalAUM = clients.reduce((sum, c) => sum + c.aum, 0);
  const activeClients = clients.filter((c) => c.status === "Active").length;
  const atRiskGoals = goals.filter(
    (g) => g.status === "At Risk" || g.status === "Off Track",
  ).length;
  const pendingKYC = clients.filter((c) => c.kycStatus !== "Verified").length;

  const stats = [
    {
      label: "Total AUM",
      value: formatCurrency(totalAUM),
      change: "+12.5%",
      trend: "up",
      icon: IndianRupee,
      color: "bg-blue-500 shadow-lg shadow-blue-200",
      bgClass: "bg-gradient-to-br from-blue-50/80 to-white",
      borderClass: "border-blue-100/50",
    },
    {
      label: "Active Clients",
      value: activeClients.toString(),
      change: "+3",
      trend: "up",
      icon: Users,
      color: "bg-emerald-500 shadow-lg shadow-emerald-200",
      bgClass: "bg-gradient-to-br from-emerald-50/80 to-white",
      borderClass: "border-emerald-100/50",
    },
    {
      label: "At Risk Goals",
      value: atRiskGoals.toString(),
      change: "-2",
      trend: "down",
      icon: Target,
      color: "bg-amber-500 shadow-lg shadow-amber-200",
      bgClass: "bg-gradient-to-br from-amber-50/80 to-white",
      borderClass: "border-amber-100/50",
    },
    {
      label: "Pending KYC",
      value: pendingKYC.toString(),
      change: "+1",
      trend: "up",
      icon: AlertTriangle,
      color: "bg-rose-500 shadow-lg shadow-rose-200",
      bgClass: "bg-gradient-to-br from-rose-50/80 to-white",
      borderClass: "border-rose-100/50",
    },
  ];

  const recentActivities = [
    {
      type: "sip",
      client: "Amit Patel",
      action: "SIP processed",
      amount: 75000,
      time: "2 hours ago",
    },
    {
      type: "kyc",
      client: "Neha Gupta",
      action: "KYC submitted",
      time: "4 hours ago",
    },
    {
      type: "goal",
      client: "Sharma HUF",
      action: "Goal review completed",
      time: "1 day ago",
    },
    {
      type: "transaction",
      client: "Vikram Mehta",
      action: "Purchase order placed",
      amount: 500000,
      time: "1 day ago",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a4a73] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {currentUser?.name || "User"}!
            </h1>
            <p className="text-white/80 mt-1">
              Here's what's happening with your portfolio today.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-white/80">
            <Calendar className="w-5 h-5" />
            <span>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className={`hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border ${stat.borderClass} ${stat.bgClass}`}
            >
              <CardContent className="">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {stat.change}
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AUM Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>AUM Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aumTrendData}>
                  <defs>
                    <linearGradient
                      id="aumGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value}Cr`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                    formatter={(value) => [`₹${value} Cr`, "AUM"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="aum"
                    stroke="#1e3a5f"
                    strokeWidth={2}
                    fill="url(#aumGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {assetAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {assetAllocationData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SIP Flow */}
        <Card>
          <CardHeader>
            <CardTitle>SIP Flow (₹ Lakhs)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sipFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="inflow"
                    name="Inflow"
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="outflow"
                    name="Outflow"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentActivities.map((activity, idx) => (
                <div
                  key={idx}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === "sip"
                        ? "bg-emerald-100 text-emerald-600"
                        : activity.type === "kyc"
                          ? "bg-blue-100 text-blue-600"
                          : activity.type === "goal"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {activity.type === "sip" && (
                      <TrendingUp className="w-5 h-5" />
                    )}
                    {activity.type === "kyc" && (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    {activity.type === "goal" && <Target className="w-5 h-5" />}
                    {activity.type === "transaction" && (
                      <IndianRupee className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {activity.client}
                    </p>
                    <p className="text-sm text-slate-500">{activity.action}</p>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className="font-medium text-slate-900">
                        {formatCurrency(activity.amount)}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alerts & Reminders</CardTitle>
            <Badge variant="warning">
              {notifications.filter((n) => !n.read).length} Unread
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {notifications.slice(0, 4).map((notif) => (
              <div
                key={notif.id}
                className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    notif.severity === "error"
                      ? "bg-red-500"
                      : notif.severity === "warning"
                        ? "bg-amber-500"
                        : notif.severity === "success"
                          ? "bg-emerald-500"
                          : "bg-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{notif.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {notif.message}
                  </p>
                </div>
                <Badge
                  variant={
                    notif.severity === "error"
                      ? "error"
                      : notif.severity === "warning"
                        ? "warning"
                        : "info"
                  }
                >
                  {notif.type.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
