import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  FileText,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useLeadStore } from "../../../store/useLeadStore";

export const LeadDocSlideover = ({ open, onOpenChange, leadId }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { addActivity } = useLeadStore();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;

    selectedFiles.forEach((file) => {
      addActivity({
        leadId,
        type: "file",
        title: "Uploaded Document",
        description: `File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      });
    });

    // Simulate upload delay
    setTimeout(() => {
      setSelectedFiles([]);
      toast.success(
        `${selectedFiles.length} document(s) uploaded successfully`,
      );
      onOpenChange(false);
    }, 1000);
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
                <Upload className="w-5 h-5 text-[#1e3a5f]" />
                Upload Documents
              </h2>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  dragActive
                    ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                    : "border-slate-200 bg-slate-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-0.5">
                  Drag and drop files here
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  or click to browse from your computer
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <button
                  onClick={() => document.getElementById("file-upload").click()}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Choose Files
                </button>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    Selected Files ({selectedFiles.length})
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="text-red-500 hover:underline normal-case font-medium"
                    >
                      Clear All
                    </button>
                  </h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg group animate-in slide-in-from-right-1 duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-slate-200">
                            <FileText className="w-4 h-4 text-[#1e3a5f]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Accepted Formats
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {["PDF", "DOCX", "XLSX", "PNG", "JPG"].map((format) => (
                    <span
                      key={format}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200"
                    >
                      {format}
                    </span>
                  ))}
                </div>
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
                onClick={handleUpload}
                disabled={selectedFiles.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#1e3a5f]/90 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Upload{" "}
                {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};
