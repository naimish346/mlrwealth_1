import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, MessageSquare, AlignLeft, Type } from "lucide-react";
import { toast } from "sonner";
import { useLeadStore } from "../../../store/useLeadStore";

export const LeadNoteSlideover = ({ open, onOpenChange, leadId }) => {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const { addActivity } = useLeadStore();

  useEffect(() => {
    if (open) {
      setTitle("");
      setNote("");
    }
  }, [open]);

  const handleSave = () => {
    if (!note.trim()) return;
    addActivity({
      leadId,
      type: "note",
      title: title.trim() || "Lead Note",
      description: note,
    });
    toast.success("Note added successfully");
    onOpenChange(false);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-slate-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#1e3a5f]" />
                Add New Note
              </h2>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-gray-400" /> Note Content
                </label>
                <textarea
                  rows={12}
                  placeholder="Type your observations or follow-up details here..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all resize-none text-sm"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!note.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#1e3a5f]/90 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Note
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};
