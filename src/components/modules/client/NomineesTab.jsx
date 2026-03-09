import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Baby,
  X,
  Users,
  Pencil,
  Trash2,
  Edit2,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input, Select } from "../../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../ui/dialog";

/* ─── constants ─────────────────────────────────────────── */
const PALETTE = [
  "#1e3a5f",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

const fieldVariant = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const emptyForm = {
  name: "",
  relationship: "Spouse",
  percentage: "",
  pan: "",
  dob: "",
  isMinor: false,
  guardianName: "",
};

/* ─── MiniDonut ─────────────────────────────────────────── */
function MiniDonut({ data, size = 170 }) {
  const cx = size / 2,
    cy = size / 2,
    r = size / 2 - 16;
  const total = data.reduce((s, d) => s + Number(d.value), 0) || 1;
  let offset = -Math.PI / 2;

  const slices = data.map((d, i) => {
    const angle = (Number(d.value) / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(offset);
    const y1 = cy + r * Math.sin(offset);
    offset += angle;
    const x2 = cx + r * Math.cos(offset);
    const y2 = cy + r * Math.sin(offset);
    const large = angle > Math.PI ? 1 : 0;
    return {
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
      color: PALETTE[i % PALETTE.length],
      label: d.label,
      value: d.value,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path
          key={i}
          d={s.path}
          fill={s.color}
          stroke="white"
          strokeWidth="2.5"
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.54} fill="white" />
    </svg>
  );
}

/* ─── NomineeCard ─────────────────────────────────────────── */
function NomineeCard({ nominee, index, onEdit, onDelete }) {
  const color = PALETTE[index % PALETTE.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className="relative bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all overflow-hidden group"
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: color }}
      />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + info */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold"
              style={{ backgroundColor: color }}
            >
              {nominee.name?.charAt(0) || "N"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-900 text-sm leading-tight">
                  {nominee.name}
                </p>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: `${color}18`, color }}
                >
                  {nominee.relationship}
                </span>
                {nominee.isMinor && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-50 text-pink-600 flex items-center gap-0.5 shrink-0">
                    <Baby className="w-2.5 h-2.5" /> Minor
                  </span>
                )}
              </div>
              {nominee.guardianName && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Guardian:{" "}
                  <span className="font-semibold text-slate-500">
                    {nominee.guardianName}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Right: allocation + actions */}
          <div className="flex items-start gap-2 shrink-0">
            <div className="text-right">
              <p
                className="text-2xl font-black leading-tight"
                style={{ color }}
              >
                {nominee.percentage}%
              </p>
              <p className="text-[10px] text-slate-400 font-medium">of total</p>
            </div>
            {/* Edit / Delete — always visible */}
            <div className="flex flex-col gap-1 pt-1">
              <button
                onClick={() => onEdit(nominee)}
                className="p-1.5 rounded-lg text-amber-600 transition-colors"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(nominee.id)}
                className="p-1.5 rounded-lg text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${nominee.percentage}%` }}
              transition={{
                delay: index * 0.05 + 0.2,
                duration: 0.5,
                ease: "easeOut",
              }}
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
        </div>

        {/* Meta row */}
        {(nominee.pan || nominee.dob) && (
          <div className="mt-2.5 flex items-center gap-4 text-[10px] text-slate-400">
            {nominee.pan && (
              <span className="flex items-center gap-1">
                <span className="font-bold uppercase tracking-wide">PAN</span>
                <span className="font-mono font-semibold text-slate-600">
                  {nominee.pan}
                </span>
              </span>
            )}
            {nominee.dob && (
              <span className="flex items-center gap-1">
                <span className="font-bold uppercase tracking-wide">DOB</span>
                <span className="font-semibold text-slate-600">
                  {nominee.dob}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export const NomineesTab = ({ client }) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = add mode
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [nominees, setNominees] = useState(client.nominees || []);

  const totalAllocation = nominees.reduce(
    (s, n) => s + Number(n.percentage),
    0,
  );
  const remaining = 100 - totalAllocation;
  const isEditing = editingId !== null;

  /* open for ADD */
  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowDrawer(true);
  };

  /* open for EDIT */
  const openEdit = (nominee) => {
    setEditingId(nominee.id);
    setForm({
      name: nominee.name,
      relationship: nominee.relationship,
      percentage: String(nominee.percentage),
      pan: nominee.pan || "",
      dob: nominee.dob || "",
      isMinor: nominee.isMinor || false,
      guardianName: nominee.guardianName || "",
    });
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.percentage) return;
    const payload = {
      name: form.name.trim(),
      relationship: form.relationship,
      percentage: Number(form.percentage),
      pan: form.pan.trim(),
      dob: form.dob,
      isMinor: form.isMinor,
      guardianName: form.guardianName.trim(),
    };

    if (isEditing) {
      setNominees((prev) =>
        prev.map((n) => (n.id === editingId ? { ...n, ...payload } : n)),
      );
      toast.success("Nominee updated successfully");
    } else {
      setNominees((prev) => [...prev, { id: `nom_${Date.now()}`, ...payload }]);
      toast.success("New nominee added");
    }
    closeDrawer();
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      setNominees((prev) => prev.filter((n) => n.id !== deleteConfirmId));
      toast.success("Nominee removed");
      setDeleteConfirmId(null);
    }
  };

  /* remaining % — exclude the nominee being edited */
  const editingNominee = nominees.find((n) => n.id === editingId);
  const allocatedExcl = nominees
    .filter((n) => n.id !== editingId)
    .reduce((s, n) => s + Number(n.percentage), 0);
  const drawerRemaining = 100 - allocatedExcl;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Nominees ({nominees.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage investment allocation nominees
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90 shadow-sm"
          onClick={openAdd}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Nominee
        </Button>
      </div>

      {nominees.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Chart column */}
          <Card className="lg:w-72 shrink-0">
            <CardContent className="p-5 flex flex-col items-center gap-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Allocation Split
              </p>
              <MiniDonut
                data={nominees.map((n) => ({
                  label: n.name,
                  value: n.percentage,
                }))}
              />
              {/* Legend */}
              <div className="w-full space-y-2">
                {nominees.map((n, i) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                      />
                      <span className="text-slate-600 font-medium truncate max-w-[100px]">
                        {n.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800">
                      {n.percentage}%
                    </span>
                  </div>
                ))}
              </div>
              {/* Total indicator */}
              <div
                className={`w-full text-center text-[11px] font-bold py-1.5 rounded-lg ${
                  totalAllocation === 100
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {totalAllocation === 100
                  ? "✓ Fully Allocated"
                  : `⚠ ${totalAllocation}% / 100%`}
              </div>
            </CardContent>
          </Card>

          {/* Nominee cards */}
          <div className="flex-1 space-y-3">
            <AnimatePresence>
              {nominees.map((nominee, i) => (
                <NomineeCard
                  key={nominee.id}
                  nominee={nominee}
                  index={i}
                  onEdit={openEdit}
                  onDelete={() => setDeleteConfirmId(nominee.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-700 text-base">
            No nominees added yet
          </p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Add nominees to define how your investments should be allocated.
          </p>
          <Button
            className="mt-5 bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90 shadow-sm"
            onClick={openAdd}
          >
            <Plus className="w-4 h-4 mr-2" /> Add First Nominee
          </Button>
        </div>
      )}

      {/* ── Drawer (Add / Edit) — portalled ── */}
      {createPortal(
        <AnimatePresence>
          {showDrawer && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                onClick={closeDrawer}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col"
              >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
                      {isEditing ? (
                        <Pencil className="w-4 h-4 text-white" />
                      ) : (
                        <Users className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {isEditing ? "Edit Nominee" : "Add Nominee"}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {drawerRemaining > 0
                          ? `${drawerRemaining}% allocation available`
                          : "Allocation is full"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Allocation bar */}
                <div className="px-6 py-3 border-b border-slate-100 bg-white">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1.5">
                    <span>ALLOCATED</span>
                    <span
                      className={
                        allocatedExcl >= 100
                          ? "text-red-500"
                          : "text-emerald-600"
                      }
                    >
                      {drawerRemaining > 0
                        ? `${drawerRemaining}% left`
                        : "100% — no room"}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${allocatedExcl >= 100 ? "bg-red-400" : "bg-[#1e3a5f]"}`}
                      style={{ width: `${Math.min(allocatedExcl, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Form */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.05,
                      },
                    },
                  }}
                  className="flex-1 overflow-y-auto p-6 space-y-5"
                >
                  <motion.div variants={fieldVariant}>
                    <Input
                      label="Full Name"
                      placeholder="Enter nominee's full name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </motion.div>

                  <motion.div variants={fieldVariant}>
                    <Select
                      label="Relationship"
                      value={form.relationship}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, relationship: e.target.value }))
                      }
                      options={[
                        { value: "Spouse", label: "Spouse" },
                        { value: "Son", label: "Son" },
                        { value: "Daughter", label: "Daughter" },
                        { value: "Father", label: "Father" },
                        { value: "Mother", label: "Mother" },
                        { value: "Brother", label: "Brother" },
                        { value: "Sister", label: "Sister" },
                        { value: "Other", label: "Other" },
                      ]}
                    />
                  </motion.div>

                  <motion.div variants={fieldVariant}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Allocation % <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={drawerRemaining}
                        placeholder={`Max ${drawerRemaining}%`}
                        value={form.percentage}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, percentage: e.target.value }))
                        }
                        className="w-full h-10 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                        %
                      </span>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div variants={fieldVariant}>
                      <Input
                        label="PAN Number"
                        placeholder="ABCDE1234F"
                        value={form.pan}
                        maxLength={10}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            pan: e.target.value.toUpperCase(),
                          }))
                        }
                      />
                    </motion.div>
                    <motion.div variants={fieldVariant}>
                      <Input
                        label="Date of Birth"
                        type="date"
                        value={form.dob}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, dob: e.target.value }))
                        }
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    variants={fieldVariant}
                    className="flex items-center gap-3 p-3 bg-pink-50 border border-pink-100 rounded-lg cursor-pointer"
                    onClick={() =>
                      setForm((p) => ({ ...p, isMinor: !p.isMinor }))
                    }
                  >
                    <input
                      type="checkbox"
                      checked={form.isMinor}
                      readOnly
                      className="w-4 h-4 accent-pink-500 rounded pointer-events-none"
                    />
                    <label className="text-sm font-semibold text-pink-700 flex items-center gap-2 cursor-pointer">
                      <Baby className="w-4 h-4" /> This nominee is a minor
                    </label>
                  </motion.div>

                  <AnimatePresence>
                    {form.isMinor && (
                      <motion.div
                        key="guardian"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          label="Guardian Name"
                          placeholder="Full name of legal guardian"
                          value={form.guardianName}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              guardianName: e.target.value,
                            }))
                          }
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
                  <button
                    onClick={closeDrawer}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 8px 20px rgba(30,58,95,0.4)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="flex-1 px-6 py-2.5 text-sm font-semibold text-white bg-[#1e3a5f] rounded-lg shadow-sm"
                  >
                    {isEditing ? "Save Changes" : "Add Nominee"}
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Remove Nominee
            </DialogTitle>
            <DialogDescription className="py-2">
              Are you sure you want to remove this nominee from allocation? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              className="bg-rose-600 text-white hover:bg-rose-700 font-medium"
              onClick={handleDelete}
            >
              Remove Nominee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
