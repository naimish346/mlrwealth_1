import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FolderOpen,
  Upload,
  Download,
  X,
  FileText,
  FileBadge,
  FileImage,
  CloudUpload,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Select } from "../../ui/input";

const fieldVariant = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const TYPE_ICONS = {
  Identity: { icon: FileBadge, color: "text-blue-500 bg-blue-50" },
  Address: { icon: FileText, color: "text-violet-500 bg-violet-50" },
  Banking: { icon: FolderOpen, color: "text-emerald-500 bg-emerald-50" },
  Finance: { icon: FileText, color: "text-amber-500 bg-amber-50" },
  Other: { icon: FileImage, color: "text-slate-400 bg-slate-50" },
};

const DUMMY_DOCS = [
  {
    name: "PAN_Card_Copy.pdf",
    size: "1.2 MB",
    date: "2024-01-15",
    type: "Identity",
  },
  {
    name: "Aadhar_Front_Back.pdf",
    size: "2.4 MB",
    date: "2024-01-15",
    type: "Address",
  },
  {
    name: "Cancel_Cheque.jpg",
    size: "850 KB",
    date: "2024-02-01",
    type: "Banking",
  },
  {
    name: "Latest_ITR_V.pdf",
    size: "3.1 MB",
    date: "2024-02-10",
    type: "Finance",
  },
];

export const DocumentsTab = ({ client }) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState("Identity");
  const fileRef = useRef(null);

  const closeDrawer = () => {
    setShowDrawer(false);
    setSelectedFile(null);
    setDragOver(false);
    setDocType("Identity");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          Documents ({DUMMY_DOCS.length})
        </h3>
        <Button
          size="sm"
          className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90 shadow-sm"
          onClick={() => {
            setShowDrawer(true);
            toast.info("Opening document upload drawer");
          }}
        >
          <Upload className="w-4 h-4 mr-2" /> Upload
        </Button>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DUMMY_DOCS.map((doc, i) => {
          const { icon: Icon, color } =
            TYPE_ICONS[doc.type] || TYPE_ICONS.Other;
          return (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all bg-white group"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {doc.name}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                    {doc.type}
                  </span>
                  <span>•</span>
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>{doc.date}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Upload Drawer — portalled to document.body */}
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
                      <CloudUpload className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Upload Document
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
                  {/* Drag & Drop Zone */}
                  <motion.div variants={fieldVariant}>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                      File <span className="text-red-500">*</span>
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        dragOver
                          ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                          : selectedFile
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-slate-200 hover:border-[#1e3a5f]/40 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      {selectedFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle className="w-10 h-10 text-emerald-500" />
                          <p className="font-semibold text-emerald-700 text-sm">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-emerald-600">
                            {(selectedFile.size / 1024).toFixed(0)} KB
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                            }}
                            className="text-xs text-slate-400 hover:text-red-500 underline mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <CloudUpload className="w-10 h-10" />
                          <p className="font-semibold text-slate-600 text-sm">
                            Drop file here or{" "}
                            <span className="text-[#1e3a5f] underline">
                              browse
                            </span>
                          </p>
                          <p className="text-xs">
                            PDF, JPG, PNG, DOC up to 10 MB
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Document Type */}
                  <motion.div variants={fieldVariant}>
                    <Select
                      label="Document Type"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      options={[
                        {
                          value: "Identity",
                          label: "Identity (PAN / Aadhaar)",
                        },
                        { value: "Address", label: "Address Proof" },
                        {
                          value: "Banking",
                          label: "Banking (Cheque / Statement)",
                        },
                        {
                          value: "Finance",
                          label: "Financial (ITR / Form 16)",
                        },
                        { value: "Other", label: "Other" },
                      ]}
                    />
                  </motion.div>

                  {/* Notes */}
                  <motion.div variants={fieldVariant}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Notes (optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Any remarks about this document..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all resize-none"
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      toast.success("Document uploaded successfully");
                      closeDrawer();
                    }}
                    className="flex-1 px-6 py-2.5 text-sm font-semibold text-white bg-[#1e3a5f] rounded-lg shadow-sm"
                  >
                    Save & Upload
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
