export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const TASK_TYPE = {
  MEETING: 'meeting',
  CALL: 'call',
  EMAIL: 'email',
  DOCUMENTATION: 'documentation',
  REVIEW: 'review',
  OTHER: 'other'
};

const getFutureDate = (daysToAdd) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
};

const getPastDate = (daysToSubtract) => {
  const date = new Date();
  date.setDate(date.getDate() - daysToSubtract);
  return date.toISOString().split('T')[0];
};

export const initialTasks = [
  {
    id: 't-1',
    title: 'Review Q3 Financial Reports',
    description: 'Analyze the Q3 financial performance for top 10 clients and prepare summary.',
    status: TASK_STATUS.IN_PROGRESS,
    priority: TASK_PRIORITY.HIGH,
    type: TASK_TYPE.REVIEW,
    dueDate: getFutureDate(2),
    createdAt: getPastDate(1),
    assignee: 'Sarah Mitchell',
    clientId: 'c-123'
  },
  {
    id: 't-2',
    title: 'Client Onboarding Call - Rajesh Kumar',
    description: 'Initial consultation and KYC document verification process.',
    status: TASK_STATUS.PENDING,
    priority: TASK_PRIORITY.MEDIUM,
    type: TASK_TYPE.CALL,
    dueDate: getFutureDate(1),
    createdAt: getPastDate(0),
    assignee: 'John Doe',
    clientId: 'c-124'
  },
  {
    id: 't-3',
    title: 'Update Portfolio Strategy - Tech Sector',
    description: 'Revise investment strategy based on recent market volatility in tech stocks.',
    status: TASK_STATUS.PENDING,
    priority: TASK_PRIORITY.HIGH,
    type: TASK_TYPE.DOCUMENTATION,
    dueDate: getFutureDate(5),
    createdAt: getPastDate(2),
    assignee: 'Michael Chang',
    clientId: null
  },
  {
    id: 't-4',
    title: 'Quarterly Review Meeting with Sharma Family',
    description: 'Discuss portfolio performance and upcoming estate planning needs.',
    status: TASK_STATUS.PENDING,
    priority: TASK_PRIORITY.MEDIUM,
    type: TASK_TYPE.MEETING,
    dueDate: getFutureDate(7),
    createdAt: getPastDate(5),
    assignee: 'Sarah Mitchell',
    clientId: 'c-125'
  },
  {
    id: 't-5',
    title: 'Draft Risk Assessment Policy',
    description: 'Update internal risk assessment guidelines for new high-net-worth clients.',
    status: TASK_STATUS.OVERDUE,
    priority: TASK_PRIORITY.MEDIUM,
    type: TASK_TYPE.DOCUMENTATION,
    dueDate: getPastDate(1), // Overdue
    createdAt: getPastDate(10),
    assignee: 'Emily Chen',
    clientId: null
  },
  {
    id: 't-6',
    title: 'Follow-up Email - Tax Documents',
    description: 'Send reminder for pending 2025 tax documents.',
    status: TASK_STATUS.COMPLETED,
    priority: TASK_PRIORITY.LOW,
    type: TASK_TYPE.EMAIL,
    dueDate: getPastDate(2),
    createdAt: getPastDate(4),
    assignee: 'John Doe',
    clientId: 'c-126'
  },
  {
    id: 't-7',
    title: 'Investment Proposal Review - GreenTech Inc',
    description: 'Evaluate the prospect of adding GreenTech bonds to conservative portfolios.',
    status: TASK_STATUS.IN_PROGRESS,
    priority: TASK_PRIORITY.HIGH,
    type: TASK_TYPE.REVIEW,
    dueDate: getFutureDate(3),
    createdAt: getPastDate(1),
    assignee: 'Michael Chang',
    clientId: null
  },
  {
    id: 't-8',
    title: 'Urgent: Address Account Verification Flag',
    description: 'Resolve compliance hold on account ID #9982.',
    status: TASK_STATUS.PENDING,
    priority: TASK_PRIORITY.URGENT,
    type: TASK_TYPE.OTHER,
    dueDate: getFutureDate(0), // Today
    createdAt: getPastDate(0),
    assignee: 'Compliance Team',
    clientId: 'c-127'
  }
];
