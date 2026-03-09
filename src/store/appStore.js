import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockClients, mockGoals, mockHoldings, mockExternalAssets, mockTransactions, mockNotifications, mockCommunicationLogs, mockPendingChanges } from '../data/mockData';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const mockUsers = {
          'admin@mlrwealth.com': {
            id: 'usr_001',
            email: 'admin@mlrwealth.com',
            name: 'Rajesh Kumar',
            role: 'Admin',
            lastLogin: new Date(),
            twoFactorEnabled: true,
          },
          'rm@mlrwealth.com': {
            id: 'usr_002',
            email: 'rm@mlrwealth.com',
            name: 'Priya Sharma',
            role: 'RM',
            lastLogin: new Date(),
            twoFactorEnabled: true,
          },
          'ops@mlrwealth.com': {
            id: 'usr_004',
            email: 'ops@mlrwealth.com',
            name: 'Sanjay Desai',
            role: 'Operations',
            lastLogin: new Date(),
            twoFactorEnabled: true,
          },
          'client@mlrwealth.com': {
            id: 'usr_003',
            email: 'client@mlrwealth.com',
            name: 'Amit Patel',
            role: 'Client',
            lastLogin: new Date(),
            twoFactorEnabled: false,
          },
        };
        
        const user = mockUsers[email];
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },
      
      // Navigation
      activeModule: 'dashboard',
      setActiveModule: (module) => set({ activeModule: module }),
      
      // Client View State
      clientViewMode: 'list', // 'list' | 'profile'
      selectedClientId: null,
      setClientViewMode: (mode) => set({ clientViewMode: mode }),
      openClientProfile: (clientId) => set({ clientViewMode: 'profile', selectedClientId: clientId }),
      closeClientProfile: () => set({ clientViewMode: 'list', selectedClientId: null }),
      
      // Clients
      clients: mockClients,
      selectedClient: null,
      setSelectedClient: (client) => set({ selectedClient: client }),
      searchClients: (query) => {
        const { clients } = get();
        if (!query) return clients;
        const lowerQuery = query.toLowerCase();
        return clients.filter(
          (c) =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.pan.toLowerCase().includes(lowerQuery) ||
            c.mobile.includes(query) ||
            c.email.toLowerCase().includes(lowerQuery) ||
            (c.ckyc && c.ckyc.includes(query))
        );
      },
      addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
      updateClient: (id, updates) =>
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      
      // Communication Logs
      communicationLogs: mockCommunicationLogs,
      getClientLogs: (clientId) => get().communicationLogs.filter((l) => l.clientId === clientId),
      addLogEntry: (entry) => set((state) => ({
        communicationLogs: [entry, ...state.communicationLogs],
      })),
      
      // Maker-Checker / Pending Changes
      pendingChanges: mockPendingChanges,
      getClientPendingChanges: (clientId) => get().pendingChanges.filter((c) => c.clientId === clientId),
      approveChange: (changeId) =>
        set((state) => ({
          pendingChanges: state.pendingChanges.map((c) =>
            c.id === changeId ? { ...c, status: 'Approved' } : c
          ),
        })),
      rejectChange: (changeId) =>
        set((state) => ({
          pendingChanges: state.pendingChanges.map((c) =>
            c.id === changeId ? { ...c, status: 'Rejected' } : c
          ),
        })),
      
      // Goals
      goals: mockGoals,
      getClientGoals: (clientId) => get().goals.filter((g) => g.clientId === clientId),
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),
      
      // Portfolio
      holdings: mockHoldings,
      externalAssets: mockExternalAssets,
      getClientHoldings: (clientId) => get().holdings.filter((h) => h.clientId === clientId),
      getClientExternalAssets: (clientId) => get().externalAssets.filter((a) => a.clientId === clientId),
      addHolding: (holding) => set((state) => ({ holdings: [...state.holdings, holding] })),
      updateHolding: (id, updates) => set((state) => ({ holdings: state.holdings.map((h) => (h.id === id ? { ...h, ...updates } : h)) })),
      deleteHolding: (id) => set((state) => ({ holdings: state.holdings.filter((h) => h.id !== id) })),
      addExternalAsset: (asset) => set((state) => ({ externalAssets: [...state.externalAssets, asset] })),
      updateExternalAsset: (id, updates) => set((state) => ({ externalAssets: state.externalAssets.map((a) => (a.id === id ? { ...a, ...updates } : a)) })),
      deleteExternalAsset: (id) => set((state) => ({ externalAssets: state.externalAssets.filter((a) => a.id !== id) })),
      // Transactions
      transactions: mockTransactions,
      getClientTransactions: (clientId) => get().transactions.filter((t) => t.clientId === clientId),
      
      // Notifications
      notifications: mockNotifications,
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      
      // UI State
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      showModal: null,
      setShowModal: (modal) => set({ showModal: modal }),
    }),
    {
      name: 'app-store', // key in local storage
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        activeModule: state.activeModule
      }),
    }
  )
);
