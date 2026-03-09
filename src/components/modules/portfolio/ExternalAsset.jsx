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
  Calendar,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { Input, Select } from "../../ui/Input";
import { Modal } from "../../ui/Modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/Table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

const StatusBadge = ({ status }) => {
  const styles = {
    Active: "bg-blue-100 text-blue-700 border-blue-200",
    Closed: "bg-rose-100 text-rose-700 border-rose-200",
    Matured: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const dots = {
    Active: "bg-blue-500",
    Closed: "bg-rose-500",
    Matured: "bg-emerald-500",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          dots[status] || "bg-slate-400",
        )}
      />
      <span
        className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize whitespace-nowrap",
          styles[status] || "bg-slate-100 text-slate-700 border-slate-200",
        )}
      >
        {status || "Active"}
      </span>
    </div>
  );
};

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

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isValid(date) ? format(date, "dd-MM-yyyy") : dateString;
};

export const ExternalAsset = ({
  selectedClientId,
  setSelectedClientId,
  clientExternalAssets,
  clients,
}) => {
  const { addExternalAsset, updateExternalAsset, deleteExternalAsset, goals } =
    useAppStore();

  const [showAddAsset, setShowAddAsset] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [extPage, setExtPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "currentValue",
    direction: "desc",
  });
  const ITEMS_PER_PAGE = 5;
  const [typeFilter, setTypeFilter] = useState("all");

  const [extForm, setExtForm] = useState({
    clientId: selectedClientId !== "all" ? selectedClientId : "",
    goalId: "",
    type: "Equity",
    name: "",
    description: "",
    investedValue: "",
    currentValue: "",
    asOfDate: "",
    status: "Active",
  });
  const [extErrors, setExtErrors] = useState({});

  const validateExtForm = () => {
    const errors = {};
    if (!extForm.clientId) errors.clientId = "Client Required";
    if (!extForm.name) errors.name = "Required";
    if (!extForm.investedValue || extForm.investedValue <= 0)
      errors.investedValue = "Invalid amount";
    if (!extForm.currentValue || extForm.currentValue < 0)
      errors.currentValue = "Invalid amount";
    if (!extForm.asOfDate) errors.asOfDate = "Date required";
    setExtErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [editingExtId, setEditingExtId] = useState(null);

  const handleEditExt = (asset) => {
    setEditingExtId(asset.id);
    setExtForm({
      clientId: asset.clientId || "",
      goalId: asset.goalId || "",
      type: asset.type,
      name: asset.name,
      description: asset.description || "",
      investedValue: asset.investedValue.toString(),
      currentValue: asset.currentValue.toString(),
      asOfDate: asset.asOfDate || "",
      status: asset.status || "Active",
    });
    setShowAddAsset(true);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Filtering
  const filteredExts = clientExternalAssets.filter(
    (a) =>
      (a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (typeFilter === "all" || a.type === typeFilter),
  );

  // Sorting
  const sortedExts = [...filteredExts].sort((a, b) => {
    if (a[sortConfig.key] === undefined) return 0;
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalExtPages = Math.max(
    1,
    Math.ceil(sortedExts.length / ITEMS_PER_PAGE),
  );
  const paginatedExts = sortedExts.slice(
    (Math.min(extPage, totalExtPages) - 1) * ITEMS_PER_PAGE,
    Math.min(extPage, totalExtPages) * ITEMS_PER_PAGE,
  );

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent +=
      "Asset Name,Type,Description,As of Date,Invested,Current,Gain,Status\n";
    sortedExts.forEach((a) => {
      const gain = a.currentValue - a.investedValue;
      csvContent += `"${a.name}","${a.type}","${a.description || ""}",${formatDate(a.asOfDate)},${a.investedValue},${a.currentValue},${gain},"${a.status || "Active"}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `external_assets_${new Date().toISOString().split("T")[0]}.csv`,
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

  const extTotalInvested = clientExternalAssets.reduce(
    (sum, a) => sum + a.investedValue,
    0,
  );
  const extTotalCurrent = clientExternalAssets.reduce(
    (sum, a) => sum + a.currentValue,
    0,
  );
  const extTotalGain = extTotalCurrent - extTotalInvested;
  const extTotalGainPercent =
    extTotalInvested > 0 ? (extTotalGain / extTotalInvested) * 100 : 0;
  const extActiveAssets = clientExternalAssets.length;
  const extUniqueCategories = new Set(clientExternalAssets.map((a) => a.type))
    .size;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-fade-in pb-10">
      {/* Header Area */}
      <div className="bg-white px-0 pt-6 pb-0 mb-0">
        <div className="flex items-center justify-between mb-6 px-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              External Assets
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track external asset investments for your clients
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
                setEditingExtId(null);
                setExtForm({
                  clientId: selectedClientId !== "all" ? selectedClientId : "",
                  goalId: "",
                  type: "Equity",
                  name: "",
                  description: "",
                  investedValue: "",
                  currentValue: "",
                  asOfDate: new Date().toISOString().split("T")[0],
                });
                setShowAddAsset(true);
              }}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Add External Asset
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto pt-4 space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 px-0 shrink-0">
          <MetricCard
            title="Total Invested"
            value={formatCurrency(extTotalInvested)}
            icon={Wallet}
            colorClass="bg-blue-50/50"
          />
          <MetricCard
            title="Current Value"
            value={formatCurrency(extTotalCurrent)}
            icon={Coins}
            colorClass="bg-indigo-50/50"
          />
          <MetricCard
            title="Absolute Gain"
            value={`${extTotalGain >= 0 ? "+" : ""}${formatCurrency(extTotalGain)}`}
            icon={extTotalGain >= 0 ? TrendingUp : TrendingDown}
            colorClass={extTotalGain >= 0 ? "bg-emerald-50/50" : "bg-red-50/50"}
            subtitle={`${extTotalGainPercent.toFixed(2)}%`}
          />
          <MetricCard
            title="Active Assets"
            value={extActiveAssets}
            icon={PieChartIcon}
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
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Types" },
                  { value: "Equity", label: "Equity" },
                  { value: "Real Estate", label: "Real Estate" },
                  { value: "Gold", label: "Gold" },
                  { value: "FD", label: "FD" },
                  { value: "Insurance", label: "Insurance" },
                ]}
                className="bg-slate-50 border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* External Assets */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center hover:text-indigo-600 transition-colors whitespace-nowrap"
                    >
                      Asset Name
                      <ArrowUpDown
                        className={cn(
                          "inline w-3 h-3 ml-1 transition-opacity",
                          sortConfig.key === "name"
                            ? "opacity-100"
                            : "opacity-30",
                        )}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    <button
                      onClick={() => handleSort("type")}
                      className="flex items-center hover:text-indigo-600 transition-colors whitespace-nowrap"
                    >
                      Type
                      <ArrowUpDown
                        className={cn(
                          "inline w-3 h-3 ml-1 transition-opacity",
                          sortConfig.key === "type"
                            ? "opacity-100"
                            : "opacity-30",
                        )}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    Description
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500 whitespace-nowrap">
                    As of Date
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
                  <TableHead>Gain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-7">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <AlertCircle className="w-8 h-8 mb-2 text-slate-400" />
                        <p className="text-sm font-medium text-slate-900">
                          No external assets found
                        </p>
                        <p className="text-xs">
                          Adjust your search or add a new asset.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedExts.map((asset) => {
                    const gain = asset.currentValue - asset.investedValue;
                    const gainPercent =
                      asset.investedValue > 0
                        ? (gain / asset.investedValue) * 100
                        : 0;
                    return (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-slate-100 rounded text-slate-600">
                              {getAssetIcon(asset.type)}
                            </div>
                            {asset.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge>{asset.type}</Badge>
                        </TableCell>
                        <TableCell
                          className="text-sm text-slate-500 max-w-[200px] truncate"
                          title={asset.description}
                        >
                          {asset.description || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                          {formatDate(asset.asOfDate)}
                        </TableCell>
                        <TableCell className="pl-4">
                          {formatCurrency(asset.investedValue)}
                        </TableCell>
                        <TableCell className="font-medium pl-4">
                          {formatCurrency(asset.currentValue)}
                        </TableCell>
                        <TableCell>
                          <div
                            className={
                              gain >= 0 ? "text-emerald-600" : "text-red-600"
                            }
                          >
                            <p>
                              {gain >= 0 ? "+" : ""}
                              {formatCurrency(gain)}
                            </p>
                            <p className="text-xs">
                              ({gainPercent.toFixed(1)}%)
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center outline-none">
                                <StatusBadge
                                  status={asset.status || "Active"}
                                />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase">
                                Update Status
                              </DropdownMenuLabel>
                              {["Active", "Matured", "Closed"].map((status) => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() => {
                                    updateExternalAsset(asset.id, {
                                      status: status,
                                    });
                                    toast.success(
                                      `Asset status updated to ${status}`,
                                    );
                                  }}
                                  className="text-xs capitalize"
                                >
                                  {status}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 "
                              onClick={() => handleEditExt(asset)}
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-amber-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => deleteExternalAsset(asset.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {totalExtPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-medium">
                  {Math.min(
                    sortedExts.length,
                    (extPage - 1) * ITEMS_PER_PAGE + 1,
                  )}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(extPage * ITEMS_PER_PAGE, sortedExts.length)}
                </span>{" "}
                of <span className="font-medium">{sortedExts.length}</span>{" "}
                results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExtPage((p) => Math.max(1, p - 1))}
                  disabled={extPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-sm font-medium px-3 py-1 bg-white border border-slate-200 rounded">
                  {extPage} / {totalExtPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setExtPage((p) => Math.min(totalExtPages, p + 1))
                  }
                  disabled={extPage === totalExtPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Add External Asset Modal */}
        <Modal
          isOpen={showAddAsset}
          onClose={() => setShowAddAsset(false)}
          title="Add External Asset"
          preventAutoFocus={true}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  label="Client"
                  value={extForm.clientId}
                  onChange={(e) =>
                    setExtForm({
                      ...extForm,
                      clientId: e.target.value,
                      goalId: "",
                    })
                  }
                  options={[
                    { value: "", label: "Select Client" },
                    ...clients.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                  aria-invalid={!!extErrors.clientId}
                />
                {extErrors.clientId && (
                  <p className="text-xs text-red-500 mt-1">
                    {extErrors.clientId}
                  </p>
                )}
              </div>
              <div>
                <Select
                  label="Associated Goal (Optional)"
                  value={extForm.goalId}
                  onChange={(e) =>
                    setExtForm({ ...extForm, goalId: e.target.value })
                  }
                  options={[
                    { value: "", label: "None" },
                    ...goals
                      .filter((g) => g.clientId === extForm.clientId)
                      .map((g) => ({ value: g.id, label: g.name })),
                  ]}
                  disabled={!extForm.clientId}
                />
              </div>
            </div>
            <Select
              label="Asset Type"
              value={extForm.type}
              onChange={(e) => setExtForm({ ...extForm, type: e.target.value })}
              options={[
                { value: "Equity", label: "Direct Equity" },
                { value: "Bonds", label: "Bonds" },
                { value: "FD", label: "Fixed Deposit" },
                { value: "AIF/PMS", label: "AIF / PMS" },
                { value: "Insurance", label: "Insurance" },
                { value: "Real Estate", label: "Real Estate" },
                { value: "Gold", label: "Gold" },
                { value: "Cash", label: "Cash" },
                { value: "Other", label: "Other" },
              ]}
            />
            <div>
              <Input
                label="Asset Name"
                placeholder="e.g., HDFC Bank FD"
                value={extForm.name}
                onChange={(e) =>
                  setExtForm({ ...extForm, name: e.target.value })
                }
                aria-invalid={!!extErrors.name}
              />
              {extErrors.name && (
                <p className="text-xs text-red-500 mt-1">{extErrors.name}</p>
              )}
            </div>
            <Input
              label="Description"
              placeholder="Optional description"
              value={extForm.description}
              onChange={(e) =>
                setExtForm({ ...extForm, description: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Invested Value (₹)"
                  type="number"
                  placeholder="1000000"
                  value={extForm.investedValue}
                  onChange={(e) =>
                    setExtForm({ ...extForm, investedValue: e.target.value })
                  }
                  aria-invalid={!!extErrors.investedValue}
                />
                {extErrors.investedValue && (
                  <p className="text-xs text-red-500 mt-1">
                    {extErrors.investedValue}
                  </p>
                )}
              </div>
              <div>
                <Input
                  label="Current Value (₹)"
                  type="number"
                  placeholder="1100000"
                  value={extForm.currentValue}
                  onChange={(e) =>
                    setExtForm({ ...extForm, currentValue: e.target.value })
                  }
                  aria-invalid={!!extErrors.currentValue}
                />
                {extErrors.currentValue && (
                  <p className="text-xs text-red-500 mt-1">
                    {extErrors.currentValue}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="As of Date"
                type="date"
                value={extForm.asOfDate}
                onChange={(e) =>
                  setExtForm({ ...extForm, asOfDate: e.target.value })
                }
                aria-invalid={!!extErrors.asOfDate}
              />
              <Select
                label="Status"
                value={extForm.status}
                onChange={(e) =>
                  setExtForm({ ...extForm, status: e.target.value })
                }
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Matured", label: "Matured" },
                  { value: "Closed", label: "Closed" },
                ]}
              />
            </div>
            {extErrors.asOfDate && (
              <p className="text-xs text-red-500 mt-1">{extErrors.asOfDate}</p>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddAsset(false);
                  setEditingExtId(null);
                  setExtForm({
                    clientId:
                      selectedClientId !== "all" ? selectedClientId : "",
                    goalId: "",
                    type: "Equity",
                    name: "",
                    description: "",
                    investedValue: "",
                    currentValue: "",
                    asOfDate: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"
                onClick={() => {
                  if (validateExtForm()) {
                    const payload = {
                      clientId: extForm.clientId,
                      goalId: extForm.goalId,
                      type: extForm.type,
                      name: extForm.name,
                      description: extForm.description,
                      investedValue: parseFloat(extForm.investedValue),
                      currentValue: parseFloat(extForm.currentValue),
                      asOfDate: extForm.asOfDate,
                      status: extForm.status,
                    };
                    if (editingExtId) {
                      updateExternalAsset(editingExtId, payload);
                    } else {
                      addExternalAsset({
                        id: `ext_${Date.now()}`,
                        ...payload,
                      });
                    }
                    setExtForm({
                      clientId:
                        selectedClientId !== "all" ? selectedClientId : "",
                      goalId: "",
                      type: "Equity",
                      name: "",
                      description: "",
                      investedValue: "",
                      currentValue: "",
                      asOfDate: "",
                      status: "Active",
                    });
                    setEditingExtId(null);
                    setShowAddAsset(false);
                  }
                }}
              >
                {editingExtId ? "Update Asset" : "Add Asset"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
