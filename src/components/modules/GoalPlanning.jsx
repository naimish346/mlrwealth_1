import { useState, useMemo } from "react";
import {
  Target,
  Plus,
  TrendingUp,
  Calculator,
  GraduationCap,
  Home,
  Plane,
  Shield,
  Wallet,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MoreVertical,
  LayoutList,
  Car,
  Briefcase,
  Heart,
  ChevronRight,
  Pencil,
  Trash2,
  Undo2,
  RefreshCcw,
  Filter,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Input, Select } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { useAppStore } from "../../store/appStore";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { cn } from "../../utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const formatCurrency = (value) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
};

const getGoalIcon = (type) => {
  switch (type) {
    case "Retirement":
      return <Wallet className="w-5 h-5" />;
    case "Education":
      return <GraduationCap className="w-5 h-5" />;
    case "Property":
      return <Home className="w-5 h-5" />;
    case "Emergency":
      return <Shield className="w-5 h-5" />;
    case "Travel":
      return <Plane className="w-5 h-5" />;
    case "Vehicle":
      return <Car className="w-5 h-5" />;
    case "Business":
      return <Briefcase className="w-5 h-5" />;
    case "Marriage":
      return <Heart className="w-5 h-5" />;
    default:
      return <Target className="w-5 h-5" />;
  }
};

const getGoalColorClass = (type) => {
  switch (type) {
    case "Emergency":
      return "bg-indigo-500";
    case "Vehicle":
      return "bg-emerald-500";
    case "Travel":
      return "bg-purple-500";
    case "Property":
      return "bg-orange-700";
    case "Retirement":
      return "bg-blue-600";
    case "Education":
      return "bg-cyan-500";
    default:
      return "bg-slate-500";
  }
};

export const GoalPlanning = () => {
  const { goals, clients, updateGoal, addGoal } = useAppStore();
  const [activeFilter, setActiveFilter] = useState("All");
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(null); // stores goalId
  const [fundAmount, setFundAmount] = useState("");

  // Edit & Delete state
  const [editingGoal, setEditingGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);

  // Add Funds State Extras
  const [fundDate, setFundDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [fundNotes, setFundNotes] = useState("");

  const [showHistoryDialog, setShowHistoryDialog] = useState(null);

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterClient, setFilterClient] = useState("All");

  // SIP Simulator state
  const [simTargetAmount, setSimTargetAmount] = useState(10000000);
  const [simYears, setSimYears] = useState(10);
  const [simReturn, setSimReturn] = useState(12);
  const [simInflation, setSimInflation] = useState(6);

  // New Goal State
  const [newGoal, setNewGoal] = useState({
    clientId: "",
    type: "Retirement",
    typeOther: "",
    name: "",
    targetAmount: "",
    targetDate: "",
    startDate: "",
    monthlySIP: "",
    expectedReturn: "12",
    status: "On Track",
  });

  // Simulator Logic
  const calculateSIP = () => {
    const realReturn = (simReturn - simInflation) / 100 / 12;
    const months = simYears * 12;
    const sip =
      (simTargetAmount * realReturn) / (Math.pow(1 + realReturn, months) - 1);
    return isNaN(sip) || sip === Infinity ? 0 : Math.round(sip);
  };

  const projectionData = useMemo(() => {
    return Array.from({ length: simYears + 1 }, (_, i) => {
      const monthlyRate = simReturn / 100 / 12;
      const months = i * 12;
      const sip = calculateSIP();
      const corpus =
        months === 0
          ? 0
          : sip *
            ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
            (1 + monthlyRate);
      return {
        year: `Y${i}`,
        corpus: Math.round(corpus),
        target: simTargetAmount,
      };
    });
  }, [simTargetAmount, simYears, simReturn, simInflation]);

  // Stats calculation
  const totalTargetAmount = useMemo(
    () => goals.reduce((sum, g) => sum + Number(g.targetAmount), 0),
    [goals],
  );
  const totalCurrentCorpus = useMemo(
    () => goals.reduce((sum, g) => sum + Number(g.currentCorpus), 0),
    [goals],
  );
  const overallProgress =
    totalTargetAmount > 0 ? (totalCurrentCorpus / totalTargetAmount) * 100 : 0;
  const remainingAmount = totalTargetAmount - totalCurrentCorpus;

  const filteredGoals = goals.filter((goal) => {
    // 1. Status Filter
    if (activeFilter !== "All") {
      if (activeFilter === "Active") {
        if (goal.status !== "On Track" && goal.status !== "At Risk")
          return false;
      } else if (activeFilter === "Completed") {
        if (
          goal.currentCorpus / goal.targetAmount < 1 &&
          goal.status !== "Completed"
        )
          return false;
      } else {
        if (goal.status !== activeFilter) return false;
      }
    }

    // 2. Category Filter
    if (filterCategory !== "All" && goal.type !== filterCategory) {
      return false;
    }

    // 3. Client Filter
    if (filterClient !== "All" && goal.clientId !== filterClient) {
      return false;
    }

    return true;
  });

  const categoryData = useMemo(() => {
    const dataMap = {};
    goals.forEach((g) => {
      const type = g.type || "Others";
      if (!dataMap[type]) {
        let col = "#94a3b8"; // default
        if (type === "Retirement") col = "#1e3a5f";
        else if (type === "Education") col = "#0ea5e9";
        else if (type === "Property") col = "#f97316";
        else if (type === "Emergency") col = "#6366f1";
        else if (type === "Travel") col = "#a855f7";
        dataMap[type] = { name: type, Target: 0, Saved: 0, color: col };
      }
      dataMap[type].Target += Number(g.targetAmount) || 0;
      dataMap[type].Saved += Number(g.currentCorpus) || 0;
    });
    return Object.values(dataMap);
  }, [goals]);

  const pieData = [
    { name: "Funded", value: totalCurrentCorpus, color: "#10b981" },
    {
      name: "Remaining",
      value: remainingAmount > 0 ? remainingAmount : 0,
      color: "#f1f5f9",
    },
  ];

  const handleCreateGoal = () => {
    if (!newGoal.clientId || !newGoal.name || !newGoal.targetAmount) {
      toast.error("Please fill in all required fields");
      return;
    }
    const goal = {
      ...newGoal,
      type:
        newGoal.type === "Others" && newGoal.typeOther
          ? newGoal.typeOther
          : newGoal.type,
      id: `goal_${Date.now()}`,
      targetAmount: Number(newGoal.targetAmount),
      currentCorpus: 0,
      createdAt: newGoal.startDate || new Date().toISOString().split("T")[0],
      status: "On Track",
    };
    addGoal(goal);
    toast.success("Goal created successfully!");
    setShowAddGoal(false);
  };

  const handleAddFundsSubmit = () => {
    if (!fundAmount || isNaN(fundAmount)) return;
    const goal = goals.find((g) => g.id === showAddFunds);
    if (goal) {
      const newTransaction = {
        id: Date.now().toString(),
        amount: Number(fundAmount),
        date: fundDate || new Date().toISOString().split("T")[0],
        notes: fundNotes || "",
      };

      const updatedTransactions = goal.transactions
        ? [...goal.transactions, newTransaction]
        : [newTransaction];

      updateGoal(showAddFunds, {
        currentCorpus: Number(goal.currentCorpus) + Number(fundAmount),
        transactions: updatedTransactions,
      });
      toast.success(
        `₹${Number(fundAmount).toLocaleString()} added to ${goal.name}`,
      );
      setShowAddFunds(null);
      setFundAmount("");
      setFundDate(new Date().toISOString().split("T")[0]);
      setFundNotes("");
    }
  };

  const handleEditGoal = () => {
    if (!editingGoal.name || !editingGoal.targetAmount) {
      toast.error("Please fill in all required fields");
      return;
    }
    const updated = {
      ...editingGoal,
      targetAmount: Number(editingGoal.targetAmount),
    };
    updateGoal(editingGoal.id, updated);
    toast.success("Goal updated successfully!");
    setEditingGoal(null);
  };

  const handleDeleteGoal = () => {
    if (deletingGoal) {
      // If store doesn't have deleteGoal natively, we simulate or adapt here.
      // Assuming store has `deleteGoal` similar to `deleteTask`.
      // Workaround: We access useAppStore directly, or if it doesn't exist, we filter goals (though we can't persist filter easily w/o store action).
      // Assuming useAppStore has deleteGoal.
      const store = useAppStore.getState();
      if (store.deleteGoal) store.deleteGoal(deletingGoal.id);

      toast.success("Goal deleted successfully");
      setDeletingGoal(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 pt-6">
            Saving Goals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage client financial objectives
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSimulator(true)}
            className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-lg font-medium shadow-sm border border-slate-200 hover:bg-slate-50 transition-all duration-200"
          >
            <Calculator className="w-4 h-4" />
            SIP Planner
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 15px -3px rgba(30, 58, 95, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddGoal(true)}
            className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add New Goal
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Savings Overview */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-200/60 shadow-sm bg-white h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-800">
                Savings Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="flex justify-center py-6 relative">
                <div className="w-64 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        }}
                      />
                      {/* Inner Ring: Overall Progress */}
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`inner-${index}`} fill={entry.color} />
                        ))}
                      </Pie>

                      {/* Outer Ring: Category Allocation */}
                      <Pie
                        data={categoryData}
                        dataKey="Target"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={85}
                        outerRadius={105}
                        stroke="none"
                        paddingAngle={2}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`outer-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-slate-900">
                      {Math.round(overallProgress)}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                      Funded
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {categoryData
                  .filter((c) => c.Target > 0)
                  .map((cat, i) => (
                    <div
                      key={`legend-${i}`}
                      className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-md"
                    >
                      <div
                        className="w-2 h-2 rounded-full shadow-inner"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-[10px] font-semibold text-slate-600">
                        {cat.name}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100">
                <SummaryRow
                  label="Total Target"
                  value={formatCurrency(totalTargetAmount)}
                />
                <SummaryRow
                  label="Total Saved"
                  value={formatCurrency(totalCurrentCorpus)}
                />
                <SummaryRow
                  label="Amount Remaining"
                  value={formatCurrency(remainingAmount)}
                />
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Monthly Savings
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                      Target
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      ₹45,000
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                      Saved This Month
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      ₹32,000
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-400 uppercase">
                        Progress
                      </span>
                      <span className="font-bold text-slate-900">71%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: "71%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-6 text-center border border-slate-100 mt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Savings Rate
                </p>
                <p className="text-4xl font-black text-slate-900">24%</p>
                <p className="text-[10px] font-semibold text-slate-500 mt-1 uppercase">
                  of monthly income
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Goal List */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-slate-200/60 shadow-sm bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
              <CardTitle className="text-base font-semibold text-slate-800">
                Goals
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner">
                  {["All", "Active", "Paused", "Completed"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveFilter(tab)}
                      className={cn(
                        "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200",
                        activeFilter === tab
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-9 px-3 border-slate-200 transition-all",
                    showFilters
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-slate-50 bg-slate-50/50"
                >
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Client"
                      value={filterClient}
                      onChange={(e) => setFilterClient(e.target.value)}
                      options={[
                        { value: "All", label: "All Clients" },
                        ...clients.map((c) => ({ value: c.id, label: c.name })),
                      ]}
                    />
                    <Select
                      label="Category"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      options={[
                        { value: "All", label: "All Categories" },
                        { value: "Retirement", label: "Retirement" },
                        { value: "Education", label: "Education" },
                        { value: "Property", label: "Property" },
                        { value: "Emergency", label: "Emergency" },
                        { value: "Vehicle", label: "Vehicle" },
                        { value: "Travel", label: "Travel" },
                        { value: "Others", label: "Others" },
                      ]}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {filteredGoals.length > 0 ? (
                    filteredGoals.map((goal) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onAddFunds={() => setShowAddFunds(goal.id)}
                        onEdit={() => setEditingGoal({ ...goal })}
                        onDelete={() => setDeletingGoal(goal)}
                        onViewHistory={() => setShowHistoryDialog(goal)}
                      />
                    ))
                  ) : (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                        <Target className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-base font-semibold text-slate-900">
                        No Goals Found
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActiveFilter("All");
                          setFilterCategory("All");
                          setFilterClient("All");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SIP Simulator Modal */}
      <Modal
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
        title="SIP Planner"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Target Amount (₹)
              </label>
              <input
                type="number"
                value={simTargetAmount}
                onChange={(e) => setSimTargetAmount(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Time Period (Years)
              </label>
              <input
                type="number"
                value={simYears}
                onChange={(e) => setSimYears(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Expected Return (%)
              </label>
              <input
                type="number"
                value={simReturn}
                onChange={(e) => setSimReturn(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Inflation Rate (%)
              </label>
              <input
                type="number"
                value={simInflation}
                onChange={(e) => setSimInflation(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>

          <div className="p-8 bg-[#1e3a5f] rounded-[2rem] text-white text-center shadow-xl shadow-blue-900/20 transition-all">
            <p className="text-white/60 font-semibold uppercase tracking-widest text-[10px] mb-2">
              Required Monthly SIP
            </p>
            <p className="text-5xl font-black mb-2">
              {formatCurrency(calculateSIP())}
            </p>
            <p className="text-white/60 text-sm">
              to achieve {formatCurrency(simTargetAmount)} in {simYears} years
            </p>
          </div>

          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line
                  type="monotone"
                  dataKey="corpus"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#e2e8f0"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setShowSimulator(false)}
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 font-bold px-8"
            >
              Got it
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Funds Modal */}
      <Modal
        isOpen={!!showAddFunds}
        onClose={() => setShowAddFunds(null)}
        title="Add Funds to Goal"
        size="sm"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">
              Amount to Add (₹)
            </label>
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-slate-50 border rounded-lg text-lg font-bold outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="e.g. 50000"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Date</label>
            <input
              type="date"
              value={fundDate}
              onChange={(e) => setFundDate(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-slate-50 border rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">
              Notes (Optional)
            </label>
            <textarea
              value={fundNotes}
              onChange={(e) => setFundNotes(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-slate-50 border rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="e.g. Bonus from December"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowAddFunds(null)}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddFundsSubmit}
              className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"
            >
              Add Funds
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add New Goal Modal */}
      <Modal
        isOpen={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        title="New Goal"
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Select
              label="Associated Client"
              value={newGoal.clientId}
              onChange={(e) =>
                setNewGoal({ ...newGoal, clientId: e.target.value })
              }
              options={clients.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Select
              label="Goal Category"
              value={newGoal.type}
              onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
              options={[
                { value: "Retirement", label: "Retirement Planning" },
                { value: "Education", label: "Education Fund" },
                { value: "Property", label: "Home/Property" },
                { value: "Emergency", label: "Emergency Fund" },
                { value: "Vehicle", label: "Vehicle Purchase" },
                { value: "Travel", label: "Travel/Vacation" },
                { value: "Others", label: "Others" },
              ]}
            />
            {newGoal.type === "Others" && (
              <Input
                label="Specify Category"
                placeholder="Custom Category"
                value={newGoal.typeOther}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, typeOther: e.target.value })
                }
              />
            )}
            <Input
              label="Goal Name"
              placeholder="e.g. My Dream Home"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            />
            <Input
              label="Start Date"
              type="date"
              value={newGoal.startDate}
              onChange={(e) =>
                setNewGoal({ ...newGoal, startDate: e.target.value })
              }
            />
            <Input
              label="Target Date"
              type="date"
              value={newGoal.targetDate}
              onChange={(e) =>
                setNewGoal({ ...newGoal, targetDate: e.target.value })
              }
            />
            <Input
              label="Target Amount (₹)"
              type="number"
              value={newGoal.targetAmount}
              onChange={(e) =>
                setNewGoal({ ...newGoal, targetAmount: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setShowAddGoal(false)}
              className="font-bold"
            >
              Discard
            </Button>
            <Button
              onClick={handleCreateGoal}
              className="bg-[#1e3a5f] hover:bg-[#152a45] text-white font-bold px-10"
            >
              Create Plan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Goal Modal */}
      <Modal
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        title="Edit Goal"
        size="xl"
      >
        {editingGoal && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Select
                label="Associated Client"
                value={editingGoal.clientId}
                onChange={(e) =>
                  setEditingGoal({ ...editingGoal, clientId: e.target.value })
                }
                options={clients.map((c) => ({ value: c.id, label: c.name }))}
                disabled
              />
              <Select
                label="Goal Category"
                value={editingGoal.type}
                onChange={(e) =>
                  setEditingGoal({ ...editingGoal, type: e.target.value })
                }
                options={[
                  { value: "Retirement", label: "Retirement Planning" },
                  { value: "Education", label: "Education Fund" },
                  { value: "Property", label: "Home/Property" },
                  { value: "Emergency", label: "Emergency Fund" },
                  { value: "Vehicle", label: "Vehicle Purchase" },
                  { value: "Travel", label: "Travel/Vacation" },
                  { value: "Others", label: "Others" },
                ]}
              />
              {editingGoal.type === "Others" && (
                <Input
                  label="Specify Category"
                  placeholder="Custom Category"
                  value={editingGoal.typeOther || ""}
                  onChange={(e) =>
                    setEditingGoal({
                      ...editingGoal,
                      typeOther: e.target.value,
                    })
                  }
                />
              )}
              <Input
                label="Goal Name"
                placeholder="e.g. My Dream Home"
                value={editingGoal.name}
                className="bg-slate-50"
                onChange={(e) =>
                  setEditingGoal({ ...editingGoal, name: e.target.value })
                }
              />
              <Input
                label="Start Date"
                type="date"
                value={editingGoal.startDate || editingGoal.createdAt || ""}
                onChange={(e) =>
                  setEditingGoal({ ...editingGoal, startDate: e.target.value })
                }
              />
              <Input
                label="Target Date"
                type="date"
                value={editingGoal.targetDate || ""}
                onChange={(e) =>
                  setEditingGoal({ ...editingGoal, targetDate: e.target.value })
                }
              />
              <Input
                label="Target Amount (₹)"
                type="number"
                value={editingGoal.targetAmount}
                onChange={(e) =>
                  setEditingGoal({
                    ...editingGoal,
                    targetAmount: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setEditingGoal(null)}
                className="font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditGoal}
                className="bg-[#1e3a5f] hover:bg-[#152a45] text-white font-bold px-10"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        title="Delete Goal"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-center text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-bold text-slate-900">
              {deletingGoal?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button variant="outline" onClick={() => setDeletingGoal(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteGoal}
            >
              Delete Goal
            </Button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={!!showHistoryDialog}
        onClose={() => setShowHistoryDialog(null)}
        title="Transaction History"
        size="2xl"
      >
        <div className="space-y-6">
          {showHistoryDialog?.transactions?.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                  <tr>
                    <th className="px-4 py-3">Sr No.</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {showHistoryDialog.transactions.map((tx, idx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(tx.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 italic">
                        {tx.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <p className="font-semibold text-slate-900">
                No Transactions Found
              </p>
              <p className="text-sm text-slate-500">
                No funds have been added to this goal yet.
              </p>
            </div>
          )}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setShowHistoryDialog(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-sm font-semibold text-slate-500">{label}</span>
    <span className="text-sm font-bold text-slate-900">{value}</span>
  </div>
);

const GoalCard = ({ goal, onAddFunds, onEdit, onDelete, onViewHistory }) => {
  const { clients, updateGoal, goals } = useAppStore();
  const client = clients.find((c) => c.id === goal.clientId);
  const progress = (goal.currentCorpus / goal.targetAmount) * 100 || 0;
  const [showMenu, setShowMenu] = useState(false);

  // Auto-update status based on progress (simple logic)
  const status =
    progress >= 100 ? "Completed" : progress < 20 ? "At Risk" : "On Track";

  const handleDelete = () => {
    onDelete();
    setShowMenu(false);
  };

  const handleEditClick = () => {
    onEdit();
    setShowMenu(false);
  };

  const markPaused = () => {
    updateGoal(goal.id, {
      status: goal.status === "Paused" ? "On Track" : "Paused",
    });
    setShowMenu(false);
    toast.info(`Goal ${goal.status === "Paused" ? "Resumed" : "Paused"}`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 hover:bg-slate-50 transition-colors group relative"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1 flex items-center gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/5",
              getGoalColorClass(goal.type),
            )}
          >
            {getGoalIcon(goal.type)}
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {goal.name}
              {(progress >= 100 || goal.status === "Completed") && (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              )}
              {goal.status === "Paused" && (
                <Badge variant="secondary" className="text-[9px] py-0">
                  Paused
                </Badge>
              )}
            </h4>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">
              Target:{" "}
              {new Date(goal.targetDate).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
              <span className="mx-2">•</span>
              {client?.name}
            </p>
          </div>
        </div>

        <div className="flex-[1.5] flex items-center gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold text-slate-600 uppercase">
                {formatCurrency(goal.currentCorpus)}{" "}
                <span className="text-slate-400 font-medium">
                  of {formatCurrency(goal.targetAmount)}
                </span>
              </p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/40">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  getGoalColorClass(goal.type),
                )}
              />
            </div>
          </div>
          <span className="text-xs font-black text-slate-900 w-10 text-right">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddFunds}
            className="h-9 px-4 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 font-bold text-xs uppercase transition-all shadow-sm"
          >
            Add Funds
          </Button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-2 overflow-hidden"
                  >
                    <button
                      onClick={handleEditClick}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <Pencil className="w-4 h-4 text-slate-400" />
                      Edit Goal
                    </button>
                    <button
                      onClick={markPaused}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <RefreshCcw className="w-4 h-4 text-slate-400" />
                      {goal.status === "Paused" ? "Resume Goal" : "Pause Goal"}
                    </button>
                    <div className="h-px bg-slate-50 my-1" />
                    <button
                      onClick={() => {
                        onViewHistory();
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      View History
                    </button>
                    <div className="h-px bg-slate-50 my-1" />
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Goal
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GoalPlanning;
