import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Upload } from "lucide-react";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  UserCircle,
  Clock,
  Calendar,
  FileText,
  CheckCircle,
  ArrowRight,
  Activity,
  Percent,
  Star,
  MessageSquare,
  Edit,
  Settings,
  X,
  ChevronDown,
  Briefcase,
  User,
  Plus,
  PlusCircle,
  X as XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../utils/cn";
import { useLeadStore } from "../../../store/useLeadStore";
import { GlobalRemindersCreate } from "../reminders/GlobalRemindersCreate";
import { LeadNoteSlideover } from "./LeadNoteSlideover";
import { LeadDocSlideover } from "./LeadDocSlideover";

const leadMocks = {
  id: "L001",
  name: "Rajiv Malhotra",
  company: "Malhotra Group",
  stage: "Negotiation",
  score: 85,
  value: 5000000,
  source: "Website",
  email: "rajiv@malhotragroup.in",
  phone: "+91 98765 12345",
  location: "Mumbai, India",
  addedOn: "25-10-2023",
  rm: "Priya Sharma",
};

const profileTabs = [
  { id: "overview", label: "Overview", icon: UserCircle },
  { id: "reminders", label: "Reminders", icon: Clock },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "notes", label: "Notes", icon: MessageSquare },
  { id: "conversion", label: "Conversion", icon: ArrowRight },
];

const STAGES = ["New", "Follow-up", "Prospect", "Negotiation", "Won", "Lost"];

export const LeadProfile = ({ onNavigate }) => {
  const { leads, updateLeadStage, updateLeadInfo, activities, reminders } =
    useLeadStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [newNote, setNewNote] = useState("");

  // For now, we'll focus on the first lead (Rajiv Malhotra)
  const leadInfo = leads[0] || {};
  const currentStage = leadInfo.stage || "New";

  const handleStageChange = (newStage) => {
    updateLeadStage(leadInfo.id, newStage);
    toast.success(`Lead stage updated to ${newStage}`);
  };

  const [editForm, setEditForm] = useState({
    ...leadInfo,
    email: Array.isArray(leadInfo.email)
      ? leadInfo.email
      : [leadInfo.email || ""],
    phone: Array.isArray(leadInfo.phone)
      ? leadInfo.phone
      : [leadInfo.phone || ""],
  });

  const saveEdit = () => {
    // Clean up empty arrays before saving
    const cleanedForm = {
      ...editForm,
      email: editForm.email.filter((e) => e.trim() !== ""),
      phone: editForm.phone.filter((p) => p.trim() !== ""),
    };
    updateLeadInfo(leadInfo.id, cleanedForm);
    setIsEditing(false);
    toast.success("Lead information updated successfully");
  };

  const { addActivity } = useLeadStore.getState();

  const saveNote = () => {
    if (!newNote.trim()) return;
    addActivity({
      leadId: leadInfo.id,
      type: "note",
      title: "Added Note",
      description: newNote,
    });
    setNewNote("");
    setIsNoteModalOpen(false);
  };

  const allActivities = activities
    .filter((activity) => activity.leadId === leadInfo.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const leadNotes = allActivities.filter((a) => a.type === "note");
  const leadActivities = allActivities.filter((a) => a.type !== "note");

  const formatActivityTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown Date";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Unknown Date";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const activityDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    if (activityDate.getTime() === today.getTime()) {
      return `Today, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (activityDate.getTime() === today.getTime() - 86400000) {
      return `Yesterday, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      return `${d}-${m}-${y}`;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "call":
        return <Phone className="w-3 h-3 text-blue-600" />;
      case "email":
        return <Mail className="w-3 h-3 text-emerald-600" />;
      case "note":
        return <MessageSquare className="w-3 h-3 text-amber-600" />;
      case "file":
        return <FileText className="w-3 h-3 text-purple-600" />;
      case "reminder":
        return <Clock className="w-3 h-3 text-orange-600" />;
      default:
        return <Activity className="w-3 h-3 text-slate-600" />;
    }
  };

  const getActivityBgColor = (type) => {
    switch (type) {
      case "call":
        return "bg-blue-100";
      case "email":
        return "bg-emerald-100";
      case "note":
        return "bg-amber-100";
      case "file":
        return "bg-purple-100";
      case "reminder":
        return "bg-orange-100";
      default:
        return "bg-slate-100";
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Key Information</CardTitle>
            {isEditing && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="h-8 bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm(leadInfo);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8 bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90"
                  onClick={saveEdit}
                >
                  Save
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Name Field */}
              <div>
                <p className="text-xs text-slate-500 mb-1">Lead Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full text-sm font-medium text-slate-800 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <UserCircle className="w-4 h-4 text-slate-400" />{" "}
                    {leadInfo.name}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Company / Organization
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.company || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, company: e.target.value })
                    }
                    className="w-full text-sm font-medium text-slate-800 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <Building2 className="w-4 h-4 text-slate-400" />{" "}
                    {leadInfo.company}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Designation / Title
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.designation || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, designation: e.target.value })
                    }
                    className="w-full text-sm font-medium text-slate-800 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <UserCircle className="w-4 h-4 text-slate-400" />{" "}
                    {leadInfo.designation || "N/A"}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Estimated Value</p>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.value || 0}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        value: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full text-sm font-medium text-emerald-600 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    ₹{(leadInfo.value / 100000).toFixed(2)} Lakhs
                  </div>
                )}
              </div>
              {/* Email Field - Array Support */}
              <div>
                <p className="text-xs text-slate-500 mb-1">Email Addresses</p>
                {isEditing ? (
                  <div className="space-y-2">
                    {editForm.email.map((email, idx) => (
                      <div
                        key={`email-${idx}`}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            const newEmails = [...editForm.email];
                            newEmails[idx] = e.target.value;
                            setEditForm({ ...editForm, email: newEmails });
                          }}
                          className="flex-1 text-sm text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Email address"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newEmails = editForm.email.filter(
                              (_, i) => i !== idx,
                            );
                            setEditForm({ ...editForm, email: newEmails });
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          email: [...editForm.email, ""],
                        })
                      }
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Add Email
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {(Array.isArray(leadInfo.email)
                      ? leadInfo.email
                      : [leadInfo.email]
                    ).map((email, idx) =>
                      email ? (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-slate-700"
                        >
                          <Mail className="w-4 h-4 text-slate-400" /> {email}
                        </div>
                      ) : null,
                    )}
                  </div>
                )}
              </div>

              {/* Phone Field - Array Support */}
              <div>
                <p className="text-xs text-slate-500 mb-1">Phone Numbers</p>
                {isEditing ? (
                  <div className="space-y-2">
                    {editForm.phone.map((phone, idx) => (
                      <div
                        key={`phone-${idx}`}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => {
                            const newPhones = [...editForm.phone];
                            newPhones[idx] = e.target.value;
                            setEditForm({ ...editForm, phone: newPhones });
                          }}
                          className="flex-1 text-sm text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Phone number"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newPhones = editForm.phone.filter(
                              (_, i) => i !== idx,
                            );
                            setEditForm({ ...editForm, phone: newPhones });
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          phone: [...editForm.phone, ""],
                        })
                      }
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Add Phone
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {(Array.isArray(leadInfo.phone)
                      ? leadInfo.phone
                      : [leadInfo.phone]
                    ).map((phone, idx) =>
                      phone ? (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-slate-700"
                        >
                          <Phone className="w-4 h-4 text-slate-400" /> {phone}
                        </div>
                      ) : null,
                    )}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Location</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.location || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400" />{" "}
                    {leadInfo.location}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Source</p>
                {isEditing ? (
                  <select
                    value={editForm.source || "web"}
                    onChange={(e) =>
                      setEditForm({ ...editForm, source: e.target.value })
                    }
                    className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="web">Web</option>
                    <option value="email">Email</option>
                    <option value="web form">Web Form</option>
                    <option value="phone">Phone</option>
                    <option value="direct">Direct</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Badge variant="outline" className="capitalize">
                      {leadInfo.source}
                    </Badge>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Lead Type</p>
                {isEditing ? (
                  <select
                    value={editForm.type || "new business"}
                    onChange={(e) =>
                      setEditForm({ ...editForm, type: e.target.value })
                    }
                    className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="new business">New Business</option>
                    <option value="existing business">Existing Business</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-700 capitalize">
                    <Briefcase className="w-4 h-4 text-slate-400" />{" "}
                    {leadInfo.type || "new business"}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Expected Close Date
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="dd-mm-yyyy"
                    value={editForm.expectedCloseDate || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        expectedCloseDate: e.target.value,
                      })
                    }
                    className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />{" "}
                    {leadInfo.expectedCloseDate || "Not set"}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Assigned To</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.assignedTo || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, assignedTo: e.target.value })
                    }
                    className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <User className="w-4 h-4 text-slate-400" />{" "}
                    {leadInfo.assignedTo || "Unassigned"}
                  </div>
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-800 mb-1">
                Description / Purpose
              </h4>
              <p className="text-sm text-slate-500 mb-3 italic">
                Brief summary of why this lead was captured
              </p>
              {isEditing ? (
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={2}
                  className="w-full text-sm text-slate-600 bg-white border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                />
              ) : (
                <p className="text-sm text-slate-600 mb-4 bg-indigo-50/30 p-3 rounded-lg border border-indigo-100/50">
                  {leadInfo.description || "No description provided."}
                </p>
              )}

              <h4 className="text-sm font-semibold text-slate-800 mb-2 pt-2 border-t border-slate-50">
                Lead Notes
              </h4>
              {isEditing ? (
                <textarea
                  value={editForm.notes || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  rows={4}
                  className="w-full text-sm text-slate-600 bg-white border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {leadInfo.notes}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 col-span-2">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative border-l-2 border-slate-200 ml-2 space-y-6 pb-4">
              {leadActivities.length > 0 ? (
                leadActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="relative pl-6">
                    <span
                      className={cn(
                        "absolute -left-[11px] top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center",
                        getActivityBgColor(activity.type),
                      )}
                    >
                      {getActivityIcon(activity.type)}
                    </span>
                    <div>
                      <h4 className="text-sm font-medium text-slate-800">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-slate-500 mb-1">
                        {formatActivityTimestamp(activity.timestamp)}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="pl-6 text-sm text-slate-500 italic">
                  No activity yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Notes</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Timeline of all interactions
            </p>
          </div>
          <Button
            size="sm"
            className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90 shadow-sm"
            onClick={() => setIsNoteModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Notes
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
            {leadNotes.length > 0 ? (
              leadNotes.map((activity) => (
                <div key={activity.id} className="relative pl-6">
                  <span
                    className={cn(
                      "absolute -left-[11px] top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center",
                      getActivityBgColor(activity.type),
                    )}
                  >
                    {getActivityIcon(activity.type)}
                  </span>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-800">
                        {activity.title}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {formatActivityTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="pl-6 text-sm text-slate-500 italic">
                No notes recorded yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReminders = () => (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Tasks & Meetings</CardTitle>
          <Button
            size="sm"
            className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90 shadow-sm"
            onClick={() => setIsReminderOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Reminder
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders
              .filter((r) => r.leadId === leadInfo.id)
              .map((reminder) => {
                const [day, month, year] = reminder.date.split("-");
                return (
                  <div
                    key={reminder.id}
                    className="border border-slate-200 rounded-xl p-4 flex gap-4 hover:border-indigo-300 transition-colors"
                  >
                    <div className="bg-indigo-50 text-indigo-700 rounded-lg p-3 text-center min-w-[60px] flex flex-col justify-center border border-indigo-100">
                      <span className="text-2xl font-black">{day}</span>
                      <span className="text-xs font-bold border-t border-indigo-200 pt-1 mt-1">
                        {month}-{year}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">
                        {reminder.title}
                      </h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mb-2">
                        <Clock className="w-3 h-3" /> {reminder.time}
                      </p>
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            reminder.priority === "high" ? "warning" : "outline"
                          }
                        >
                          {reminder.priority === "high"
                            ? "High Priority"
                            : "Regular"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            {reminders.filter((r) => r.leadId === leadInfo.id).length === 0 && (
              <div className="col-span-2 text-center py-8 text-slate-500 italic">
                No upcoming tasks for this lead
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shared Documents</CardTitle>
          <Button
            size="sm"
            className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90 shadow-sm"
            onClick={() => setIsDocModalOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" /> Upload
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-xl divide-y divide-slate-100">
            <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 text-rose-600 rounded">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Q3_Performance_Deck.pdf
                  </h4>
                  <p className="text-xs text-slate-500">
                    2.4 MB • Uploaded 24-10-2023
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-400">
                Download
              </Button>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Draft_Prospect_v1.docx
                  </h4>
                  <p className="text-xs text-slate-500">
                    1.1 MB • Uploaded 25-10-2023
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-400">
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConversion = () => (
    <div className="animate-fade-in">
      <Card className="border-t-4 border-t-emerald-500 border-x-0 border-b-0 shadow-md bg-emerald-50/30">
        <CardContent className="p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRight className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Ready for Onboarding?
          </h2>
          <p className="text-slate-600 max-w-md mx-auto mb-6">
            This lead has reached the Negotiation stage and has a high
            probability of closing. Initiate the conversion wizard to promote
            Rajiv Malhotra to an active Client.
          </p>
          <Button
            className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white shadow-md px-8 py-6 text-lg h-auto"
            onClick={() => onNavigate("conversion")}
          >
            Start Conversion Wizard
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex gap-4 items-center md:items-start flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
              {leadInfo.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-900">
                  {leadInfo.name}
                </h2>
                <div className="relative group">
                  <select
                    value={currentStage}
                    onChange={(e) => handleStageChange(e.target.value)}
                    className={cn(
                      "appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer",
                      currentStage === "Negotiation"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : currentStage === "Won"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : currentStage === "Lost"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-50 text-slate-700 border-slate-200",
                    )}
                  >
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                </div>
                <Button
                  size="sm"
                  className="h-7 px-2 bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90 gap-1.5"
                  onClick={() => {
                    setActiveTab("overview");
                    setIsEditing(true);
                  }}
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Button>
              </div>
              <p className="text-slate-500">
                {leadInfo.company} • Added {leadInfo.addedOn} by {leadInfo.rm}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Tabs Config */}
        <div className="flex gap-6 mt-8 border-b border-slate-200 overflow-x-auto scrollbar-hide">
          {profileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 pb-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap",
                  isActive
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800",
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Area */}
      <div>
        {activeTab === "overview" && renderOverview()}
        {activeTab === "notes" && renderNotes()}
        {activeTab === "reminders" && renderReminders()}
        {activeTab === "documents" && renderDocuments()}
        {activeTab === "conversion" && renderConversion()}
      </div>

      {/* Side-overs */}
      <LeadNoteSlideover
        open={isNoteModalOpen}
        onOpenChange={setIsNoteModalOpen}
        leadId={leadInfo.id}
      />
      <LeadDocSlideover
        open={isDocModalOpen}
        onOpenChange={setIsDocModalOpen}
        leadId={leadInfo.id}
      />
      <GlobalRemindersCreate
        open={isReminderOpen}
        onOpenChange={setIsReminderOpen}
        leadId={leadInfo.id}
      />
    </div>
  );
};
