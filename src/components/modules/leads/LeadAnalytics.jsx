import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import { Select } from "../../ui/input";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Users, TrendingUp, Calendar, Map } from "lucide-react";

const funnelDropoff = [
  { stage: "New", retained: 100, dropped: 0 },
  { stage: "Follow-up", retained: 65, dropped: 35 },
  { stage: "Prospect", retained: 40, dropped: 25 },
  { stage: "Negotiation", retained: 20, dropped: 20 },
  { stage: "Converted", retained: 12, dropped: 8 },
];

const rmPerformance = [
  { name: "Priya Sharma", converted: 18, active: 45 },
  { name: "Rajesh Kumar", converted: 14, active: 38 },
  { name: "Sanjay Desai", converted: 10, active: 25 },
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

export const LeadAnalytics = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Lead Analytics & Reports
          </h2>
          <p className="text-sm text-slate-500">
            In-depth insights into pipeline performance
          </p>
        </div>
        <div className="w-48">
          <Select
            defaultValue="30days"
            options={[
              { value: "7days", label: "Last 7 Days" },
              { value: "30days", label: "Last 30 Days" },
              { value: "90days", label: "Last Quarter" },
              { value: "ytd", label: "Year to Date" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Drop-off Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Funnel Drop-off Analysis</CardTitle>
            <CardDescription>
              Where leads are falling out of the pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={funnelDropoff}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRetained"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorDropped"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="stage"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="retained"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorRetained)"
                  />
                  <Area
                    type="monotone"
                    dataKey="dropped"
                    stroke="#f43f5e"
                    fillOpacity={1}
                    fill="url(#colorDropped)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center mt-4 text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-500"></span> Retained
                (%)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-rose-500"></span> Dropped
                (%)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RM Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">RM Leaderboard</CardTitle>
            <CardDescription>
              Performance by Relationship Manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rmPerformance}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#334155", fontSize: 13, fontWeight: 500 }}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar
                    dataKey="converted"
                    stackId="a"
                    fill="#10b981"
                    radius={[0, 0, 0, 0]}
                    name="Converted"
                    barSize={24}
                  />
                  <Bar
                    dataKey="active"
                    stackId="a"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    name="Active Pipeline"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Value Forecasting */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Pipeline Value Forecasting
            </CardTitle>
            <CardDescription>
              Expected AUM additions based on historical win rates and current
              pipeline stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Total Pipeline Value
                </p>
                <p className="text-2xl font-bold text-slate-800">₹42.5 Cr</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <p className="text-sm font-medium text-emerald-700 mb-1">
                  Expected Win Value (30 days)
                </p>
                <p className="text-2xl font-bold text-emerald-600">₹8.2 Cr</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm font-medium text-blue-700 mb-1">
                  Avg Deal Size
                </p>
                <p className="text-2xl font-bold text-blue-600">₹45 L</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <p className="text-sm font-medium text-amber-700 mb-1">
                  Avg Time to Close
                </p>
                <p className="text-2xl font-bold text-amber-600">42 Days</p>
              </div>
            </div>

            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={forecastData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
                    tickFormatter={(value) => `₹${value} Cr`}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${value} Cr`, "Value"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
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
      </div>
    </div>
  );
};
