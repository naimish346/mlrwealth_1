import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Users,
  TrendingUp,
  AlertCircle,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  CheckCircle,
  Calendar,
  PhoneCall,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Mail,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { useAppStore } from "../../../store/appStore";
import { useLeadStore } from "../../../store/useLeadStore";
import { cn } from "../../../utils/cn";

// --- Mock Data ---

const kpiData = [
  {
    title: "Total Active Leads",
    value: "248",
    change: "+12%",
    isPositive: true,
    icon: Users,
    color: "bg-blue-500",
  },
  {
    title: "Follow-ups",
    value: "42",
    change: "+8",
    isPositive: true,
    icon: PhoneCall,
    color: "bg-amber-500",
  },
  {
    title: "Prospect",
    value: "64",
    change: "+5",
    isPositive: true,
    icon: Target,
    color: "bg-indigo-500",
  },
  {
    title: "Won",
    value: "18",
    change: "+3",
    isPositive: true,
    icon: CheckCircle,
    color: "bg-emerald-500",
  },
];

const sourceData = [
  { name: "Web", value: 35, color: "#1e3a5f" },
  { name: "Email", value: 25, color: "#2563eb" },
  { name: "Webform", value: 20, color: "#3b82f6" },
  { name: "Phone", value: 10, color: "#059669" },
  { name: "Direct", value: 10, color: "#d4af37" },
];

const forecastData = [
  { month: "Jan", actual: 3.2, expected: 3.2 },
  { month: "Feb", actual: 4.8, expected: 4.5 },
  { month: "Mar", actual: 6.1, expected: 5.8 },
  { month: "Apr", actual: 8.5, expected: 7.2 },
  { month: "May", actual: null, expected: 9.5 },
  { month: "Jun", actual: null, expected: 12.0 },
  { month: "Jul", actual: null, expected: 15.5 },
];

const rmPerformance = [
  { name: "Priya Sharma", converted: 18, active: 45 },
  { name: "Rajesh Kumar", converted: 14, active: 38 },
  { name: "Sanjay Desai", converted: 10, active: 25 },
];

const reminders = [
  {
    id: 1,
    title: "Prospect Review Meeting",
    lead: "Vikram Singh",
    date: "02-11-2023",
    time: "2:00 PM - 3:00 PM",
    type: "meeting",
    priority: "high",
  },
  {
    id: 2,
    title: "Follow-up Call",
    lead: "Anita Desai",
    date: "03-11-2023",
    time: "10:30 AM",
    type: "call",
    priority: "medium",
  },
  {
    id: 3,
    title: "Send Revised Proposal",
    lead: "Sanjay Mehta",
    date: "03-11-2023",
    time: "4:00 PM",
    type: "task",
    priority: "high",
  },
];

const recentActivities = [
  {
    type: "call",
    lead: "Amit Patel",
    action: "Follow-up call completed",
    time: "2 hours ago",
  },
  {
    type: "email",
    lead: "Neha Gupta",
    action: "Prospect stage reached",
    time: "4 hours ago",
  },
  {
    type: "meeting",
    lead: "Sharma Family",
    action: "In-person meeting scheduled",
    time: "1 day ago",
  },
  {
    type: "conversion",
    lead: "Vikram Mehta",
    action: "Converted to Client",
    value: "₹50 L",
    time: "1 day ago",
  },
];

export const LeadDashboard = ({ onNavigate }) => {
  const { leads, reminders } = useLeadStore();
  const { currentUser } = useAppStore();

  // Dynamic KPI Calculation (Restored all original 7 metrics)
  const stats = [
    {
      title: "Total Active Leads",
      value: leads.length.toString(),
      change: "+12%",
      isPositive: true,
      icon: Users,
      color: "bg-blue-500 shadow-lg shadow-blue-200",
      bgClass: "bg-gradient-to-br from-blue-50/80 to-white",
      borderClass: "border-blue-100/50",
    },
    {
      title: "Follow-ups",
      value: leads.filter((l) => l.stage === "Follow-up").length.toString(),
      change: "+2",
      isPositive: true,
      icon: PhoneCall,
      color: "bg-amber-500 shadow-lg shadow-amber-200",
      bgClass: "bg-gradient-to-br from-amber-50/80 to-white",
      borderClass: "border-amber-100/50",
    },
    {
      title: "Prospect",
      value: leads.filter((l) => l.stage === "Prospect").length.toString(),
      change: "+5",
      isPositive: true,
      icon: Target,
      color: "bg-indigo-500 shadow-lg shadow-indigo-200",
      bgClass: "bg-gradient-to-br from-indigo-50/80 to-white",
      borderClass: "border-indigo-100/50",
    },
    {
      title: "Won",
      value: leads
        .filter((l) => l.stage === "Closed" || l.stage === "Won")
        .length.toString(),
      change: "+3",
      isPositive: true,
      icon: CheckCircle,
      color: "bg-emerald-500 shadow-lg shadow-emerald-200",
      bgClass: "bg-gradient-to-br from-emerald-50/80 to-white",
      borderClass: "border-emerald-100/50",
    },
  ];

  // Source Stats (Updated for new types)
  const sourceCount = leads.reduce((acc, lead) => {
    const s = lead.source || "other";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const sourceData = [
    { name: "Web", value: sourceCount["web"] || 0, color: "#4f46e5" },
    { name: "Email", value: sourceCount["email"] || 0, color: "#06b6d4" },
    { name: "Web Form", value: sourceCount["web form"] || 0, color: "#8b5cf6" },
    { name: "Phone", value: sourceCount["phone"] || 0, color: "#f59e0b" },
    { name: "Direct", value: sourceCount["direct"] || 0, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  if (sourceData.length === 0) {
    sourceData.push({ name: "No Leads", value: 1, color: "#d1d5db" }); // Default for no leads
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8 pt-4">
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Value Forecasting */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pipeline Value Forecasting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Total Pipeline Value
                </p>
                <p className="text-lg font-bold text-slate-800">₹42.5 Cr</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <p className="text-xs font-medium text-emerald-700 mb-1">
                  Expected Win (30d)
                </p>
                <p className="text-lg font-bold text-emerald-600">₹8.2 Cr</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <p className="text-xs font-medium text-blue-700 mb-1">
                  Avg Deal Size
                </p>
                <p className="text-lg font-bold text-blue-600">₹45 L</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <p className="text-xs font-medium text-amber-700 mb-1">
                  Avg Time to Close
                </p>
                <p className="text-lg font-bold text-amber-600">42 Days</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={forecastData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}Cr`}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${value} Cr`, "Value"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expected"
                    name="Expected Pipeline (Cr)"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Actual Closing (Cr)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lead Sources (Replacing Asset Allocation) */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, ""]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {sourceData.map((item) => (
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
        {/* RM Leaderboard (Replacing SIP Flow) */}
        <Card>
          <CardHeader>
            <CardTitle>RM Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rmPerformance}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  />
                  <Bar
                    dataKey="active"
                    name="Active Leads"
                    stackId="a"
                    fill="#94a3b8"
                    radius={[0, 0, 0, 0]}
                    barSize={24}
                  />
                  <Bar
                    dataKey="converted"
                    name="Converted"
                    stackId="a"
                    fill="#1e3a5f"
                    radius={[0, 4, 4, 0]}
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
                      activity.type === "call"
                        ? "bg-blue-100 text-blue-600"
                        : activity.type === "email"
                          ? "bg-amber-100 text-amber-600"
                          : activity.type === "meeting"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {activity.type === "call" && (
                      <PhoneCall className="w-5 h-5" />
                    )}
                    {activity.type === "email" && <Users className="w-5 h-5" />}
                    {activity.type === "meeting" && (
                      <Calendar className="w-5 h-5" />
                    )}
                    {activity.type === "conversion" && (
                      <Target className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {activity.lead}
                    </p>
                    <p className="text-sm text-slate-500">{activity.action}</p>
                  </div>
                  <div className="text-right">
                    {activity.value && (
                      <p className="font-medium text-slate-900">
                        {activity.value}
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

      {/* Reminders section replacing Attention Required */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming Reminders</CardTitle>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-100"
            >
              {reminders.length} Upcoming
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reminders.slice(0, 4).map((reminder) => (
              <div
                key={reminder.id}
                className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50 transition-all cursor-pointer"
              >
                <div className="bg-indigo-50 text-indigo-700 rounded-lg p-2 text-center min-w-[50px] flex flex-col justify-center border border-indigo-100 h-fit">
                  <span className="text-lg font-black">
                    {reminder.date.split("-")[0]}
                  </span>
                  <span className="text-[10px] font-bold border-t border-indigo-200 pt-1 mt-1">
                    {reminder.date.split("-")[1]}-{reminder.date.split("-")[2]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-800 text-sm truncate">
                      {reminder.title}
                    </h4>
                    <Badge
                      variant={
                        reminder.priority === "high" ? "warning" : "outline"
                      }
                      className="text-[10px] py-0 h-4"
                    >
                      {reminder.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {reminder.lead}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {reminder.time}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-indigo-600 text-xs py-0"
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {reminders.length === 0 && (
              <div className="text-center py-10">
                <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500">
                  No scheduled tasks for today
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
