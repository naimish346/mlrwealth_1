import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { format, parse, isAfter } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  Save,
  RotateCcw,
  User,
  AlignLeft,
} from "lucide-react";
import { toast } from "sonner";

import { useLeadStore } from "../../../store/useLeadStore";
import { useAppStore } from "../../../store/appStore";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export const GlobalRemindersCreate = ({
  open,
  onOpenChange,
  editReminderId,
}) => {
  const { leads, reminders, addReminder, updateReminder } = useLeadStore();
  const { clients } = useAppStore();

  const defaultValues = {
    title: "",
    date: format(new Date(), "dd-MM-yyyy"),
    time: "10:00 AM",
    notes: "",
    leadId: "", // newly added for global context
  };

  const [formData, setFormData] = useState(defaultValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (editReminderId) {
        const existing = reminders.find((r) => r.id === editReminderId);
        if (existing) {
          setFormData({
            title: existing.title || "",
            date: existing.date || format(new Date(), "dd-MM-yyyy"),
            time: existing.time || "10:00 AM",
            notes: existing.notes || "",
            leadId: existing.leadId || "",
          });
        }
      } else {
        setFormData(defaultValues);
      }
      setErrors({});
    }
  }, [open, editReminderId, reminders]);

  const checkIsDirty = () => {
    if (!open) return false;

    if (editReminderId) {
      const existing = reminders.find((r) => r.id === editReminderId);
      if (!existing) return false;

      return (
        formData.title !== (existing.title || "") ||
        formData.date !== (existing.date || format(new Date(), "dd-MM-yyyy")) ||
        formData.time !== (existing.time || "10:00 AM") ||
        formData.notes !== (existing.notes || "") ||
        formData.leadId !== (existing.leadId || "")
      );
    } else {
      return (
        formData.title !== defaultValues.title ||
        formData.date !== defaultValues.date ||
        formData.time !== defaultValues.time ||
        formData.notes !== defaultValues.notes ||
        formData.leadId !== defaultValues.leadId
      );
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen && checkIsDirty()) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to discard them?",
        )
      ) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(newOpen);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.date.trim()) newErrors.date = "Date is required";
    if (!formData.leadId)
      newErrors.leadId =
        "Please select a client or lead to attach this task to";

    // Basic date format validation dd-mm-yyyy
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(20\d\d)$/;
    if (formData.date && !dateRegex.test(formData.date)) {
      newErrors.date = "Format must be DD-MM-YYYY";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    // Find the lead name to store with the reminder
    const selectedLead = leads.find((l) => l.id === formData.leadId);
    // Temporary fallback - if it's a client from AppStore (we merge them here just visually for now)
    const selectedClient = clients.find((c) => c.id === formData.leadId);
    const attachedName = selectedLead
      ? selectedLead.name
      : selectedClient
        ? selectedClient.name
        : "Unknown Context";

    if (editReminderId) {
      updateReminder(editReminderId, {
        ...formData,
        lead: attachedName,
      });
      toast.success("Reminder updated successfully");
    } else {
      addReminder({
        ...formData,
        lead: attachedName,
        createdAt: format(new Date(), "dd-MM-yyyy"), // Generate creation date
        createdBy: "Current User", // Mock user name or ID
      });
      toast.success("Reminder created successfully");
    }

    onOpenChange(false);
  };

  // Merge leads and clients into a single searchable array for the dropdown
  // A real CRM might handle these separately, but for the mock ui we'll merge
  const allContextTargets = [
    ...leads.map((l) => ({ id: l.id, name: l.name, type: "Lead" })),
    ...clients.map((c) => ({ id: c.id, name: c.name, type: "Client" })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => handleOpenChange(false)}
          />

          {/* Slideover Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[540px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-slate-50">
              <h2 className="text-lg font-bold text-gray-900">
                {editReminderId
                  ? "Edit Global Reminder"
                  : "Schedule New Reminder"}
              </h2>
              <button
                onClick={() => handleOpenChange(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <motion.form
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.1,
                  },
                },
              }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              <div className="bg-white space-y-5">
                {/* Context Target Dropdown */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-1.5">
                    <User className="w-4 h-4 text-gray-400" /> Attached To{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.leadId}
                    onChange={(e) =>
                      setFormData({ ...formData, leadId: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.leadId ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500"}`}
                  >
                    <option value="" disabled>
                      Select a lead or client...
                    </option>
                    {allContextTargets.map((target) => (
                      <option key={target.id} value={target.id}>
                        {target.name} ({target.type})
                      </option>
                    ))}
                  </select>
                  {errors.leadId && (
                    <p className="text-xs text-red-500 mt-1">{errors.leadId}</p>
                  )}
                </motion.div>

                {/* Title */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-1.5">
                    Reminder Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="E.g., Follow up on proposal"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.title ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500"}`}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </motion.div>

                {/* Notes */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <label className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-gray-400" /> Description
                    / Notes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Add context or agenda items..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                  />
                </motion.div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Date */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-1.5">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />{" "}
                      Reminder Date
                    </label>
                    <input
                      placeholder="DD-MM-YYYY"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.date ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-gray-300 focus:ring-indigo-500/20 focus:border-indigo-500"}`}
                    />
                    {errors.date && (
                      <p className="text-xs text-red-500 mt-1">{errors.date}</p>
                    )}
                  </motion.div>

                  {/* Time */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-1.5">
                      <Clock className="w-4 h-4 text-gray-400" /> Reminder Time
                    </label>
                    <input
                      placeholder="10:00 AM"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </motion.div>
                </div>
              </div>
            </motion.form>

            {/* Footer actions */}
            <div className="p-6 border-t border-gray-200 bg-slate-50 flex items-center justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a5f]/80 hover:bg-[#1e3a5f] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "#1e3a5f",
                  boxShadow: "0 0 15px rgba(30, 58, 95, 0.4)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="px-6 py-2 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg transition-colors shadow-sm flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editReminderId ? "Save Changes" : "Schedule Reminder"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};
