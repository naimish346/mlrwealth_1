import { useState, useRef, useMemo } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input, Select } from "../../ui/input";
import { Badge } from "../../ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import {
  Search,
  Plus,
  Download,
  Grid,
  List,
  MoreVertical,
  Filter,
  Clock,
  GripVertical,
  Eye,
  Edit,
  UserPlus,
  MessageSquare,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { useLeadStore } from "../../../store/useLeadStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../ui/dialog";
import { cn } from "../../../lib/utils";

const mockLeads = [
  {
    id: "L001",
    name: "Rajiv Malhotra",
    company: "Malhotra Group",
    stage: "New",
    value: 5000000,
    source: "Website",
    date: "25-10-2023",
    rm: "Priya Sharma",
  },
  {
    id: "L002",
    name: "Anita Desai",
    company: "Tech Innovators",
    stage: "Follow-up",
    value: 2500000,
    source: "Referral",
    date: "24-10-2023",
    rm: "Rajesh Kumar",
  },
  {
    id: "L003",
    name: "Vikram Singh",
    company: "Singh Enterprises",
    stage: "Prospect",
    value: 12000000,
    source: "Event",
    date: "22-10-2023",
    rm: "Priya Sharma",
  },
  {
    id: "L004",
    name: "Neha Gupta",
    company: "Gupta Holdings",
    stage: "Negotiation",
    value: 7500000,
    source: "Cold Call",
    date: "20-10-2023",
    rm: "Sanjay Desai",
  },
  {
    id: "L005",
    name: "Arjun Reddy",
    company: "Reddy Labs",
    stage: "New",
    value: 3000000,
    source: "Website",
    date: "25-10-2023",
    rm: "Rajesh Kumar",
  },
];

const stages = ["New", "Follow-up", "Prospect", "Negotiation", "Won", "Lost"];

const formatCurrency = (value) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
};

export const LeadList = ({ onNavigate, viewModeProps, setViewModeProps }) => {
  const { leads, updateLeadStage } = useLeadStore();
  const viewMode = viewModeProps || "table";
  const setViewMode = setViewModeProps || (() => {});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [filterRM, setFilterRM] = useState("all");
  const [dragOverStage, setDragOverStage] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [deleteLeadId, setDeleteLeadId] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };
  const draggedLeadRef = useRef(null);

  const handleDragStart = (e, leadId) => {
    // Store the lead ID in ref as fallback
    draggedLeadRef.current = leadId;
    setDraggingId(leadId);

    // Set data transfer
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", leadId);
  };

  const handleDragEnd = (e) => {
    setDraggingId(null);
    setDragOverStage(null);
    draggedLeadRef.current = null;
  };

  const handleDragOver = (e, stage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Only clear dragOverStage if we're actually leaving the column
    const relatedTarget = e.relatedTarget;
    const currentTarget = e.currentTarget;

    if (!currentTarget.contains(relatedTarget)) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    setDragOverStage(null);

    // Try to get leadId from dataTransfer, fallback to ref
    let leadId = e.dataTransfer.getData("text/plain");
    if (!leadId) {
      leadId = draggedLeadRef.current;
    }

    if (!leadId) return;

    updateLeadStage(leadId, targetStage);
    toast.success(`Lead moved to ${targetStage}`);
    setDraggingId(null);
    draggedLeadRef.current = null;
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource =
      filterSource === "all" || lead.source === filterSource;
    const matchesRM = filterRM === "all" || lead.rm === filterRM;

    return matchesSearch && matchesSource && matchesRM;
  });

  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      const direction = sortConfig.direction === "asc" ? 1 : -1;
      const key = sortConfig.key;

      if (key === "date") {
        // Assuming DD-MM-YYYY format
        const [d1, m1, y1] = a.date.split("-").map(Number);
        const [d2, m2, y2] = b.date.split("-").map(Number);
        const dateA = new Date(y1, m1 - 1, d1);
        const dateB = new Date(y2, m2 - 1, d2);
        return (dateA - dateB) * direction;
      }

      const valA = a[key];
      const valB = b[key];

      if (typeof valA === "string") {
        return (valA || "").localeCompare(valB || "") * direction;
      }

      if (typeof valA === "number") {
        return (valA - valB) * direction;
      }

      return 0;
    });
  }, [filteredLeads, sortConfig]);

  const renderKanban = () => {
    const stageStyles = {
      New: { color: "bg-slate-50/50", dot: "bg-slate-400" },
      Contacted: { color: "bg-blue-50/30", dot: "bg-blue-500" },
      Qualified: { color: "bg-indigo-50/30", dot: "bg-indigo-500" },
      Proposal: { color: "bg-amber-50/30", dot: "bg-amber-500" },
      Negotiation: { color: "bg-orange-50/30", dot: "bg-orange-500" },
      Won: { color: "bg-emerald-50/30", dot: "bg-emerald-500" },
      Lost: { color: "bg-rose-50/30", dot: "bg-rose-500" },
    };

    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 items-start">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage);
            const isOver = dragOverStage === stage;
            const style = stageStyles[stage] || stageStyles.New;

            return (
              <div
                key={stage}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
                className={`flex-shrink-0 w-80 rounded-xl flex flex-col transition-all duration-200 ${style.color} ${
                  isOver ? "ring-2 ring-indigo-400 shadow-lg scale-[1.02]" : ""
                }`}
              >
                {/* Column Header */}
                <div className="p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                    <h3 className="font-semibold text-gray-900">{stage}</h3>
                    <span className="bg-white/60 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                {/* Column Body */}
                <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => {
                        if (draggingId === lead.id) return;
                        onNavigate && onNavigate("profile");
                      }}
                      className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:shadow-md transition-all relative group flex flex-col ${
                        draggingId === lead.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-slate-50 text-slate-600 border-slate-200"
                        >
                          {lead.source}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="text-gray-400 hover:text-gray-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-gray-100 focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigate && onNavigate("profile", lead.id);
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2 text-slate-400" />{" "}
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteLeadId(lead.id);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Lead
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <h4 className="text-sm font-medium text-gray-900 mb-1 leading-snug">
                        {lead.name}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {lead.company}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="font-semibold text-emerald-600">
                            {formatCurrency(lead.value)}
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{lead.date}</span>
                          </div>
                        </div>

                        <div
                          className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold uppercase ring-2 ring-white"
                          title={lead.rm}
                        >
                          {lead.rm.charAt(0)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-400">
                      Drop leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTable = () => {
    return (
      <Card className="rounded-xl border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#f8fafc] border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 py-3 font-medium text-slate-500">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center hover:text-indigo-600 transition-colors uppercase text-xs font-bold tracking-wider"
                >
                  Lead Info
                  <ArrowUpDown
                    className={cn(
                      "w-3 h-3 ml-1 opacity-50",
                      sortConfig.key === "name" && "opacity-100",
                    )}
                  />
                </button>
              </TableHead>
              <TableHead className="px-4 py-3 font-medium text-slate-500 uppercase text-xs font-bold tracking-wider">
                Contact Info
              </TableHead>
              <TableHead className="px-4 py-3 font-medium text-slate-500">
                <button
                  onClick={() => handleSort("stage")}
                  className="flex items-center hover:text-indigo-600 transition-colors uppercase text-xs font-bold tracking-wider"
                >
                  Stage
                  <ArrowUpDown
                    className={cn(
                      "w-3 h-3 ml-1 opacity-50",
                      sortConfig.key === "stage" && "opacity-100",
                    )}
                  />
                </button>
              </TableHead>
              <TableHead className="px-4 py-3 font-medium text-slate-500">
                <button
                  onClick={() => handleSort("value")}
                  className="flex items-center hover:text-indigo-600 transition-colors uppercase text-xs font-bold tracking-wider"
                >
                  Lead Value
                  <ArrowUpDown
                    className={cn(
                      "w-3 h-3 ml-1 opacity-50",
                      sortConfig.key === "value" && "opacity-100",
                    )}
                  />
                </button>
              </TableHead>
              <TableHead className="px-4 py-3 font-medium text-slate-500">
                <button
                  onClick={() => handleSort("source")}
                  className="flex items-center hover:text-indigo-600 transition-colors uppercase text-xs font-bold tracking-wider"
                >
                  Source
                  <ArrowUpDown
                    className={cn(
                      "w-3 h-3 ml-1 opacity-50",
                      sortConfig.key === "source" && "opacity-100",
                    )}
                  />
                </button>
              </TableHead>
              <TableHead className="px-4 py-3 font-medium text-slate-500">
                <button
                  onClick={() => handleSort("rm")}
                  className="flex items-center hover:text-indigo-600 transition-colors uppercase text-xs font-bold tracking-wider"
                >
                  Assigned RM
                  <ArrowUpDown
                    className={cn(
                      "w-3 h-3 ml-1 opacity-50",
                      sortConfig.key === "rm" && "opacity-100",
                    )}
                  />
                </button>
              </TableHead>
              <TableHead className="px-4 py-3 font-medium text-slate-500">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center hover:text-indigo-600 transition-colors uppercase text-xs font-bold tracking-wider"
                >
                  Added On
                  <ArrowUpDown
                    className={cn(
                      "w-3 h-3 ml-1 opacity-50",
                      sortConfig.key === "date" && "opacity-100",
                    )}
                  />
                </button>
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider h-11 text-center pl-10">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {sortedLeads.map((lead) => (
              <TableRow
                key={lead.id}
                onClick={() => onNavigate && onNavigate("profile")}
                className="cursor-pointer hover:bg-slate-50 transition-colors group"
              >
                <TableCell className="py-4">
                  <div className="font-semibold text-slate-800 text-sm mb-0.5">
                    {lead.name}
                  </div>
                  <div className="text-xs text-slate-500">{lead.company}</div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="font-semibold text-slate-800 text-sm mb-0.5">
                    {lead.phone}
                  </div>
                  <div className="text-xs text-slate-500">{lead.email}</div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    className={`font-medium ${
                      lead.stage === "New"
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : lead.stage === "Negotiation"
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : lead.stage === "Follow-up"
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : lead.stage === "Prospect"
                              ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                    variant="outline"
                  >
                    {lead.stage}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 pl-4 font-semibold text-slate-700 text-sm">
                  {formatCurrency(lead.value)}
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm text-slate-600 capitalize">
                    {lead.source}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm text-slate-600">{lead.rm}</span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-sm text-slate-500">{lead.date}</span>
                </TableCell>
                <TableCell
                  className="py-4 text-center pr-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => onNavigate && onNavigate("profile")}
                      title="View Profile"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={() => onNavigate && onNavigate("conversion")}
                      title="Convert to Client"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => setDeleteLeadId(lead.id)}
                      title="Delete Lead"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 space-y-4">
      {/* Filters & Actions Header */}
      <div className="shrink-0 px-0">
        <div className="flex items-center gap-3 w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <Input
            icon={<Search className="w-5 h-5" />}
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <div className="w-36 shrink-0">
            <Select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              options={[
                { value: "all", label: "All Sources" },
                { value: "web", label: "Web" },
                { value: "email", label: "Email" },
                { value: "web form", label: "Web Form" },
                { value: "phone", label: "Phone" },
                { value: "direct", label: "Direct" },
              ]}
            />
          </div>
          <div className="w-36 shrink-0">
            <Select
              value={filterRM}
              onChange={(e) => setFilterRM(e.target.value)}
              options={[
                { value: "all", label: "All RMs" },
                { value: "Priya Sharma", label: "Priya Sharma" },
                { value: "Rajesh Kumar", label: "Rajesh Kumar" },
                { value: "Sanjay Desai", label: "Sanjay Desai" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {viewMode === "table" ? (
          <div className="overflow-y-auto pr-1 pb-4">{renderTable()}</div>
        ) : (
          renderKanban()
        )}
      </div>

      <Dialog
        open={!!deleteLeadId}
        onOpenChange={(open) => !open && setDeleteLeadId(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Delete Lead
            </DialogTitle>
            <DialogDescription className="py-2">
              Are you sure you want to delete this lead? This action cannot be
              undone and will remove all associated data, activities, and
              documents.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteLeadId(null)}
              className="mt-2 sm:mt-0"
            >
              Cancel
            </Button>
            <Button
              className="bg-rose-600 text-white hover:bg-rose-700 font-medium"
              onClick={() => {
                // In a real app, call a delete lead function on the store here
                // e.g: deleteLead(deleteLeadId)
                toast.success("Lead deleted successfully");
                setDeleteLeadId(null);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
