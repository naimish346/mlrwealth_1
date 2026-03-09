import {
  Activity as ActivityIcon,
  UserCheck,
  FileText,
  LogIn,
  Edit,
  RefreshCcw,
  Landmark,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const activityData = [
  {
    icon: ShieldCheck,
    color: "text-emerald-600 bg-emerald-50",
    title: "KYC Verified",
    desc: "eKYC verification completed via Aadhaar OTP.",
    user: "System",
    time: "Today, 9:42 AM",
  },
  {
    icon: Edit,
    color: "text-blue-600 bg-blue-50",
    title: "Profile Updated",
    desc: "Email address and mobile number were updated.",
    user: "RM – Priya Sharma",
    time: "Yesterday, 3:15 PM",
  },
  {
    icon: Landmark,
    color: "text-indigo-600 bg-indigo-50",
    title: "Bank Account Added",
    desc: "HDFC Bank account (XXXX9812) linked successfully.",
    user: "RM – Priya Sharma",
    time: "2 days ago",
  },
  {
    icon: FileText,
    color: "text-violet-600 bg-violet-50",
    title: "Document Uploaded",
    desc: "PAN Card and Aadhaar copies uploaded for verification.",
    user: "RM – Priya Sharma",
    time: "3 days ago",
  },
  {
    icon: UserCheck,
    color: "text-teal-600 bg-teal-50",
    title: "Client Onboarded",
    desc: "Registration approved by Ops team. Status set to Active.",
    user: "Ops – Sanjay Desai",
    time: "2024-01-15",
  },
  {
    icon: LogIn,
    color: "text-slate-500 bg-slate-100",
    title: "Profile Created",
    desc: "New client profile created using onboarding workflow.",
    user: "Admin – Rajesh Kumar",
    time: "2024-01-12",
  },
  {
    icon: AlertCircle,
    color: "text-amber-600 bg-amber-50",
    title: "Pending Change Raised",
    desc: "RM change request submitted. Awaiting maker-checker approval.",
    user: "RM – Priya Sharma",
    time: "2024-03-01",
  },
  {
    icon: RefreshCcw,
    color: "text-cyan-600 bg-cyan-50",
    title: "Annual KYC Refresh",
    desc: "Periodic KYC re-verification reminder triggered by system.",
    user: "System",
    time: "2025-01-15",
  },
];

export const ActivityTab = ({ client }) => {
  return (
    <div className="p-6 space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
          Activity Log
        </h3>
        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
          {activityData.length} Events
        </span>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-slate-100" />

        <div className="space-y-3">
          {activityData.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex gap-4 relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${item.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-3 hover:border-slate-200 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                    By: {item.user}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
