import { create } from 'zustand';
import { initialTasks } from '../data/mockTasks';

export const useTaskStore = create((set, get) => ({
  tasks: initialTasks,
  
  isFormOpen: false,
  editingTask: null,
  
  isDetailsOpen: false,
  viewingTask: null,

  openTaskForm: (task = null) => set({ isFormOpen: true, editingTask: task }),
  closeTaskForm: () => set({ isFormOpen: false, editingTask: null }),

  openTaskDetails: (task) => set({ isDetailsOpen: true, viewingTask: task }),
  closeTaskDetails: () => set({ isDetailsOpen: false, viewingTask: null }),
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, { ...task, id: Date.now().toString() }]
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    )
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== id)
  })),

  moveTaskStatus: (id, newStatus) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === id ? { ...task, status: newStatus } : task
    )
  })),

  // Selectors/getters for convenience
  getTasksByStatus: (status) => get().tasks.filter(t => t.status === status),
  getTasksByPriority: (priority) => get().tasks.filter(t => t.priority === priority),
}));
