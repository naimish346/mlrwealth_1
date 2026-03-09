import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  TrendingUp,
  Download,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Edit2,
  Trash2,
  ArrowUpDown,
  Calendar,
  AlertTriangle,
  PauseCircle,
  PlayCircle,
  Eye,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
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
import { useEffect } from "react";
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
    Paused: "bg-amber-100 text-amber-700 border-amber-200",
    Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Stopped: "bg-rose-100 text-rose-700 border-rose-200",
  };

  const dots = {
    Active: "bg-blue-500",
    Paused: "bg-amber-500",
    Completed: "bg-emerald-500",
    Stopped: "bg-rose-500",
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
        {status}
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

export const SipManagement = ({ clients }) => {
  const [selectedClientId, setSelectedClientId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "nextDate",
    direction: "asc",
  });
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [showAddSIP, setShowAddSIP] = useState(false);
  const [editingSipId, setEditingSipId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sipToDelete, setSipToDelete] = useState(null);
  const [showViewSIP, setShowViewSIP] = useState(false);
  const [viewingSip, setViewingSip] = useState(null);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [showResumeConfirm, setShowResumeConfirm] = useState(false);
  const [sipToToggle, setSipToToggle] = useState(null);

  // Mock Data for SIPs for demonstration
  const [sips, setSips] = useState([
    {
      id: "sip_1",
      clientId: "cli_001",
      schemeName: "Parag Parikh Flexi Cap Fund",
      folio: "847593847",
      amount: 15000,
      frequency: "Monthly",
      date: 5,
      startDate: "2024-01-05",
      nextDate: "2026-04-05",
      status: "Active",
    },
    {
      id: "sip_2",
      clientId: "cli_002",
      schemeName: "SBI Small Cap Fund",
      folio: "NEW",
      amount: 5000,
      frequency: "Weekly",
      date: 1, // Represents Monday
      startDate: "2024-06-01",
      nextDate: "2026-03-09",
      status: "Active",
    },
    {
      id: "sip_3",
      clientId: "cli_001",
      schemeName: "HDFC Index Fund",
      folio: "99883737",
      amount: 10000,
      frequency: "Monthly",
      date: 15,
      startDate: "2025-02-15",
      nextDate: "2026-03-15",
      status: "Paused",
    },
  ]);

  const [sipForm, setSipForm] = useState({
    clientId: selectedClientId !== "all" ? selectedClientId : "",
    fundCategory: "Equity",
    amc: "",
    schemeName: "",
    folio: "",
    amount: "",
    frequency: "Monthly",
    sipDate: "",
    startDate: "",
    sipType: "Regular",
    bankAccount: "",
    paymentMode: "Auto Debit",
    firstInstallment: "Pay Now",
    status: "Active",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!sipForm.clientId) newErrors.clientId = "Client Required";
    if (!sipForm.schemeName) newErrors.schemeName = "Required";
    if (!sipForm.amount || sipForm.amount <= 0)
      newErrors.amount = "Invalid amount";
    if (!sipForm.sipDate || sipForm.sipDate < 1 || sipForm.sipDate > 28)
      newErrors.sipDate = "Required (1-28)";
    if (!sipForm.startDate) newErrors.startDate = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-fetch bank details when client changes
  useEffect(() => {
    if (sipForm.clientId && !editingSipId) {
      const client = clients.find((c) => c.id === sipForm.clientId);
      if (client && client.bankAccounts) {
        const primaryBank = client.bankAccounts.find((b) => b.isPrimary);
        if (primaryBank) {
          setSipForm((prev) => ({
            ...prev,
            bankAccount: `${primaryBank.bankName} - ${primaryBank.accountNumber}`,
          }));
        }
      }
    }
  }, [sipForm.clientId, clients, editingSipId]);

  const handleEdit = (sip) => {
    setEditingSipId(sip.id);
    setSipForm({
      clientId: sip.clientId,
      fundCategory: sip.fundCategory || "Equity",
      amc: sip.amc || "",
      schemeName: sip.schemeName,
      folio: sip.folio || "",
      amount: sip.amount,
      frequency: sip.frequency,
      sipDate: sip.date || sip.sipDate,
      startDate: sip.startDate,
      sipType: sip.sipType || "Regular",
      bankAccount: sip.bankAccount || "",
      paymentMode: sip.paymentMode || "Auto Debit",
      firstInstallment: sip.firstInstallment || "Pay Now",
      status: sip.status,
    });
    setShowAddSIP(true);
  };

  const handlePause = () => {
    if (sipToToggle) {
      setSips(
        sips.map((s) =>
          s.id === sipToToggle ? { ...s, status: "Paused" } : s,
        ),
      );
      toast.success("SIP paused successfully");
      setShowPauseConfirm(false);
      setSipToToggle(null);
    }
  };

  const handleResume = () => {
    if (sipToToggle) {
      setSips(
        sips.map((s) =>
          s.id === sipToToggle ? { ...s, status: "Active" } : s,
        ),
      );
      toast.success("SIP resumed successfully");
      setShowResumeConfirm(false);
      setSipToToggle(null);
    }
  };

  const confirmPause = (id) => {
    setSipToToggle(id);
    setShowPauseConfirm(true);
  };

  const confirmResume = (id) => {
    setSipToToggle(id);
    setShowResumeConfirm(true);
  };

  const handleDelete = () => {
    if (sipToDelete) {
      setSips(sips.filter((s) => s.id !== sipToDelete));
      toast.success("SIP deleted successfully");
      setShowDeleteConfirm(false);
      setSipToDelete(null);
    }
  };

  const confirmDelete = (id) => {
    setSipToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleView = (sip) => {
    setViewingSip(sip);
    setShowViewSIP(true);
  };

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent +=
      "Client,Scheme Name,Folio,Amount,Frequency,SIP Date,Start Date,Next Date,Status\n";

    sortedSips.forEach((sip) => {
      const clientName =
        clients.find((c) => c.id === sip.clientId)?.name || "Unknown Client";
      csvContent += `"${clientName}","${sip.schemeName}","${sip.folio}",${sip.amount},"${sip.frequency}","${sip.date || sip.sipDate || ""}","${sip.startDate || ""}","${sip.nextDate}","${sip.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `sip_data_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("SIP data exported successfully!");
  };

  // Base list
  const clientSips =
    selectedClientId === "all"
      ? sips
      : sips.filter((s) => s.clientId === selectedClientId);

  const filteredSips = clientSips.filter(
    (s) =>
      (s.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.folio.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || s.status === statusFilter),
  );

  const sortedSips = [...filteredSips].sort((a, b) => {
    if (a[sortConfig.key] === undefined) return 0;
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedSips.length / ITEMS_PER_PAGE));
  const paginatedSips = sortedSips.slice(
    (Math.min(page, totalPages) - 1) * ITEMS_PER_PAGE,
    Math.min(page, totalPages) * ITEMS_PER_PAGE,
  );

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const totalSipAmount = clientSips
    .filter((s) => s.status === "Active")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-fade-in pb-10">
      <div className="bg-white px-0 pt-6 pb-0 mb-0">
        <div className="flex items-center justify-between mb-6 px-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SIP Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track and manage active SIPs for clients
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingSipId(null);
                setSipForm({
                  clientId: selectedClientId !== "all" ? selectedClientId : "",
                  fundCategory: "Equity",
                  amc: "",
                  schemeName: "",
                  folio: "",
                  amount: "",
                  frequency: "Monthly",
                  sipDate: "",
                  startDate: "",
                  sipType: "Regular",
                  bankAccount: "",
                  paymentMode: "Auto Debit",
                  firstInstallment: "Pay Now",
                  status: "Active",
                });
                setShowAddSIP(true);
              }}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Add SIP
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto pt-4 space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 px-0 shrink-0">
          <MetricCard
            title="Total Active SIP Book"
            value={formatCurrency(totalSipAmount)}
            icon={TrendingUp}
            colorClass="bg-emerald-50/50 border-emerald-100"
            subtitle="Monthly Run Rate"
          />
          <MetricCard
            title="Active SIPs"
            value={clientSips.filter((s) => s.status === "Active").length}
            icon={Calendar}
            colorClass="bg-blue-50/50 border-blue-100"
          />
          <MetricCard
            title="Paused SIPs"
            value={clientSips.filter((s) => s.status === "Paused").length}
            icon={PauseCircle}
            colorClass="bg-amber-50/50 border-amber-100"
          />
          <MetricCard
            title="Stopped SIPs"
            value={clientSips.filter((s) => s.status === "Stopped").length}
            icon={AlertCircle}
            colorClass="bg-rose-50/50 border-rose-100"
          />
        </div>

        {/* Filters Card */}
        <div className="shrink-0 px-0">
          <div className="flex items-center gap-3 w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <Input
              icon={<Search className="w-5 h-5" />}
              placeholder="Search by scheme or folio..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "Active", label: "Active" },
                  { value: "Paused", label: "Paused" },
                  { value: "Completed", label: "Completed" },
                  { value: "Stopped", label: "Stopped" },
                ]}
                className="bg-slate-50 border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* SIPs Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    <button
                      onClick={() => handleSort("clientId")}
                      className="flex items-center hover:text-indigo-600 transition-colors whitespace-nowrap"
                    >
                      Client
                      <ArrowUpDown
                        className={cn(
                          "inline w-3 h-3 ml-1 transition-opacity",
                          sortConfig.key === "clientId"
                            ? "opacity-100"
                            : "opacity-30",
                        )}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    <button
                      onClick={() => handleSort("schemeName")}
                      className="flex items-center hover:text-indigo-600 transition-colors whitespace-nowrap"
                    >
                      Scheme Name
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
                    <button
                      onClick={() => handleSort("amount")}
                      className="flex items-center hover:text-indigo-600 transition-colors whitespace-nowrap"
                    >
                      Amount
                      <ArrowUpDown
                        className={cn(
                          "inline w-3 h-3 ml-1 transition-opacity",
                          sortConfig.key === "amount"
                            ? "opacity-100"
                            : "opacity-30",
                        )}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    SIP Date
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    Start Date
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    Status
                  </TableHead>
                  <TableHead className="px-4 py-3 font-medium text-slate-500">
                    <button
                      onClick={() => handleSort("nextDate")}
                      className="flex items-center hover:text-indigo-600 transition-colors whitespace-nowrap"
                    >
                      Next Date
                      <ArrowUpDown
                        className={cn(
                          "inline w-3 h-3 ml-1 transition-opacity",
                          sortConfig.key === "nextDate"
                            ? "opacity-100"
                            : "opacity-30",
                        )}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <AlertCircle className="w-8 h-8 mb-2 text-slate-400" />
                        <p className="text-sm font-medium text-slate-900">
                          No SIPs found
                        </p>
                        <p className="text-xs">
                          Adjust your search or add a new SIP.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSips.map((sip) => (
                    <TableRow key={sip.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900 whitespace-nowrap">
                          {clients.find((c) => c.id === sip.clientId)?.name ||
                            "Unknown Client"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-900 whitespace-nowrap pr-4">
                          {sip.schemeName}
                        </p>
                      </TableCell>
                      <TableCell className="font-medium w-32 pl-4">
                        {formatCurrency(sip.amount)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm pl-3">
                          Day {sip.date || sip.sipDate}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="text-sm text-slate-600">
                            {formatDate(sip.startDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex items-center outline-none">
                              <StatusBadge status={sip.status} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase">
                              Update Status
                            </DropdownMenuLabel>
                            {["Active", "Paused", "Completed", "Stopped"].map(
                              (status) => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() => {
                                    setSips(
                                      sips.map((s) =>
                                        s.id === sip.id
                                          ? { ...s, status: status }
                                          : s,
                                      ),
                                    );
                                    toast.success(
                                      `SIP status updated to ${status}`,
                                    );
                                  }}
                                  className="text-xs capitalize"
                                >
                                  {status}
                                </DropdownMenuItem>
                              ),
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium">
                            {formatDate(sip.nextDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleView(sip)}
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {sip.status === "Paused" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => confirmResume(sip.id)}
                              title="Resume"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              onClick={() => confirmPause(sip.id)}
                              title="Pause"
                            >
                              <PauseCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(sip)}
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-amber-600 hover:text-amber-700 hover:bg-amber-50" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => confirmDelete(sip.id)}
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-medium">
                  {Math.min(sortedSips.length, (page - 1) * ITEMS_PER_PAGE + 1)}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(page * ITEMS_PER_PAGE, sortedSips.length)}
                </span>{" "}
                of <span className="font-medium">{sortedSips.length}</span>{" "}
                results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-sm font-medium px-3 py-1 bg-white border border-slate-200 rounded">
                  {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Add/Edit SIP Modal */}
        <Modal
          isOpen={showAddSIP}
          onClose={() => setShowAddSIP(false)}
          title={editingSipId ? "Edit SIP" : "Add New SIP"}
          size="lg"
          preventAutoFocus={true}
        >
          <div className="space-y-4 max-h-[85vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Client"
                  value={sipForm.clientId}
                  onChange={(e) =>
                    setSipForm({ ...sipForm, clientId: e.target.value })
                  }
                  options={[
                    { value: "", label: "Select Client" },
                    ...clients.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                  aria-invalid={!!errors.clientId}
                />
                {errors.clientId && (
                  <p className="text-xs text-red-500 mt-1">{errors.clientId}</p>
                )}
              </div>
              <Select
                label="Fund Category"
                value={sipForm.fundCategory}
                onChange={(e) =>
                  setSipForm({ ...sipForm, fundCategory: e.target.value })
                }
                options={[
                  { value: "Equity", label: "Equity" },
                  { value: "Debt", label: "Debt" },
                  { value: "Hybrid", label: "Hybrid" },
                  { value: "Index", label: "Index Fund" },
                  { value: "ELSS", label: "ELSS (Tax savings)" },
                  { value: "International", label: "International" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="AMC"
                placeholder="e.g., SBI Mutual Fund"
                value={sipForm.amc}
                onChange={(e) =>
                  setSipForm({ ...sipForm, amc: e.target.value })
                }
              />
              <div>
                <Input
                  label="Select Scheme"
                  placeholder="e.g., SBI Small Cap Fund"
                  value={sipForm.schemeName}
                  onChange={(e) =>
                    setSipForm({ ...sipForm, schemeName: e.target.value })
                  }
                  aria-invalid={!!errors.schemeName}
                />
                {errors.schemeName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.schemeName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Frequency"
                value={sipForm.frequency}
                onChange={(e) =>
                  setSipForm({ ...sipForm, frequency: e.target.value })
                }
                options={[
                  { value: "Daily", label: "Daily" },
                  { value: "Weekly", label: "Weekly" },
                  { value: "Monthly", label: "Monthly" },
                  { value: "Quarterly", label: "Quarterly" },
                ]}
              />
              <div>
                <Input
                  label="Amount (₹)"
                  type="number"
                  placeholder="5000"
                  value={sipForm.amount}
                  onChange={(e) =>
                    setSipForm({ ...sipForm, amount: e.target.value })
                  }
                  aria-invalid={!!errors.amount}
                />
                {errors.amount && (
                  <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
                )}
              </div>
              <div>
                <Input
                  label="SIP Date (1-28)"
                  type="number"
                  placeholder="5"
                  min="1"
                  max="28"
                  value={sipForm.sipDate}
                  onChange={(e) =>
                    setSipForm({ ...sipForm, sipDate: e.target.value })
                  }
                  aria-invalid={!!errors.sipDate}
                />
                {errors.sipDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.sipDate}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Start Date"
                  type="date"
                  value={sipForm.startDate}
                  onChange={(e) =>
                    setSipForm({ ...sipForm, startDate: e.target.value })
                  }
                  aria-invalid={!!errors.startDate}
                />
                {errors.startDate && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <Select
                label="SIP Type"
                value={sipForm.sipType}
                onChange={(e) =>
                  setSipForm({ ...sipForm, sipType: e.target.value })
                }
                options={[
                  { value: "Regular", label: "Regular SIP" },
                  { value: "Step-Up", label: "Step-Up SIP" },
                  { value: "Flexible", label: "Flexible SIP" },
                  { value: "Perpetual", label: "Perpetual SIP" },
                  { value: "Trigger", label: "Trigger SIP" },
                  { value: "Combo", label: "Combo SIP" },
                  { value: "Insurance", label: "SIP with Insurance" },
                  { value: "Smart", label: "Smart SIP" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Bank Account Details"
                placeholder="e.g., HDFC Bank - 1234"
                value={sipForm.bankAccount}
                onChange={(e) =>
                  setSipForm({ ...sipForm, bankAccount: e.target.value })
                }
              />
              <Select
                label="Payment Mode"
                value={sipForm.paymentMode}
                onChange={(e) =>
                  setSipForm({ ...sipForm, paymentMode: e.target.value })
                }
                options={[
                  { value: "Auto Debit", label: "Auto Debit (NACH/Mandate)" },
                  { value: "UPI", label: "UPI" },
                  { value: "Net Banking", label: "Net Banking" },
                  { value: "Cheque", label: "Cheque" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="First Installment"
                value={sipForm.firstInstallment}
                onChange={(e) =>
                  setSipForm({ ...sipForm, firstInstallment: e.target.value })
                }
                options={[
                  { value: "Pay Now", label: "Pay Now" },
                  { value: "Deduct Later", label: "Deduct Later" },
                ]}
              />
              <Select
                label="Status"
                value={sipForm.status}
                onChange={(e) =>
                  setSipForm({ ...sipForm, status: e.target.value })
                }
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Paused", label: "Paused" },
                  { value: "Completed", label: "Completed" },
                  { value: "Stopped", label: "Stopped" },
                ]}
              />
            </div>

            {/* Dynamic Summary Block */}
            <div className="bg-slate-100 p-4 rounded-lg mt-4 border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                SIP Summary
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-2 rounded shadow-sm">
                  <p className="text-[10px] text-slate-500 uppercase font-medium">
                    Monthly Inv.
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {(() => {
                      const amt = parseFloat(sipForm.amount) || 0;
                      if (sipForm.frequency === "Daily")
                        return formatCurrency(amt * 20);
                      if (sipForm.frequency === "Weekly")
                        return formatCurrency(amt * 4);
                      if (sipForm.frequency === "Quarterly")
                        return formatCurrency(amt / 3);
                      return formatCurrency(amt);
                    })()}
                  </p>
                </div>
                <div className="bg-white p-2 rounded shadow-sm">
                  <p className="text-[10px] text-slate-500 uppercase font-medium">
                    1st Debit Date
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {sipForm.startDate
                      ? new Date(sipForm.startDate).toLocaleDateString("en-IN")
                      : "TBD"}
                  </p>
                </div>
                <div className="bg-white p-2 rounded shadow-sm">
                  <p className="text-[10px] text-slate-500 uppercase font-medium">
                    Est. 1Y Value (10%)
                  </p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">
                    {(() => {
                      const amt = parseFloat(sipForm.amount) || 0;
                      let monthly = amt;
                      if (sipForm.frequency === "Daily") monthly = amt * 20;
                      if (sipForm.frequency === "Weekly") monthly = amt * 4;
                      if (sipForm.frequency === "Quarterly") monthly = amt / 3;
                      // FV = P * [ (1+i)^n - 1 ] / i * (1+i)
                      const i = 0.1 / 12;
                      const n = 12;
                      const fv =
                        monthly > 0
                          ? (monthly * (Math.pow(1 + i, n) - 1) * (1 + i)) / i
                          : 0;
                      return formatCurrency(fv);
                    })()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddSIP(false);
                  setEditingSipId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"
                onClick={() => {
                  if (validateForm()) {
                    const payload = {
                      clientId: sipForm.clientId,
                      fundCategory: sipForm.fundCategory,
                      amc: sipForm.amc,
                      schemeName: sipForm.schemeName,
                      folio: sipForm.folio,
                      amount: parseFloat(sipForm.amount),
                      frequency: sipForm.frequency,
                      date: parseInt(sipForm.sipDate),
                      startDate: sipForm.startDate,
                      sipType: sipForm.sipType,
                      bankAccount: sipForm.bankAccount,
                      paymentMode: sipForm.paymentMode,
                      firstInstallment: sipForm.firstInstallment,
                      status: sipForm.status,
                      nextDate: sipForm.startDate, // using startDate as next debit approximate
                    };

                    if (editingSipId) {
                      setSips(
                        sips.map((s) =>
                          s.id === editingSipId ? { ...s, ...payload } : s,
                        ),
                      );
                      toast.success("SIP Updated");
                    } else {
                      setSips([
                        ...sips,
                        {
                          id: `sip_${Date.now()}`,
                          ...payload,
                        },
                      ]);
                      toast.success("SIP Added");
                    }

                    setShowAddSIP(false);
                  }
                }}
              >
                {editingSipId ? "Update SIP" : "Add SIP"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirm Delete"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-lg">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-medium">
                Are you sure you want to delete this SIP? This action cannot be
                undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete SIP
              </Button>
            </div>
          </div>
        </Modal>

        {/* View SIP Details Modal */}
        <Modal
          isOpen={showViewSIP}
          onClose={() => setShowViewSIP(false)}
          title="SIP Details"
          size="lg"
        >
          {viewingSip && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">
                    Client
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {clients.find((c) => c.id === viewingSip.clientId)?.name ||
                      "Unknown Client"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">
                    Amount
                  </p>
                  <p className="text-base font-semibold text-indigo-700">
                    {formatCurrency(viewingSip.amount)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500 font-medium mb-1">
                    Scheme Name
                  </p>
                  <p className="text-base font-medium text-slate-900">
                    {viewingSip.schemeName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">
                    Folio Number
                  </p>
                  <p className="text-base font-mono text-slate-700">
                    {viewingSip.folio || "New Folio"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">
                    Status
                  </p>
                  <StatusBadge status={viewingSip.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 px-2">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                    Frequency
                  </p>
                  <p className="text-sm text-slate-900">
                    {viewingSip.frequency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                    SIP Date
                  </p>
                  <p className="text-sm text-slate-900">
                    Day {viewingSip.date || viewingSip.sipDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                    Start Date
                  </p>
                  <p className="text-sm text-slate-900">
                    {formatDate(viewingSip.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                    Next Debit Date
                  </p>
                  <p className="text-sm text-slate-900 font-medium">
                    {formatDate(viewingSip.nextDate)}
                  </p>
                </div>
                {viewingSip.bankAccount && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                      Bank Account
                    </p>
                    <p className="text-sm text-slate-900">
                      {viewingSip.bankAccount}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white min-w-[100px]"
                  onClick={() => setShowViewSIP(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Pause Confirmation Modal */}
        <Modal
          isOpen={showPauseConfirm}
          onClose={() => setShowPauseConfirm(false)}
          title="Pause SIP"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-lg">
              <PauseCircle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-medium">
                Are you sure you want to pause this SIP? Future installments
                will be skipped until you resume.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPauseConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handlePause}
              >
                Pause SIP
              </Button>
            </div>
          </div>
        </Modal>

        {/* Resume Confirmation Modal */}
        <Modal
          isOpen={showResumeConfirm}
          onClose={() => setShowResumeConfirm(false)}
          title="Resume SIP"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-lg">
              <PlayCircle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-medium">
                Are you sure you want to resume this SIP? Monthly installments
                will start again from the next debit date.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowResumeConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleResume}
              >
                Resume SIP
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
