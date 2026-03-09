import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  X,
  Phone,
  Mail,
  Users,
  Video,
  MessageCircle,
  MessageSquarePlus,
  Paperclip,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Input, Select } from "../../ui/input";
import { Timeline } from "../../ui/Timeline";
import { useAppStore } from "../../../store/appStore";

const fieldVariant = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const COMM_TYPES = [
  { value: "Call", label: "📞 Phone Call" },
  { value: "Email", label: "✉️ Email" },
  { value: "Meeting", label: "👥 In-Person Meeting" },
  { value: "Video", label: "🎥 Video Call" },
  { value: "WhatsApp", label: "💬 WhatsApp" },
  { value: "Note", label: "📝 Internal Note" },
];

const OUTCOMES = [
  { value: "", label: "Select outcome…" },
  { value: "Positive", label: "✅ Positive – Client interested" },
  { value: "No Answer", label: "📵 No Answer / Voicemail" },
  { value: "Callback Requested", label: "🔄 Callback Requested" },
  { value: "Completed", label: "☑️ Completed – Action taken" },
  { value: "Not Interested", label: "❌ Not Interested" },
];

export const CommunicationLogTab = ({ client }) => {
  const { getClientLogs, addLogEntry } = useAppStore();
  const [showDrawer, setShowDrawer] = useState(false);
  const [form, setForm] = useState({
    type: "Call",
    date: new Date().toISOString().split("T")[0],
    outcome: "",
    description: "",
    followUp: "",
  });

  const logs = getClientLogs(client.id);

  const handleSave = () => {
    if (!form.description.trim()) return;
    addLogEntry({
      id: `log_${Date.now()}`,
      clientId: client.id,
      type: form.type,
      date: new Date(form.date).toISOString(),
      rmId: "usr_002",
      rmName: "Priya Sharma",
      description: form.description,
      notes: form.outcome,
    });
    toast.success("Communication logged successfully");
    closeDrawer();
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setForm({
      type: "Call",
      date: new Date().toISOString().split("T")[0],
      outcome: "",
      description: "",
      followUp: "",
    });
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          Communication Log
        </h3>
        <Button
          size="sm"
          className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90 shadow-sm"
          onClick={() => {
            setShowDrawer(true);
            toast.info("Opening communication log drawer");
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Entry
        </Button>
      </div>

      {/* Timeline */}
      <Timeline items={logs} />

      {/* Drawer — portalled to document.body */}
      {createPortal(
        <AnimatePresence>
          {showDrawer && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                onClick={closeDrawer}
              />

              {/* Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
                      <MessageSquarePlus className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Log Communication
                      </h2>
                      {client?.name && (
                        <p className="text-xs text-slate-500">
                          with {client.name}
                        </p>
                      )}
                    </div>
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
                  {/* Communication Type — pill selector */}
                  <motion.div variants={fieldVariant}>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                      Communication Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COMM_TYPES.map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() =>
                            setForm((p) => ({ ...p, type: value }))
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            form.type === value
                              ? "bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-sm"
                              : "bg-white text-slate-600 border-slate-200 hover:border-[#1e3a5f]/40"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Date */}
                  <motion.div variants={fieldVariant}>
                    <Input
                      label="Date of Communication"
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, date: e.target.value }))
                      }
                    />
                  </motion.div>

                  {/* Outcome */}
                  <motion.div variants={fieldVariant}>
                    <Select
                      label="Outcome"
                      value={form.outcome}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, outcome: e.target.value }))
                      }
                      options={OUTCOMES}
                    />
                  </motion.div>

                  {/* Description */}
                  <motion.div variants={fieldVariant}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Summarise the conversation, key points discussed, client's concerns..."
                      value={form.description}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, description: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all resize-none"
                    />
                  </motion.div>

                  {/* Attach file */}
                  <motion.div variants={fieldVariant}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Attachment (optional)
                    </label>
                    <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-slate-200 rounded-lg hover:border-[#1e3a5f]/40 hover:bg-slate-50 cursor-pointer transition-all group">
                      <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-[#1e3a5f] transition-colors" />
                      <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                        Click to attach a file…
                      </span>
                      <input type="file" className="hidden" />
                    </label>
                  </motion.div>

                  {/* Follow-up Date */}
                  <motion.div variants={fieldVariant}>
                    <Input
                      label="Follow-up Date (optional)"
                      type="date"
                      value={form.followUp}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, followUp: e.target.value }))
                      }
                    />
                    {form.followUp && (
                      <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                        ✓ A reminder will be created for {form.followUp}
                      </p>
                    )}
                  </motion.div>
                </motion.div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center gap-3 mt-auto">
                  <button
                    type="button"
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
                    Save Entry
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};
