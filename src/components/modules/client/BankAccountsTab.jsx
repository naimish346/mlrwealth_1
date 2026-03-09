import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Star,
  Landmark,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  CreditCard,
  Pencil,
  Trash2,
  Edit2,
} from "lucide-react";
import { Button } from "../../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Input, Select } from "../../ui/input";
import { AlertBanner } from "../../ui/AlertBanner";
import { useAppStore } from "../../../store/appStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../ui/dialog";

const fieldVariant = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const emptyForm = {
  accountNumber: "",
  ifsc: "",
  accountType: "Savings",
  micr: "",
};

export const BankAccountsTab = ({ client }) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = add mode
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [ifscData, setIfscData] = useState(null);
  const [showAccNum, setShowAccNum] = useState(false);
  const [form, setForm] = useState(emptyForm);
  // local state so add/edit/delete update the list immediately
  const [accounts, setAccounts] = useState(client.bankAccounts || []);

  const { getClientPendingChanges } = useAppStore();
  const pendingChanges = getClientPendingChanges(client.id).filter(
    (c) => c.status === "Pending" && c.field?.startsWith("bank"),
  );
  const hasBankPending = accounts.some((b) => b.pendingApproval);
  const isEditing = editingId !== null;

  const handleIFSCChange = (value) => {
    const val = value.toUpperCase();
    setForm((p) => ({ ...p, ifsc: val }));
    setIfscData(
      val.length === 11
        ? { bankName: "HDFC Bank Ltd", branchName: "Fort Branch, Mumbai" }
        : null,
    );
  };

  /* open for ADD */
  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIfscData(null);
    setShowAccNum(false);
    setShowDrawer(true);
  };

  /* open for EDIT */
  const openEdit = (account) => {
    setEditingId(account.id);
    setForm({
      accountNumber: account.accountNumber || "",
      ifsc: account.ifsc || "",
      accountType: account.accountType || "Savings",
      micr: account.micr || "",
    });
    setShowAccNum(false);
    setIfscData(
      account.ifsc?.length === 11
        ? {
            bankName: account.bankName || "HDFC Bank Ltd",
            branchName: account.branchName || "Branch",
          }
        : null,
    );
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setEditingId(null);
    setIfscData(null);
    setShowAccNum(false);
    setForm(emptyForm);
  };

  const handleSave = () => {
    if (!form.accountNumber.trim() || !form.ifsc.trim()) return;
    const payload = {
      accountNumber: form.accountNumber.trim(),
      ifsc: form.ifsc.trim(),
      accountType: form.accountType,
      micr: form.micr.trim(),
      bankName: ifscData?.bankName || "Bank",
      branchName: ifscData?.branchName || "",
    };

    if (isEditing) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...payload } : a)),
      );
      toast.success("Bank account updated");
    } else {
      setAccounts((prev) => [
        ...prev,
        {
          id: `bank_${Date.now()}`,
          isPrimary: prev.length === 0, // first account auto primary
          ...payload,
        },
      ]);
      toast.success("New bank account added");
    }
    closeDrawer();
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      setAccounts((prev) => prev.filter((a) => a.id !== deleteConfirmId));
      toast.success("Bank account removed");
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Maker-Checker Banner */}
      {hasBankPending && (
        <AlertBanner
          variant="warning"
          title="Pending Approval"
          message="One or more bank account changes are awaiting maker-checker approval."
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          Bank Accounts ({accounts.length})
        </h3>
        <Button
          size="sm"
          className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90 shadow-sm"
          onClick={openAdd}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Account
        </Button>
      </div>

      {/* Card List */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {accounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card
                  className={`h-full hover:shadow-md transition-shadow ${account.isPrimary ? "ring-1 ring-[#1e3a5f]/20" : ""}`}
                >
                  <CardContent className="p-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Landmark className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {account.bankName}
                          </p>
                          {account.branchName && (
                            <p className="text-xs text-slate-500">
                              {account.branchName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {account.isPrimary && (
                          <Badge variant="success">
                            <Star className="w-3 h-3 mr-1" /> Primary
                          </Badge>
                        )}
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(account)}
                          className="p-1.5 rounded-lg text-amber-600"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirmId(account.id)}
                          className="p-1.5 rounded-lg text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">Account No</p>
                        <p className="font-mono font-medium text-slate-700">
                          {account.accountNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">IFSC</p>
                        <p className="font-mono font-medium text-slate-700">
                          {account.ifsc}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Type</p>
                        <p className="font-medium text-slate-700">
                          {account.accountType}
                        </p>
                      </div>
                      {account.micr && (
                        <div>
                          <p className="text-xs text-slate-400">MICR</p>
                          <p className="font-mono font-medium text-slate-700">
                            {account.micr}
                          </p>
                        </div>
                      )}
                    </div>

                    {account.pendingApproval && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                        <AlertTriangle className="w-3 h-3" /> Awaiting approval
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <Landmark className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No bank accounts added</p>
          <p className="text-sm mt-1">Add a bank account to get started.</p>
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
                className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-50 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
                      {isEditing ? (
                        <Pencil className="w-4 h-4 text-white" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {isEditing ? "Edit Bank Account" : "Add Bank Account"}
                    </h2>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Body */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
                    },
                  }}
                  className="flex-1 overflow-y-auto p-6 space-y-5"
                >
                  {/* Account Number */}
                  <motion.div variants={fieldVariant} className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showAccNum ? "text" : "password"}
                        placeholder="Enter 12–16 digit account number"
                        value={form.accountNumber}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            accountNumber: e.target.value,
                          }))
                        }
                        className="w-full h-10 pl-3 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all font-mono"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowAccNum(!showAccNum)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-[#1e3a5f] transition-colors"
                      >
                        {showAccNum ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  {/* IFSC */}
                  <motion.div variants={fieldVariant} className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={form.ifsc}
                      maxLength={11}
                      onChange={(e) => handleIFSCChange(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all font-mono uppercase"
                    />
                    {ifscData && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm"
                      >
                        <p className="text-emerald-700 font-semibold">
                          ✓ IFSC Validated
                        </p>
                        <p className="text-emerald-600 text-xs mt-0.5">
                          Bank: {ifscData.bankName}
                        </p>
                        <p className="text-emerald-600 text-xs">
                          Branch: {ifscData.branchName}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Account Type */}
                  <motion.div variants={fieldVariant}>
                    <Select
                      label="Account Type"
                      value={form.accountType}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, accountType: e.target.value }))
                      }
                      options={[
                        { value: "Savings", label: "Savings" },
                        { value: "Current", label: "Current" },
                        { value: "NRE", label: "NRE" },
                        { value: "NRO", label: "NRO" },
                      ]}
                    />
                  </motion.div>

                  {/* MICR */}
                  <motion.div variants={fieldVariant}>
                    <Input
                      label="MICR Code"
                      placeholder="e.g. 400240012"
                      value={form.micr}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, micr: e.target.value }))
                      }
                    />
                  </motion.div>
                </motion.div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center gap-3 mt-auto">
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
                    className="flex-1 px-6 py-2.5 text-sm font-semibold text-white bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 rounded-lg transition-colors shadow-sm"
                  >
                    {isEditing ? "Save Changes" : "Add Account"}
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
              <AlertTriangle className="w-5 h-5" /> Remove Bank Account
            </DialogTitle>
            <DialogDescription className="py-2">
              Are you sure you want to remove this bank account? This action
              cannot be undone.
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
              Remove Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
