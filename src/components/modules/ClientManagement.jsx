import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Download,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Users,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  ChevronDown,
  LayoutList,
  Grid2X2,
  Baby,
  Shield,
  Globe,
  Edit2,
  UserMinus,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input, Select } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Pagination } from "../ui/pagination";
import { FilterChips } from "../ui/FilterChips";
import { useAppStore } from "../../store/appStore";
import { cn } from "../../utils/cn";
import { ClientProfile } from "./client/ClientProfile";
import { ClientOnboardingPage } from "./client/ClientOnboardingPage";
import { Modal } from "../ui/Modal";

const formatCurrency = (value) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
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
      <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm flex items-center justify-center text-[#1e3a5f]">
        <Icon className="w-5 h-5" />
      </div>
    </CardContent>
  </Card>
);

const maskPAN = (pan) => `XXXX${pan.slice(-4)}`;

const getStatusBadge = (status) => {
  const variants = {
    Active: "success",
    Lead: "info",
    Prospect: "warning",
    Dormant: "warning",
    Closed: "error",
  };
  return <Badge variant={variants[status]}>{status}</Badge>;
};

const getKYCBadge = (status) => {
  if (status === "Verified")
    return (
      <Badge variant="success">
        <CheckCircle className="w-3 h-3 mr-1" />
        Verified
      </Badge>
    );
  if (status === "Pending")
    return (
      <Badge variant="warning">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  if (status === "Expired")
    return (
      <Badge variant="error">
        <AlertCircle className="w-3 h-3 mr-1" />
        Expired
      </Badge>
    );
  return <Badge variant="error">{status}</Badge>;
};

const getEntityIcon = (type) => {
  switch (type) {
    case "Individual":
      return <User className="w-4 h-4" />;
    case "Joint":
      return <Users className="w-4 h-4" />;
    case "Minor":
      return <Baby className="w-4 h-4" />;
    case "HUF":
      return <Shield className="w-4 h-4" />;
    case "Corporate":
      return <Building2 className="w-4 h-4" />;
    case "Trust":
      return <Shield className="w-4 h-4" />;
    case "NRI":
      return <Globe className="w-4 h-4" />;
    default:
      return <User className="w-4 h-4" />;
  }
};

export const ClientManagement = () => {
  const { clients, searchClients, updateClient } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");
  const [filterKYC, setFilterKYC] = useState("all");
  const [filterRM, setFilterRM] = useState("all");
  const [filterAumMin, setFilterAumMin] = useState("");
  const [filterAumMax, setFilterAumMax] = useState("");
  const [filterDateJoined, setFilterDateJoined] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid' | 'family'
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [showExportMenu, setShowExportMenu] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Pagination
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Client Profile View
  const [selectedProfileClient, setSelectedProfileClient] = useState(() => {
    try {
      return (
        JSON.parse(sessionStorage.getItem("selectedProfileClient")) || null
      );
    } catch {
      return null;
    }
  });
  const [editingClient, setEditingClient] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("editingClient")) || null;
    } catch {
      return null;
    }
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState(null);

  const handleViewClient = (client) => {
    setViewingClient(client);
    setIsViewModalOpen(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    sessionStorage.setItem("editingClient", JSON.stringify(client));
    navigate("/clients/edit");
  };

  const handleClientClick = (client) => {
    setSelectedProfileClient(client);
    sessionStorage.setItem("selectedProfileClient", JSON.stringify(client));
    navigate("/clients/profile");
  };

  const handleMarkAsDormant = (client) => {
    updateClient(client.id, { status: "Dormant" });
    toast.success(`${client.name} marked as Dormant`);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getActiveTab = () => {
    const path = location.pathname.replace("/clients", "").replace("/", "");
    return path || "list";
  };

  const activeTab = getActiveTab();

  const setActiveTab = (tabId) => {
    if (tabId === "new") {
      setEditingClient(null);
      sessionStorage.removeItem("editingClient");
      // Clear all onboarding drafts to ensure a fresh form
      sessionStorage.removeItem("onboardingFormData");
      sessionStorage.removeItem("onboardingStep");
      sessionStorage.removeItem("onboardingKycFetched");
      sessionStorage.removeItem("editingClientId");
    }
    navigate(`/clients/${tabId}`);
  };

  useEffect(() => {
    if (activeTab === "profile" && !selectedProfileClient) {
      navigate("/clients/list");
    }
  }, [activeTab, selectedProfileClient, navigate]);

  // Get unique RM names for filter
  const rmNames = useMemo(() => {
    const names = [...new Set(clients.map((c) => c.rmName).filter(Boolean))];
    return names.sort();
  }, [clients]);

  // Handle fresh state for "New Client" tab
  useEffect(() => {
    if (activeTab === "new") {
      setEditingClient(null);
      sessionStorage.removeItem("editingClient");
      sessionStorage.removeItem("onboardingFormData");
      sessionStorage.removeItem("onboardingStep");
      sessionStorage.removeItem("onboardingKycFetched");
      sessionStorage.removeItem("editingClientId");
    }
  }, [activeTab]);

  const filteredClients = searchClients(searchQuery)
    .filter((client) => {
      if (filterStatus !== "all" && client.status !== filterStatus)
        return false;
      if (filterEntity !== "all" && client.entityType !== filterEntity)
        return false;
      if (filterKYC !== "all" && client.kycStatus !== filterKYC) return false;
      if (filterRM !== "all" && client.rmName !== filterRM) return false;
      if (filterAumMin && client.aum < Number(filterAumMin)) return false;
      if (filterAumMax && client.aum > Number(filterAumMax)) return false;
      if (
        filterDateJoined &&
        client.dateJoined &&
        client.dateJoined < filterDateJoined
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (typeof valA === "string" && typeof valB === "string") {
        return sortConfig.direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortConfig.direction === "asc"
        ? (valA || 0) - (valB || 0)
        : (valB || 0) - (valA || 0);
    });

  const totalAUM = filteredClients.reduce((sum, c) => sum + c.aum, 0);

  const familyGroups = filteredClients.reduce((acc, client) => {
    if (client.familyId) {
      if (!acc[client.familyId]) {
        acc[client.familyId] = {
          name: client.familyName || "Family",
          members: [],
          totalAUM: 0,
        };
      }
      acc[client.familyId].members.push(client);
      acc[client.familyId].totalAUM += client.aum;
    }
    return acc;
  }, {});

  // Paginated clients
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Active filter chips
  const activeFilters = [];
  if (filterStatus !== "all")
    activeFilters.push({ id: "status", label: "Status", value: filterStatus });
  if (filterEntity !== "all")
    activeFilters.push({ id: "entity", label: "Entity", value: filterEntity });
  if (filterKYC !== "all")
    activeFilters.push({ id: "kyc", label: "KYC", value: filterKYC });
  if (filterRM !== "all")
    activeFilters.push({ id: "rm", label: "RM", value: filterRM });
  if (filterAumMin || filterAumMax)
    activeFilters.push({
      id: "aum",
      label: "AUM",
      value: `${filterAumMin || "0"} - ${filterAumMax || "∞"}`,
    });
  if (filterDateJoined)
    activeFilters.push({
      id: "date",
      label: "Date Joined",
      value: filterDateJoined,
    });

  const handleRemoveFilter = (filterId) => {
    if (filterId === "status") setFilterStatus("all");
    if (filterId === "entity") setFilterEntity("all");
    if (filterId === "kyc") setFilterKYC("all");
    if (filterId === "rm") setFilterRM("all");
    if (filterId === "aum") {
      setFilterAumMin("");
      setFilterAumMax("");
    }
    if (filterId === "date") setFilterDateJoined("");
  };

  const handleClearAll = () => {
    setFilterStatus("all");
    setFilterEntity("all");
    setFilterKYC("all");
    setFilterRM("all");
    setFilterAumMin("");
    setFilterAumMax("");
    setFilterDateJoined("");
  };

  const handleExport = (format) => {
    console.log(`Exporting as ${format}...`);
    setShowExportMenu(false);
  };

  // If a profile is open and URL matches, show profile view
  if (activeTab === "profile" && selectedProfileClient) {
    return (
      <ClientProfile
        client={selectedProfileClient}
        onBack={() => {
          setSelectedProfileClient(null);
          sessionStorage.removeItem("selectedProfileClient");
          navigate("/clients/list");
        }}
        onEdit={handleEditClient}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-10">
      {/* Header Area */}
      <div className="bg-white px-0 pt-6 pb-0 mb-0">
        <div className="flex items-center justify-between mb-6 px-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === "edit"
                ? "Edit Client Details"
                : activeTab === "new"
                  ? "New Client Registration"
                  : "Client Management"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === "edit"
                ? `Modifying information for ${editingClient?.name}`
                : activeTab === "new"
                  ? "Complete the multi-step onboarding process for a new client"
                  : "Manage and track your client relationships"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "list" || activeTab === "" ? (
              <>
                {/* Export Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </motion.button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30">
                      <button
                        onClick={() => handleExport("csv")}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <FileText className="w-4 h-4 text-emerald-500" />
                        Export as CSV
                      </button>
                      <button
                        onClick={() => handleExport("pdf")}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <FileText className="w-4 h-4 text-red-400" />
                        Export as PDF
                      </button>
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 15px -3px rgba(30, 58, 95, 0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab("new")}
                  className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Client
                </motion.button>
              </>
            ) : (
              <Button
                onClick={() => setActiveTab("list")}
                className="flex items-center gap-2 bg-[#152a45] hover:bg-[#152a45]/90 text-white shadow-sm border-0"
              >
                <LayoutList className="w-4 h-4" />
                View Client List
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards Area */}
        {activeTab !== "new" && (
          <div className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total Clients"
                value={filteredClients.length}
                icon={Users}
                colorClass="bg-indigo-50/50 border-indigo-100"
              />
              <MetricCard
                title="Total AUM"
                value={formatCurrency(totalAUM)}
                icon={Building2}
                colorClass="bg-teal-50/50 border-teal-100"
              />
              <MetricCard
                title="Family Groups"
                value={Object.keys(familyGroups).length}
                icon={Users}
                colorClass="bg-blue-50/50 border-blue-100"
              />
              <MetricCard
                title="Pending KYC"
                value={
                  filteredClients.filter((c) => c.kycStatus !== "Verified")
                    .length
                }
                icon={AlertCircle}
                colorClass="bg-amber-50/50 border-amber-100"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto space-y-4">
        {activeTab === "new" || activeTab === "edit" ? (
          <ClientOnboardingPage
            key={activeTab === "edit" ? `edit-${editingClient?.id}` : "new"}
            clientToEdit={activeTab === "edit" ? editingClient : null}
          />
        ) : (
          <>
            {/* Filters Area */}
            <Card className="border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-md">
              <CardContent className="space-y-2">
                {/* Row 1: Search + View Toggle */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by Name, PAN, Mobile, Email, CKYC ID..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all placeholder:text-slate-400"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  <div className="flex bg-slate-100 rounded-lg border border-slate-200 shadow-sm">
                    <button
                      onClick={() => setViewMode("table")}
                      className={cn(
                        "p-2 rounded-md transition-all",
                        viewMode === "table"
                          ? "bg-white text-[#1e3a5f] shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      <LayoutList className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "p-2 rounded-md transition-all",
                        viewMode === "grid"
                          ? "bg-white text-[#1e3a5f] shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      <Grid2X2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("family")}
                      className={cn(
                        "p-2 rounded-md transition-all flex items-center gap-2 px-3",
                        viewMode === "family"
                          ? "bg-white text-[#1e3a5f] shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-semibold">Families</span>
                    </button>
                  </div>
                </div>

                {/* Row 2: All Filters in a uniform grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
                  <Select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: "all", label: "All Status" },
                      { value: "Active", label: "Active" },
                      { value: "Lead", label: "Lead" },
                      { value: "Prospect", label: "Prospect" },
                      { value: "Dormant", label: "Dormant" },
                      { value: "Closed", label: "Closed" },
                    ]}
                  />
                  <Select
                    value={filterEntity}
                    onChange={(e) => {
                      setFilterEntity(e.target.value);
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: "all", label: "All Types" },
                      { value: "Individual", label: "Individual" },
                      { value: "Joint", label: "Joint" },
                      { value: "HUF", label: "HUF" },
                      { value: "Corporate", label: "Corporate" },
                      { value: "Trust", label: "Trust" },
                      { value: "NRI", label: "NRI" },
                    ]}
                  />
                  <Select
                    value={filterKYC}
                    onChange={(e) => {
                      setFilterKYC(e.target.value);
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: "all", label: "All KYC" },
                      { value: "Verified", label: "Verified" },
                      { value: "Pending", label: "Pending" },
                      { value: "Expired", label: "Expired" },
                    ]}
                  />
                  <Select
                    value={filterRM}
                    onChange={(e) => {
                      setFilterRM(e.target.value);
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: "all", label: "All RMs" },
                      ...rmNames.map((name) => ({ value: name, label: name })),
                    ]}
                  />
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filterAumMin}
                    onChange={(e) => {
                      setFilterAumMin(e.target.value);
                      setCurrentPage(1);
                    }}
                    label="AUM Min (₹)"
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filterAumMax}
                    onChange={(e) => {
                      setFilterAumMax(e.target.value);
                      setCurrentPage(1);
                    }}
                    label="AUM Max (₹)"
                  />
                  <Input
                    type="date"
                    value={filterDateJoined}
                    onChange={(e) => {
                      setFilterDateJoined(e.target.value);
                      setCurrentPage(1);
                    }}
                    label="Date Joined"
                  />
                </div>

                {/* Active Filter Chips */}
                <FilterChips
                  filters={activeFilters}
                  onRemove={handleRemoveFilter}
                  onClearAll={handleClearAll}
                />
              </CardContent>
            </Card>

            {/* Views */}
            {viewMode === "table" && (
              <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-medium text-slate-500 text-sm tracking-wider">
                        <button
                          onClick={() => handleSort("name")}
                          className="flex items-center hover:text-indigo-600 transition-colors"
                        >
                          Client
                          <ArrowUpDown className="ml-2 w-3 h-3 text-slate-400" />
                        </button>
                      </TableHead>
                      <TableHead className="font-medium text-slate-500 text-sm tracking-wider">
                        <button
                          onClick={() => handleSort("entityType")}
                          className="flex items-center hover:text-indigo-600 transition-colors"
                        >
                          Type
                          <ArrowUpDown className="ml-2 w-3 h-3 text-slate-400" />
                        </button>
                      </TableHead>
                      <TableHead className="font-medium text-slate-500 text-sm tracking-wider">
                        PAN
                      </TableHead>
                      <TableHead className="font-medium text-slate-500 text-sm tracking-wider">
                        RM Assigned
                      </TableHead>
                      <TableHead className="font-medium text-slate-500 text-sm tracking-wider">
                        KYC Status
                      </TableHead>
                      <TableHead className="font-medium text-slate-500 text-sm tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="text-center font-medium text-slate-500 text-sm tracking-wider">
                        <button
                          onClick={() => handleSort("aum")}
                          className="flex items-center justify-center hover:text-indigo-600 transition-colors w-full"
                        >
                          AUM
                          <ArrowUpDown className="ml-2 w-3 h-3 text-slate-400" />
                        </button>
                      </TableHead>
                      <TableHead className="font-medium text-slate-500 text-sm tracking-wider text-left pl-6">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedClients.map((client) => (
                      <TableRow
                        key={client.id}
                        onClick={() => handleClientClick(client)}
                        className="cursor-pointer hover:bg-slate-50/80 transition-colors group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white font-semibold shadow-sm group-hover:shadow transition-all">
                              {client.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {client.name}
                              </p>
                              {client.familyName && (
                                <p className="text-[10px] text-slate-500 font-medium">
                                  {client.familyName}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEntityIcon(client.entityType)}
                            <span className="text-sm font-medium text-slate-600 truncate max-w-[100px] inline-block">
                              {client.entityType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-slate-700">
                          {maskPAN(client.pan)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold text-slate-700">
                            {client.rmName}
                          </span>
                        </TableCell>
                        <TableCell>{getKYCBadge(client.kycStatus)}</TableCell>
                        <TableCell>{getStatusBadge(client.status)}</TableCell>
                        <TableCell className="text-center font-semibold text-slate-800">
                          {formatCurrency(client.aum)}
                        </TableCell>
                        <TableCell>
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="p-1.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewClient(client);
                              }}
                              title="View Client"
                            >
                              <Eye className="w-4 h-4 text-indigo-600" />
                            </button>
                            <button
                              className="p-1.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClient(client);
                              }}
                              title="Edit Client"
                            >
                              <Edit2 className="w-4 h-4 text-amber-600" />
                            </button>
                            <button
                              className="p-1.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsDormant(client);
                              }}
                              title="Mark as Dormant"
                            >
                              <UserMinus className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                  <Pagination
                    totalItems={filteredClients.length}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </Card>
            )}

            {viewMode === "grid" && (
              <div className="animate-fade-in space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedClients.map((client) => (
                    <Card
                      key={client.id}
                      onClick={() => handleClientClick(client)}
                      className="hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-200/60 hover:border-[#1e3a5f]/30 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/50"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#1e3a5f] to-[#2a5f8f] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {client.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800 text-base">
                                {client.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                {getEntityIcon(client.entityType)}
                                <span className="text-xs text-slate-600 font-semibold uppercase tracking-tight">
                                  {client.entityType}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(client.status)}
                            <div
                              className="flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClient(client);
                                }}
                                title="Edit"
                              >
                                <Edit className="w-3 h-3 text-amber-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsDormant(client);
                                }}
                                title="Mark as Dormant"
                              >
                                <UserMinus className="w-3 h-3 text-slate-500" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4 text-xs font-medium">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-4 h-4 text-slate-400" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400" />
                            {client.mobile}
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {client.city}, {client.state}
                          </div>
                          {client.familyName && (
                            <div className="flex items-center gap-2 text-teal-600 font-medium">
                              <Users className="w-4 h-4" />
                              {client.familyName}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                              AUM
                            </p>
                            <p className="font-semibold text-slate-800">
                              {formatCurrency(client.aum)}
                            </p>
                          </div>
                          {getKYCBadge(client.kycStatus)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Card className="p-4 border-slate-100 shadow-sm">
                  <Pagination
                    totalItems={filteredClients.length}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                  />
                </Card>
              </div>
            )}

            {viewMode === "family" && (
              <div className="animate-fade-in space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {Object.entries(familyGroups).map(([id, family]) => (
                    <Card
                      key={id}
                      className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5f8f] p-5 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
                              <Users className="w-7 h-7" />
                            </div>
                            <div>
                              <h3 className="font-bold text-xl">
                                {family.name}
                              </h3>
                              <span className="inline-block px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                {family.members.length} Members
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
                              Total Household AUM
                            </p>
                            <p className="font-extrabold text-2xl tracking-tight">
                              {formatCurrency(family.totalAUM)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                          {family.members.map((member) => (
                            <div
                              key={member.id}
                              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer group transition-colors"
                              onClick={() => handleClientClick(member)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center text-[#1e3a5f] font-bold text-xs border border-slate-200 group-hover:bg-white group-hover:shadow-sm transition-all">
                                  {member.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-800 group-hover:text-[#1e3a5f] transition-colors">
                                    {member.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {getEntityIcon(member.entityType)}
                                    <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-tight">
                                      {member.entityType}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-slate-800">
                                  {formatCurrency(member.aum)}
                                </p>
                                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                  <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-teal-500"
                                      style={{
                                        width: `${(member.aum / family.totalAUM) * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {(
                                      (member.aum / family.totalAUM) *
                                      100
                                    ).toFixed(0)}
                                    %
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <ClientViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        client={viewingClient}
        onEdit={handleEditClient}
        onViewFullProfile={handleClientClick}
      />
    </div>
  );
};

const ClientViewModal = ({
  isOpen,
  onClose,
  client,
  onEdit,
  onViewFullProfile,
}) => {
  if (!client) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Client Quick View"
      size="lg"
    >
      <div className="space-y-6 py-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {client.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{client.name}</h2>
            <p className="text-sm font-semibold text-slate-600">
              {client.entityType} • {client.status}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              PAN Card
            </p>
            <p className="text-sm font-mono font-medium">{client.pan}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              AUM
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {formatCurrency(client.aum)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Email
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {client.email}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Mobile
            </p>
            <p className="text-sm font-medium">{client.mobile}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-100 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2 text-[#1e3a5f]">
              <Building2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Bank Details
              </span>
            </div>
            <p className="text-sm font-semibold">
              {client.bankName || "HDFC Bank"}
            </p>
            <p className="text-xs text-slate-500">
              A/C: {client.accountNumber || "XXXX 9812"}
            </p>
          </div>
          <div className="border border-slate-100 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2 text-[#1e3a5f]">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Nominee
              </span>
            </div>
            <p className="text-sm font-semibold">
              {client.nomineeName || "Sita Sharma"}
            </p>
            <p className="text-xs text-slate-500">
              {client.nomineeRelationship || "Spouse"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            className="flex-1 bg-[#1e3a5f] hover:bg-[#152a45]"
            onClick={() => {
              onClose();
              onViewFullProfile(client);
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            Full Profile
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-slate-200 text-slate-700 font-bold"
            onClick={() => {
              onClose();
              onEdit(client);
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ClientManagement;
