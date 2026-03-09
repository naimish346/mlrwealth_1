import React, { useState, useEffect } from "react";
import {
  X,
  Calendar as CalendarIcon,
  Flag,
  Tag,
  Users,
  AlignLeft,
} from "lucide-react";
import { useTaskStore } from "../../../store/useTaskStore";
import { TASK_STATUS, TASK_PRIORITY, TASK_TYPE } from "../../../data/mockTasks";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const TaskFormSlideover = () => {
  const { isFormOpen, closeTaskForm, editingTask, addTask, updateTask } =
    useTaskStore();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: TASK_STATUS.PENDING,
    priority: TASK_PRIORITY.MEDIUM,
    type: TASK_TYPE.OTHER,
    dueDate: new Date().toISOString().split("T")[0],
    assignee: "Unassigned",
    clientId: "",
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        ...editingTask,
        dueDate: editingTask.dueDate.split("T")[0], // Safely handle formatting
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: TASK_STATUS.PENDING,
        priority: TASK_PRIORITY.MEDIUM,
        type: TASK_TYPE.OTHER,
        dueDate: new Date().toISOString().split("T")[0],
        assignee: "Unassigned",
        clientId: "",
      });
    }
  }, [editingTask, isFormOpen]);

  const handleSubmit = (e) => {
    if (editingTask) {
      updateTask(editingTask.id, formData);
      toast.success("Task updated successfully");
    } else {
      addTask({
        ...formData,
        createdAt: new Date().toISOString(),
      });
      toast.success("Task created successfully");
    }
    closeTaskForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isFormOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={closeTaskForm}
          />

          {/* Slideover Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-slate-50">
              <h2 className="text-lg font-bold text-gray-900">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h2>
              <button
                onClick={closeTaskForm}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
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
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {/* Title */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="space-y-1.5"
              >
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Review Quarterly Report"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                />
              </motion.div>

              {/* Description */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="space-y-1.5"
              >
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-gray-400" /> Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add more details about this task..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none"
                />
              </motion.div>

              <div className="grid grid-cols-2 gap-6">
                {/* Status */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="space-y-1.5"
                >
                  <label className="text-sm font-semibold text-gray-900">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  >
                    <option value={TASK_STATUS.PENDING}>Pending</option>
                    <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
                    <option value={TASK_STATUS.COMPLETED}>Completed</option>
                    <option value={TASK_STATUS.OVERDUE}>Overdue</option>
                    <option value={TASK_STATUS.CANCELLED}>Cancelled</option>
                  </select>
                </motion.div>

                {/* Priority */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="space-y-1.5"
                >
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Flag className="w-4 h-4 text-gray-400" /> Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  >
                    <option value={TASK_PRIORITY.LOW}>Low</option>
                    <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
                    <option value={TASK_PRIORITY.HIGH}>High</option>
                    <option value={TASK_PRIORITY.URGENT}>Urgent</option>
                  </select>
                </motion.div>

                {/* Due Date */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="space-y-1.5"
                >
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" /> Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                </motion.div>

                {/* Type */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="space-y-1.5"
                >
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" /> Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  >
                    {Object.values(TASK_TYPE).map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </motion.div>

                {/* Assignee */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="space-y-1.5 col-span-2"
                >
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" /> Assignee
                  </label>
                  <select
                    name="assignee"
                    value={formData.assignee}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  >
                    <option value="Unassigned">Unassigned</option>
                    <option value="Sarah Mitchell">Sarah Mitchell</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Michael Chang">Michael Chang</option>
                    <option value="Emily Chen">Emily Chen</option>
                    <option value="Compliance Team">Compliance Team</option>
                  </select>
                </motion.div>
              </div>
            </motion.form>

            {/* Footer actions */}
            <div className="p-6 border-t border-gray-200 bg-slate-50 flex items-center justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={closeTaskForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "#d97706",
                  boxShadow: "0 0 15px rgba(245, 158, 11, 0.4)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="px-6 py-2 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg transition-colors shadow-sm"
              >
                {editingTask ? "Save Changes" : "Create Task"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
