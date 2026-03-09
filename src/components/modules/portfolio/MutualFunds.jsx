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
  ArrowUpDown,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input, Select } from "../../ui/input";
import { Modal } from "../../ui/Modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import { useAppStore } from "../../../store/appStore";
import { toast } from "sonner";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { cn } from "../../../utils/cn";
import { motion } from "framer-motion";

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

export const MutualFunds = ({
  selectedClientId,
  setSelectedClientId,
  clientHoldings,
  clients,
}) => {
  const {
    addHolding,
    updateHolding,
    deleteHolding,
    addExternalAsset,
    updateExternalAsset,
    deleteExternalAsset,
    goals,
  } = useAppStore();

  const [showAddMF, setShowAddMF] = useState(false);

  // New States for Enhancements
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "currentValue",
    direction: "desc",
  });
  const [mfPage, setMfPage] = useState(1);
  const [extPage, setExtPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [navChartId, setNavChartId] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [mfForm, setMfForm] = useState({
    clientId: selectedClientId !== "all" ? selectedClientId : "",
    goalId: "",
    schemeName: "",
    amcName: "",
    folioNumber: "",
    category: "Equity",
    units: "",
    avgCostNav: "",
    investedValue: "",
  });
  const [mfErrors, setMfErrors] = useState({});

  const validateMfForm = () => {
    const errors = {};
    if (!mfForm.clientId) errors.clientId = "Client Required";
    if (!mfForm.schemeName) errors.schemeName = "Required";
    if (!mfForm.units || mfForm.units <= 0) errors.units = "Invalid units";
    if (!mfForm.avgCostNav || mfForm.avgCostNav <= 0)
      errors.avgCostNav = "Invalid amount";
    if (!mfForm.investedValue || mfForm.investedValue <= 0)
      errors.investedValue = "Invalid amount";
    setMfErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Removed validateExtForm

  const [editingMfId, setEditingMfId] = useState(null);

  const handleEditMF = (holding) => {
    setEditingMfId(holding.id);
    setMfForm({
      clientId: holding.clientId || "",
      goalId: holding.goalId || "",
      schemeName: holding.schemeName,
      amcName: holding.amcName,
      folioNumber: holding.folioNumber,
      category: holding.category,
      units: holding.units.toString(),
      avgCostNav: holding.avgCostNav.toString(),
      investedValue: holding.investedValue.toString(),
    });
    setShowAddMF(true);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Filtering
  const filteredMFs = clientHoldings.filter(
    (h) =>
      (h.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.amcName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === "all" || h.category === categoryFilter),
  );

  // Sorting
  const sortedMFs = [...filteredMFs].sort((a, b) => {
    if (a[sortConfig.key] === undefined) return 0;
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  // Pagination
  const totalMFPages = Math.max(
    1,
    Math.ceil(sortedMFs.length / ITEMS_PER_PAGE),
  );
  const paginatedMFs = sortedMFs.slice(
    (Math.min(mfPage, totalMFPages) - 1) * ITEMS_PER_PAGE,
    Math.min(mfPage, totalMFPages) * ITEMS_PER_PAGE,
  );

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent +=
      "Scheme,Folio,Category,Units,Avg Cost,Current NAV,Invested,Current,Gain,XIRR\n";
    sortedMFs.forEach((h) => {
      csvContent += `"${h.schemeName}","${h.folioNumber}","${h.category}",${h.units},${h.avgCostNav},${h.currentNav},${h.investedValue},${h.currentValue},${h.absoluteGain},${h.xirr}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `mutual_funds_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported successfully!");
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case "Real Estate":
        return <Home className="w-5 h-5" />;
      case "FD":
        return <Landmark className="w-5 h-5" />;
      case "Equity":
        return <TrendingUp className="w-5 h-5" />;
      case "Gold":
        return <Coins className="w-5 h-5" />;
      case "Insurance":
        return <Building2 className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const mfTotalInvested = clientHoldings.reduce(
    (sum, h) => sum + h.investedValue,
    0,
  );
  const mfTotalCurrent = clientHoldings.reduce(
    (sum, h) => sum + h.currentValue,
    0,
  );
  const mfTotalGain = mfTotalCurrent - mfTotalInvested;
  const mfTotalGainPercent =
    mfTotalInvested > 0 ? (mfTotalGain / mfTotalInvested) * 100 : 0;
  const mfAvgXirr =
    clientHoldings.length > 0
      ? clientHoldings.reduce((sum, h) => sum + (h.xirr || 0), 0) /
        clientHoldings.length
      : 0;
  const mfActiveFunds = clientHoldings.length;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-fade-in pb-10">
      {/* Header Area */}
      <div className="bg-white px-0 pt-6 pb-0 mb-0">
        <div className="flex items-center justify-between mb-6 px-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mutual Funds</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track mutual fund investments for your clients
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Removed the 'mf' vs 'external' tab toggle */}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 15px -3px rgba(30, 58, 95, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingMfId(null);
                setMfForm({
                  clientId: selectedClientId !== "all" ? selectedClientId : "",
                  goalId: "",
                  schemeName: "",
                  amcName: "",
                  folioNumber: "",
                  category: "Equity",
                  units: "",
                  avgCostNav: "",
                  investedValue: "",
                });
                setShowAddMF(true);
              }}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Add Mutual Fund
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto pt-4 space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 px-0 shrink-0">
          <MetricCard
            title="Total Invested"
            value={formatCurrency(mfTotalInvested)}
            icon={Wallet}
            colorClass="bg-blue-50/50"
          />
          <MetricCard
            title="Current Value"
            value={formatCurrency(mfTotalCurrent)}
            icon={Coins}
            colorClass="bg-indigo-50/50"
          />
          <MetricCard
            title="Absolute Gain"
            value={`${mfTotalGain >= 0 ? "+" : ""}${formatCurrency(mfTotalGain)}`}
            icon={mfTotalGain >= 0 ? TrendingUp : TrendingDown}
            colorClass={mfTotalGain >= 0 ? "bg-emerald-50/50" : "bg-red-50/50"}
            subtitle={`${mfTotalGainPercent.toFixed(2)}%`}
          />
          <MetricCard
            title="Avg XIRR"
            value={`${mfAvgXirr.toFixed(2)}%`}
            icon={Activity}
            colorClass="bg-purple-50/50"
          />
        </div>

        {/* Filters Card */}
        <div className="shrink-0 px-0">
          <div className="flex items-center gap-3 w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <Input
              icon={<Search className="w-5 h-5" />}
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <div className="w-48 shrink-0">
              <Select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                options={[
                  { value: "all", label: "All Clients" },
                  ...clients.map((c) => ({ value: c.id, label: c.name })),
                ]}
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="w-48 shrink-0">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Categories" },
                  { value: "Equity", label: "Equity" },
                  { value: "Debt", label: "Debt" },
                  { value: "Hybrid", label: "Hybrid" },
                  { value: "Index", label: "Index Fund" },
                ]}
                className="bg-slate-50 border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    <button
                      onClick={() => handleSort("schemeName")}
                      className="flex items-center hover:text-indigo-600 transition-colors whitespace-nowrap"
                    >
                      Scheme
                      <ArrowUpDown
                        className={cn(
                          "inline w-3 h-3 ml-1 transition-opacity",
                          sortConfig.key === "schemeName"
                            ? "opacity-100"
                            : "opacity-30",
                        )}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    Folio
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    Category
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    <button
                      onClick={() => handleSort("units")}
                      className="flex items-center hover:text-indigo-600 transition-colors whitespace-nowrap"
                    >
                      Units
                      <ArrowUpDown
                        className={cn(
                          "inline w-3 h-3 ml-1 transition-opacity",
                          sortConfig.key === "units"
                            ? "opacity-100"
                            : "opacity-30",
                        )}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    Avg Cost
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    <button
                      onClick={() => handleSort("currentNav")}
                      className="flex items-center hover:text-indigo-600 transition-colors whitespace-nowrap"
                    >
                      Current NAV
                      <ArrowUpDown
                        className={cn(
                          "inline w-3 h-3 ml-1 transition-opacity",
                          sortConfig.key === "currentNav"
                            ? "opacity-100"
                            : "opacity-30",
                        )}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    <button
                      onClick={() => handleSort("investedValue")}
                      className="flex items-center hover:text-indigo-600 transition-colors whitespace-nowrap"
                    >
                      Invested
                      <ArrowUpDown
                        className={cn(
                          "inline w-3 h-3 ml-1 transition-opacity",
                          sortConfig.key === "investedValue"
                            ? "opacity-100"
                            : "opacity-30",
                        )}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    <button
                      onClick={() => handleSort("currentValue")}
                      className="flex items-center hover:text-indigo-600 transition-colors whitespace-nowrap"
                    >
                      Current
                      <ArrowUpDown
                        className={cn(
                          "inline w-3 h-3 ml-1 transition-opacity",
                          sortConfig.key === "currentValue"
                            ? "opacity-100"
                            : "opacity-30",
                        )}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    <button
                      onClick={() => handleSort("absoluteGain")}
                      className="flex items-center hover:text-indigo-600 transition-colors whitespace-nowrap"
                    >
                      Gain
                      <ArrowUpDown
                        className={cn(
                          "inline w-3 h-3 ml-1 transition-opacity",
                          sortConfig.key === "absoluteGain"
                            ? "opacity-100"
                            : "opacity-30",
                        )}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    <button
                      onClick={() => handleSort("xirr")}
                      className="flex items-center hover:text-indigo-600 transition-colors whitespace-nowrap"
                    >
                      XIRR
                      <ArrowUpDown
                        className={cn(
                          "inline w-3 h-3 ml-1 transition-opacity",
                          sortConfig.key === "xirr"
                            ? "opacity-100"
                            : "opacity-30",
                        )}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMFs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <AlertCircle className="w-8 h-8 mb-2 text-slate-400" />
                        <p className="text-sm font-medium text-slate-900">
                          No mutual funds found
                        </p>
                        <p className="text-xs">
                          Adjust your search or add a new asset.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMFs.map((holding) => (
                    <TableRow key={holding.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900 text-wrap">
                            {holding.schemeName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {holding.amcName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {holding.folioNumber}
                      </TableCell>
                      <TableCell>
                        <Badge variant="info">{holding.category}</Badge>
                      </TableCell>
                      <TableCell>{holding.units.toFixed(3)}</TableCell>
                      <TableCell className="pl-5">
                        ₹{holding.avgCostNav.toFixed(2)}
                      </TableCell>
                      <TableCell className="pl-6">
                        ₹{holding.currentNav.toFixed(2)}
                      </TableCell>
                      <TableCell className="pl-4">
                        {formatCurrency(holding.investedValue)}
                      </TableCell>
                      <TableCell className="font-medium pl-5">
                        {formatCurrency(holding.currentValue)}
                      </TableCell>
                      <TableCell>
                        <div
                          className={
                            holding.absoluteGain >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }
                        >
                          <p>
                            {formatCurrency(Math.abs(holding.absoluteGain))}
                          </p>
                          <p className="text-xs">
                            ({holding.absoluteGainPercent.toFixed(2)}%)
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            holding.xirr >= 12
                              ? "success"
                              : holding.xirr >= 8
                                ? "warning"
                                : "error"
                          }
                        >
                          {holding.xirr.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditMF(holding)}
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-amber-600 hover:text-amber-700 hover:bg-amber-50" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => deleteHolding(holding.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalMFPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-medium">
                  {Math.min(
                    sortedMFs.length,
                    (mfPage - 1) * ITEMS_PER_PAGE + 1,
                  )}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(mfPage * ITEMS_PER_PAGE, sortedMFs.length)}
                </span>{" "}
                of <span className="font-medium">{sortedMFs.length}</span>{" "}
                results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMfPage((p) => Math.max(1, p - 1))}
                  disabled={mfPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-sm font-medium px-3 py-1 bg-white border border-slate-200 rounded">
                  {mfPage} / {totalMFPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMfPage((p) => Math.min(totalMFPages, p + 1))
                  }
                  disabled={mfPage === totalMFPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Add Mutual Fund Modal */}
        <Modal
          isOpen={showAddMF}
          onClose={() => setShowAddMF(false)}
          title="Add Mutual Fund"
          preventAutoFocus={true}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  label="Client"
                  value={mfForm.clientId}
                  onChange={(e) =>
                    setMfForm({
                      ...mfForm,
                      clientId: e.target.value,
                      goalId: "",
                    })
                  }
                  options={[
                    { value: "", label: "Select Client" },
                    ...clients.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                  aria-invalid={!!mfErrors.clientId}
                />
                {mfErrors.clientId && (
                  <p className="text-xs text-red-500 mt-1">
                    {mfErrors.clientId}
                  </p>
                )}
              </div>
              <div>
                <Select
                  label="Associated Goal (Optional)"
                  value={mfForm.goalId}
                  onChange={(e) =>
                    setMfForm({ ...mfForm, goalId: e.target.value })
                  }
                  options={[
                    { value: "", label: "None" },
                    ...goals
                      .filter((g) => g.clientId === mfForm.clientId)
                      .map((g) => ({ value: g.id, label: g.name })),
                  ]}
                  disabled={!mfForm.clientId}
                />
              </div>
            </div>
            <div>
              <Input
                label="Scheme Name"
                placeholder="e.g., Parag Parikh Flexi Cap Fund"
                value={mfForm.schemeName}
                onChange={(e) =>
                  setMfForm({ ...mfForm, schemeName: e.target.value })
                }
                aria-invalid={!!mfErrors.schemeName}
              />
              {mfErrors.schemeName && (
                <p className="text-xs text-red-500 mt-1">
                  {mfErrors.schemeName}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="AMC Name"
                placeholder="e.g., PPFAS"
                value={mfForm.amcName}
                onChange={(e) =>
                  setMfForm({ ...mfForm, amcName: e.target.value })
                }
              />
              <Input
                label="Folio Number"
                placeholder="1234567890"
                value={mfForm.folioNumber}
                onChange={(e) =>
                  setMfForm({ ...mfForm, folioNumber: e.target.value })
                }
              />
            </div>
            <Select
              label="Category"
              value={mfForm.category}
              onChange={(e) =>
                setMfForm({ ...mfForm, category: e.target.value })
              }
              options={[
                { value: "Equity", label: "Equity" },
                { value: "Debt", label: "Debt" },
                { value: "Hybrid", label: "Hybrid" },
                { value: "Index", label: "Index Fund" },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Units"
                  type="number"
                  placeholder="100.5"
                  value={mfForm.units}
                  onChange={(e) =>
                    setMfForm({ ...mfForm, units: e.target.value })
                  }
                  aria-invalid={!!mfErrors.units}
                />
                {mfErrors.units && (
                  <p className="text-xs text-red-500 mt-1">{mfErrors.units}</p>
                )}
              </div>
              <div>
                <Input
                  label="Average Cost NAV"
                  type="number"
                  placeholder="50.2"
                  value={mfForm.avgCostNav}
                  onChange={(e) =>
                    setMfForm({ ...mfForm, avgCostNav: e.target.value })
                  }
                  aria-invalid={!!mfErrors.avgCostNav}
                />
                {mfErrors.avgCostNav && (
                  <p className="text-xs text-red-500 mt-1">
                    {mfErrors.avgCostNav}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Input
                label="Invested Value (₹)"
                type="number"
                placeholder="5045.1"
                value={mfForm.investedValue}
                onChange={(e) =>
                  setMfForm({ ...mfForm, investedValue: e.target.value })
                }
                aria-invalid={!!mfErrors.investedValue}
              />
              {mfErrors.investedValue && (
                <p className="text-xs text-red-500 mt-1">
                  {mfErrors.investedValue}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddMF(false);
                  setEditingMfId(null);
                  setMfForm({
                    clientId:
                      selectedClientId !== "all" ? selectedClientId : "",
                    goalId: "",
                    schemeName: "",
                    amcName: "",
                    folioNumber: "",
                    category: "Equity",
                    units: "",
                    avgCostNav: "",
                    investedValue: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"
                onClick={() => {
                  if (validateMfForm()) {
                    const units = parseFloat(mfForm.units);
                    const avgCostNav = parseFloat(mfForm.avgCostNav);
                    const investedValue = parseFloat(mfForm.investedValue);
                    const currentNav = avgCostNav * 1.05;
                    const currentValue = units * currentNav;
                    const gain = currentValue - investedValue;

                    const payload = {
                      clientId: mfForm.clientId,
                      goalId: mfForm.goalId,
                      schemeName: mfForm.schemeName,
                      amcName: mfForm.amcName,
                      folioNumber: mfForm.folioNumber,
                      category: mfForm.category,
                      units,
                      avgCostNav,
                      investedValue,
                    };

                    if (editingMfId) {
                      updateHolding(editingMfId, payload);
                    } else {
                      addHolding({
                        id: `hldg_${Date.now()}`,
                        ...payload,
                      });
                    }
                    setMfForm({
                      clientId:
                        selectedClientId !== "all" ? selectedClientId : "",
                      goalId: "",
                      schemeName: "",
                      amcName: "",
                      folioNumber: "",
                      category: "Equity",
                      units: "",
                      avgCostNav: "",
                      investedValue: "",
                    });
                    setEditingMfId(null);
                    setShowAddMF(false);
                  }
                }}
              >
                {editingMfId ? "Update Mutual Fund" : "Add Mutual Fund"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
