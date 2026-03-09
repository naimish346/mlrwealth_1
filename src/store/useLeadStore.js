import { create } from "zustand";

const mockLeads = [
  {
    id: "L001",
    name: "Rajiv Malhotra",
    company: "Malhotra Group",
    stage: "Negotiation",
    value: 5000000,
    source: "web form",
    type: "new business",
    expectedCloseDate: "15-11-2023",
    assignedTo: "Priya Sharma",
    date: "25-10-2023", 
    rm: "Priya Sharma",
    email: "rajiv@malhotragroup.in",
    phone: "+91 98765 12345",
    location: "Mumbai, India",
    designation: "Managing Director",
    notes: "Rajiv is looking for comprehensive wealth management for his enterprise group. High interest in equity growth portfolios and tax-saving bonds.",
    description: "Enterprise client from Mumbai group.",
    score: 85,
  },
  {
    id: "L002",
    name: "Anita Desai",
    company: "Tech Innovators",
    stage: "Follow-up",
    value: 2500000,
    source: "email",
    type: "existing business",
    expectedCloseDate: "20-11-2023",
    assignedTo: "Rajesh Kumar",
    date: "24-10-2023",
    rm: "Rajesh Kumar",
    email: "anita@techinnovators.com",
    phone: "+91 98765 54321",
    location: "Bangalore, India",
    designation: "CTO",
    description: "Tech industry lead from Bangalore referral.",
    score: 65,
  },
  {
    id: "L003",
    name: "Vikram Singh",
    company: "Singh Enterprises",
    stage: "Follow-up",
    value: 12000000,
    source: "direct",
    type: "new business",
    expectedCloseDate: "30-11-2023",
    assignedTo: "Priya Sharma",
    date: "22-10-2023",
    rm: "Priya Sharma",
    email: "vikram@singhmfg.in",
    phone: "+91 99887 76655",
    location: "Delhi, India",
    designation: "CEO",
    description: "Looking for corporate treasury management.",
    score: 75,
  },
  {
    id: "L004",
    name: "Meera Reddy",
    company: "Reddy Constructions",
    stage: "New",
    value: 8500000,
    source: "referral",
    type: "new business",
    expectedCloseDate: "05-12-2023",
    assignedTo: "Rajesh Kumar",
    date: "28-10-2023",
    rm: "Rajesh Kumar",
    email: "meera.r@reddyconst.in",
    phone: "+91 91234 56780",
    location: "Hyderabad, India",
    designation: "CFO",
    description: "Interested in real estate backed MFs.",
    score: 90,
  },
  {
    id: "L005",
    name: "Sanjay Patel",
    company: "Patel Pharma",
    stage: "Qualified",
    value: 3000000,
    source: "web form",
    type: "new business",
    expectedCloseDate: "10-12-2023",
    assignedTo: "Amit Desai",
    date: "20-10-2023",
    rm: "Amit Desai",
    email: "spatel@patelpharma.com",
    phone: "+91 98765 00000",
    location: "Ahmedabad, India",
    designation: "Director",
    description: "Looking for tax optimization.",
    score: 60,
  },
  {
    id: "L006",
    name: "Kavita Rathi",
    company: "Rathi Textiles",
    stage: "Proposal",
    value: 7500000,
    source: "event",
    type: "existing business",
    expectedCloseDate: "15-12-2023",
    assignedTo: "Priya Sharma",
    date: "15-10-2023",
    rm: "Priya Sharma",
    email: "krathi@rathitex.in",
    phone: "+91 99999 88888",
    location: "Surat, India",
    designation: "Partner",
    description: "Wants to diversify family wealth.",
    score: 80,
  },
  {
    id: "L007",
    name: "Deepak Mehta",
    company: "Mehta Auto",
    stage: "Contacted",
    value: 4000000,
    source: "cold call",
    type: "new business",
    expectedCloseDate: "20-12-2023",
    assignedTo: "Ramesh Jain",
    date: "01-11-2023",
    rm: "Ramesh Jain",
    email: "deepak@mehtaauto.com",
    phone: "+91 88888 77777",
    location: "Pune, India",
    designation: "Owner",
    description: "Starting a SIP for children's education.",
    score: 40,
  },
  {
    id: "L008",
    name: "Neha Gupta",
    company: "Gupta Consultants",
    stage: "Won",
    value: 15000000,
    source: "referral",
    type: "existing business",
    expectedCloseDate: "01-10-2023",
    assignedTo: "Priya Sharma",
    date: "10-09-2023",
    rm: "Priya Sharma",
    email: "neha@guptaconsult.in",
    phone: "+91 77777 66666",
    location: "Gurgaon, India",
    designation: "Principal",
    description: "Moved entire portfolio from previous bank.",
    score: 95,
  },
  {
    id: "L009",
    name: "Tarun Bajaj",
    company: "Bajaj Finance",
    stage: "Lost",
    value: 500000,
    source: "web form",
    type: "new business",
    expectedCloseDate: "05-10-2023",
    assignedTo: "Rajesh Kumar",
    date: "05-09-2023",
    rm: "Rajesh Kumar",
    email: "tarun@bfin.com",
    phone: "+91 66666 55555",
    location: "Mumbai, India",
    designation: "VP",
    description: "Went with a competitor due to high fees.",
    score: 20,
  },
];

const mockActivities = [
  {
    id: 1,
    leadId: "L001",
    type: "call",
    title: "Follow-up Call",
    timestamp: "2023-10-25T10:30:00Z",
    description: "Discussed portfolio structuring. Client is very interested in international equity.",
    icon: "phone",
  },
  {
    id: 2,
    leadId: "L001",
    type: "email",
    title: "Email Sent",
    timestamp: "2023-10-24T09:00:00Z",
    description: "Sent standard firm overview deck and Q3 fact sheet.",
    icon: "mail",
  },
];

const mockReminders = [
  {
    id: 1,
    leadId: "L003",
    title: "Prospect Review Meeting",
    lead: "Vikram Singh",
    date: "02-11-2023",
    time: "2:00 PM - 3:00 PM",
    type: "meeting",
    priority: "high",
    status: "pending",
    snoozeCount: 0,
  },
  {
    id: 2,
    leadId: "L002",
    title: "Follow-up Call",
    lead: "Anita Desai",
    date: "03-11-2023",
    time: "10:30 AM",
    type: "call",
    priority: "medium",
    status: "pending",
    snoozeCount: 0,
  },
];

export const useLeadStore = create((set) => ({
  leads: mockLeads,
  activities: mockActivities,
  reminders: mockReminders,
  documents: [],

  addLead: (lead) =>
    set((state) => ({
      leads: [
        {
          id: `L00${state.leads.length + 1}`,
          date: new Date().toLocaleDateString("en-GB").split("/").join("-"),
          ...lead,
        },
        ...state.leads,
      ],
    })),

  updateLeadStage: (leadId, newStage) =>
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, stage: newStage } : l
      ),
    })),

  updateLeadInfo: (leadId, updatedInfo) =>
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, ...updatedInfo } : l
      ),
    })),

  addActivity: (activity) =>
    set((state) => ({
      activities: [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...activity,
        },
        ...state.activities,
      ],
    })),

  addReminder: (reminder) =>
    set((state) => ({
      reminders: [
        {
          id: Date.now(),
          status: "pending",
          snoozeCount: 0,
          ...reminder,
        },
        ...state.reminders,
      ],
    })),

  updateReminder: (id, updates) =>
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  updateReminderStatus: (id, newStatus) =>
    set((state) => {
      const reminders = state.reminders.map((r) =>
        r.id === id ? { ...r, status: newStatus } : r
      );
      
      // Auto-log activity on completion
      if (newStatus === "completed") {
        const completedReminder = state.reminders.find((r) => r.id === id);
        if (completedReminder) {
          const newActivity = {
            id: Date.now(),
            leadId: completedReminder.leadId,
            type: "note",
            title: `Completed Task: ${completedReminder.title}`,
            timestamp: new Date().toISOString(),
            description: `Task was marked as completed. Type: ${completedReminder.type}.`,
            icon: "check",
          };
          return {
            reminders,
            activities: [newActivity, ...state.activities],
          };
        }
      }
      return { reminders };
    }),

  deleteReminder: (id) =>
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== id),
    })),

  snoozeReminder: (id, newDate, newTime) =>
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id 
          ? { 
              ...r, 
              date: newDate || r.date, 
              time: newTime || r.time, 
              snoozeCount: (r.snoozeCount || 0) + 1 
            } 
          : r
      ),
    })),

  addDocument: (doc) =>
    set((state) => ({
      documents: [
        {
          id: Date.now(),
          uploadDate: new Date().toLocaleDateString("en-GB").split("/").join("-"),
          ...doc,
        },
        ...state.documents,
      ],
    })),
}));
