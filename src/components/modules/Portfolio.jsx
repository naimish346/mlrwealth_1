import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  Download,
  Plus,
  Building2,
  Landmark,
  Home,
  Coins,
  Wallet,
  RefreshCw,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Edit2,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input, Select } from "../ui/input";
import { Modal } from "../ui/Modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { useAppStore } from "../../store/appStore";
import { toast } from "sonner";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";
import { MutualFunds } from "./portfolio/MutualFunds";
import { ExternalAsset } from "./portfolio/ExternalAsset";
import { SipManagement } from "./portfolio/SipManagement";

const MetricCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
  <Card
    className={cn(
      "border-none shadow-sm overflow-hidden h-20 transition-all hover:shadow-md",
      colorClass,
    )}
  >
    <CardContent className="px-4 py-3 flex items-center justify-between h-full">
      <div>
        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">
            {value}
          </h3>
          {subtitle && (
            <span className="text-[10px] text-slate-400 font-normal">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
        <Icon className="w-5 h-5" />
      </div>
    </CardContent>
  </Card>
);

const formatCurrency = (value) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
};

export const Portfolio = () => {
  const location = useLocation();
  const isDashboardView =
    location.pathname.includes("/dashboard") ||
    location.pathname === "/portfolio" ||
    location.pathname === "/portfolio/";
  const isMutualFundsView = location.pathname.includes("/mutual-funds");
  const isExternalAssetsView = location.pathname.includes("/external-assets");
  const isSipManagementView = location.pathname.includes("/sip-management");

  const { clients, holdings, externalAssets, updateHolding } = useAppStore();

  const [selectedClientId, setSelectedClientId] = useState("all");
  const [showStatementDemo, setShowStatementDemo] = useState(false);
  const [navChartId, setNavChartId] = useState("all");
  const [allocationView, setAllocationView] = useState("mf");

  const baseHoldings =
    selectedClientId === "all"
      ? holdings
      : holdings.filter((h) => h.clientId === selectedClientId);
  const baseExternalAssets =
    selectedClientId === "all"
      ? externalAssets
      : externalAssets.filter((a) => a.clientId === selectedClientId);
  const selectedClient =
    selectedClientId === "all"
      ? { name: "All Clients", entityType: "Firm-wide", city: "Aggregated" }
      : clients.find((c) => c.id === selectedClientId);

  // For backward compatibility in metrics calculation
  const clientHoldings = baseHoldings;
  const clientExternalAssets = baseExternalAssets;

  const totalMFInvested = clientHoldings.reduce(
    (sum, h) => sum + h.investedValue,
    0,
  );
  const totalMFCurrent = clientHoldings.reduce(
    (sum, h) => sum + h.currentValue,
    0,
  );
  const totalMFGain = totalMFCurrent - totalMFInvested;
  const totalMFGainPercent =
    totalMFInvested > 0 ? (totalMFGain / totalMFInvested) * 100 : 0;

  const totalExtCurrent = clientExternalAssets.reduce(
    (sum, a) => sum + a.currentValue,
    0,
  );
  const totalNetWorth = totalMFCurrent + totalExtCurrent;

  const handleSyncNAV = () => {
    let updatedCount = 0;
    clientHoldings.forEach((holding) => {
      const changePercent = (Math.random() * 4 - 2) / 100;
      const newNav = holding.currentNav * (1 + changePercent);
      const newValue = holding.units * newNav;
      const newGain = newValue - holding.investedValue;
      const newGainPercent =
        holding.investedValue > 0 ? (newGain / holding.investedValue) * 100 : 0;

      updateHolding(holding.id, {
        currentNav: newNav,
        currentValue: newValue,
        absoluteGain: newGain,
        absoluteGainPercent: newGainPercent,
      });
      updatedCount++;
    });

    if (updatedCount > 0) {
      toast.success(`Synced NAV for ${updatedCount} mutual funds`);
    } else {
      toast.info("No mutual funds to sync");
    }
  };

  const navHistory = useMemo(() => {
    let targetCurrentValue = 0;
    if (navChartId === "all") {
      targetCurrentValue = totalMFCurrent;
    } else {
      const holding = clientHoldings.find((h) => h.id === navChartId);
      if (holding) {
        targetCurrentValue = holding.currentValue;
      }
    }

    if (targetCurrentValue === 0) return [];

    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const history = [];
    let currentVal = targetCurrentValue * (1 - Math.random() * 0.15);

    for (let i = 0; i < 6; i++) {
      history.push({
        date: months[i],
        nav: i === 5 ? Math.round(targetCurrentValue) : Math.round(currentVal),
      });
      currentVal = currentVal * (1 + (Math.random() * 0.1 - 0.02));
    }
    return history;
  }, [navChartId, totalMFCurrent, clientHoldings]);

  // Overall asset allocation grouped by category/type
  const overallAllocation = useMemo(() => {
    const allocationMap = new Map();

    if (allocationView === "mf") {
      clientHoldings.forEach((h) => {
        const cat = h.category || "Other";
        allocationMap.set(cat, (allocationMap.get(cat) || 0) + h.currentValue);
      });
    } else {
      clientExternalAssets.forEach((a) => {
        const type = a.type || "Other";
        allocationMap.set(
          type,
          (allocationMap.get(type) || 0) + a.currentValue,
        );
      });
    }

    const colors = [
      "#1e3a5f",
      "#2563eb",
      "#059669",
      "#d4af37",
      "#8b5cf6",
      "#ec4899",
      "#f59e0b",
      "#6366f1",
    ];

    return Array.from(allocationMap.entries())
      .map(([name, value], idx) => ({
        name,
        value,
        color: colors[idx % colors.length],
      }))
      .filter((a) => a.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [clientHoldings, clientExternalAssets, allocationView]);

  const portfolioGrowthData = useMemo(() => {
    const months = [
      "Apr 24",
      "May 24",
      "Jun 24",
      "Jul 24",
      "Aug 24",
      "Sep 24",
      "Oct 24",
      "Nov 24",
      "Dec 24",
      "Jan 25",
      "Feb 25",
      "Mar 25",
      "Apr 25",
      "May 25",
      "Jun 25",
      "Jul 25",
      "Aug 25",
      "Sep 25",
      "Oct 25",
      "Nov 25",
      "Dec 25",
      "Jan 26",
      "Feb 26",
    ];
    const history = [];
    const totalCurrent = totalNetWorth;
    const totalInvested = totalMFInvested + totalExtCurrent * 0.9;

    let currentVal = totalCurrent * 0.5;
    let investedVal = totalInvested * 0.6;

    for (let i = 0; i < months.length; i++) {
      const isLast = i === months.length - 1;
      history.push({
        date: months[i],
        current: isLast ? totalCurrent : Math.round(currentVal),
        invested: isLast ? totalInvested : Math.round(investedVal),
      });

      currentVal = currentVal * (1 + (Math.random() * 0.08 - 0.015));
      investedVal = investedVal * 1.02;
    }
    return history;
  }, [totalNetWorth, totalMFInvested, totalExtCurrent]);

  const amcColors = {
    HDFC: "#2563eb",
    ICICI: "#8b5cf6",
    SBI: "#10b981",
    Axis: "#f59e0b",
    Kotak: "#ec4899",
    Others: "#64748b",
  };

  const fundHouseData = useMemo(() => {
    const amcMap = new Map();
    clientHoldings.forEach((h) => {
      const amc = h.amcName?.split(" ")[0] || "Other";
      amcMap.set(amc, (amcMap.get(amc) || 0) + h.currentValue);
    });

    const totalVal = Array.from(amcMap.values()).reduce((a, b) => a + b, 0);

    return Array.from(amcMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalVal > 0 ? (value / totalVal) * 100 : 0,
        fill: amcColors[name] || amcColors["Others"],
      }))
      .sort((a, b) => b.value - a.value);
  }, [clientHoldings]);

  if (isMutualFundsView) {
    return (
      <MutualFunds
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        clientHoldings={clientHoldings}
        clients={clients}
      />
    );
  }

  if (isExternalAssetsView) {
    return (
      <ExternalAsset
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        clientExternalAssets={clientExternalAssets}
        clients={clients}
      />
    );
  }

  if (isSipManagementView) {
    return <SipManagement clients={clients} />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-fade-in">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-200 px-0 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Portfolio & Wealth
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track investments and net worth
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              options={[
                { value: "all", label: "All Clients" },
                ...clients.map((c) => ({ value: c.id, label: c.name })),
              ]}
              className="w-48 bg-slate-50 border-slate-200"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSyncNAV}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Sync NAV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowStatementDemo(true)}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Statement
            </motion.button>
          </div>
        </div>

        {/* Client Summary */}
        {selectedClient && (
          <Card className="bg-[#1e3a5f] text-white overflow-hidden shadow-sm rounded-xl">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                    CLIENT
                  </p>
                  <h2 className="text-xl font-bold">{selectedClient.name}</h2>
                  <p className="text-white/70 text-xs mt-0.5">
                    {selectedClient.entityType} • {selectedClient.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-[10px] font-semibold border-b border-white/10 pb-1 mb-1 uppercase tracking-wider">
                    TOTAL NET WORTH
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalNetWorth)}
                  </p>
                  <p className="text-emerald-300 flex items-center justify-end gap-1 mt-0.5 text-xs font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />+
                    {totalMFGainPercent.toFixed(2)}% Overall
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard View Elements */}
        {isDashboardView && (
          <div className="px-0 py-4 mt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="MF Invested"
                value={formatCurrency(totalMFInvested)}
                icon={Landmark}
                colorClass="bg-blue-50/50 border-blue-100"
              />
              <MetricCard
                title="MF Current"
                value={formatCurrency(totalMFCurrent)}
                icon={TrendingUp}
                colorClass="bg-indigo-50/50 border-indigo-100"
              />
              <MetricCard
                title="Unrealized Gain"
                value={formatCurrency(Math.abs(totalMFGain))}
                icon={totalMFGain >= 0 ? TrendingUp : TrendingDown}
                colorClass={
                  totalMFGain >= 0
                    ? "bg-emerald-50/50 border-emerald-100"
                    : "bg-rose-50/50 border-rose-100"
                }
                subtitle={totalMFGain >= 0 ? "Gain" : "Loss"}
              />
              <MetricCard
                title="External Assets"
                value={formatCurrency(totalExtCurrent)}
                icon={Building2}
                colorClass="bg-violet-50/50 border-violet-100"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto px-0 py-6 space-y-6">
        {/* Charts Row */}
        {isDashboardView && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Asset Allocation */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 mb-0">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4" />
                    Allocation
                  </CardTitle>
                  <div className="w-32">
                    <Select
                      value={allocationView}
                      onChange={(e) => setAllocationView(e.target.value)}
                      options={[
                        { value: "mf", label: "Mutual Funds" },
                        { value: "ext", label: "External Assets" },
                      ]}
                      className="h-8 text-xs bg-slate-50 border-slate-200"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={overallAllocation}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {overallAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {overallAllocation.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-slate-600">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio Growth */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 mb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Portfolio Growth
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-0.5 bg-slate-400 border-t border-dashed border-slate-500" />
                      <span className="text-[10px] text-slate-500 font-medium">
                        Invested
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-0.5 bg-emerald-500" />
                      <span className="text-[10px] text-slate-500 font-medium">
                        Current Value
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={portfolioGrowthData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="growthGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.15}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="#94a3b8"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          interval={3}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) =>
                            `₹${(val / 10000000).toFixed(1)} Cr`
                          }
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                                    {label}
                                  </p>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-xs text-slate-500">
                                        Invested:
                                      </span>
                                      <span className="text-xs font-bold text-slate-700">
                                        {formatCurrency(payload[0].value)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-xs text-slate-500">
                                        Current:
                                      </span>
                                      <span className="text-xs font-bold text-emerald-600">
                                        {formatCurrency(payload[1].value)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="invested"
                          stroke="#94a3b8"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          fill="transparent"
                        />
                        <Area
                          type="monotone"
                          dataKey="current"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="url(#growthGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* NAV Trend */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 mb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#1e3a5f]" />
                    NAV Trend
                  </CardTitle>
                  <div className="w-48">
                    <Select
                      value={navChartId}
                      onChange={(e) => setNavChartId(e.target.value)}
                      options={[
                        { value: "all", label: "Top Holding (Aggregate)" },
                        ...clientHoldings.slice(0, 5).map((h) => ({
                          value: h.id,
                          label:
                            h.schemeName.length > 20
                              ? h.schemeName.substring(0, 20) + "..."
                              : h.schemeName,
                        })),
                      ]}
                      className="bg-slate-50 border-slate-200 py-1.5 h-8 text-xs focus:ring-0"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={navHistory}>
                        <defs>
                          <linearGradient
                            id="navGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#1e3a5f"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#1e3a5f"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip
                          formatter={(value) => [
                            `₹${value.toLocaleString("en-IN")}`,
                            "NAV",
                          ]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="nav"
                          stroke="#1e3a5f"
                          strokeWidth={2}
                          fill="url(#navGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Fund House Distribution */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 mb-0">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-[#1e3a5f]" />
                    Fund House Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={fundHouseData}
                        layout="vertical"
                        margin={{ left: 0, right: 30 }}
                        barGap={20}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          type="number"
                          domain={[0, 35]}
                          tickFormatter={(val) => `${val}%`}
                          fontSize={10}
                          stroke="#94a3b8"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={70}
                          fontSize={11}
                          stroke="#64748b"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontWeight: 500 }}
                        />
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${props.payload.percentage.toFixed(1)}% (${formatCurrency(props.payload.value)})`,
                            "Allocation",
                          ]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="percentage"
                          radius={[0, 10, 10, 0]}
                          barSize={18}
                        >
                          {fundHouseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Statement Demo Modal */}
        <Modal
          isOpen={showStatementDemo}
          onClose={() => setShowStatementDemo(false)}
          title="Portfolio Statement (Preview)"
        >
          <div className="space-y-6">
            <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-[#1e3a5f]">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Statement Generated
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                A detailed portfolio statement PDF will be generated with the
                following sections:
              </p>
              <div className="grid gap-2 text-left bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">
                    ✓
                  </span>
                  Client Information & Summary
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">
                    ✓
                  </span>
                  Overall Asset Allocation Pie Chart
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">
                    ✓
                  </span>
                  Detailed Mutual Fund Holdings list
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">
                    ✓
                  </span>
                  External Assets Summary
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">
                    ✓
                  </span>
                  Gain/Loss & XIRR calculations
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setShowStatementDemo(false)}
              >
                Close Preview
              </Button>
              <Button
                className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white flex items-center gap-2"
                onClick={() => {
                  setShowStatementDemo(false);
                  alert("In a real app, this would download the PDF.");
                }}
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
