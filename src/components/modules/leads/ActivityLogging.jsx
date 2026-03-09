import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Input, Select, Textarea } from "../../ui/input";
import { Badge } from "../../ui/badge";
import {
  Clock,
  FileText,
  MessageSquare,
  UploadCloud,
  FileSpreadsheet,
  Paperclip,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useLeadStore } from "../../../store/useLeadStore";
import { cn } from "../../../utils/cn";

const activityTypes = [
  { id: "notes", label: "Notes", icon: MessageSquare },
  { id: "reminders", label: "Reminders", icon: Clock },
  { id: "files", label: "Files", icon: FileText },
];

export const ActivityLogging = ({ onNavigate, initialType = "notes" }) => {
  const { addActivity, addReminder, addDocument, activities } = useLeadStore();
  const [activityType, setActivityType] = useState(initialType);
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState("medium");
  const [file, setFile] = useState(null);
  const [dateTime, setDateTime] = useState(
    new Date().toISOString().slice(0, 16),
  );

  const handleLogActivity = () => {
    const commonActivityData = {
      leadId: "L001", // Defaulting to Rajiv for now
      timestamp: new Date(dateTime).toISOString(),
      description: details,
    };

    if (activityType === "reminders") {
      addReminder({
        ...commonActivityData,
        title: "Reminder Set",
        priority,
        icon: "clock",
      });
    } else if (activityType === "files" && file) {
      addDocument({
        ...commonActivityData,
        title: "File Uploaded",
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`, // Convert bytes to MB
        icon: "file-text",
      });
    } else if (activityType === "notes") {
      addActivity({
        ...commonActivityData,
        title: "Note Added",
        icon: "message-square",
      });
    }

    toast.success("Activity Logged!");
    onNavigate("profile");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 h-full">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Log Lead Activity</CardTitle>
          <CardDescription>
            Record interactions with Rajiv Malhotra (Malhotra Group)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activity Type Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Activity Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border bg-slate-50 p-1.5 rounded-xl border-slate-200">
              {activityTypes.map((type) => {
                const Icon = type.icon;
                const isActive = activityType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setActivityType(type.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                      isActive
                        ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-sm"
                        : "border-transparent bg-white hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-sm",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6 mb-2",
                        isActive ? "text-indigo-600" : "text-slate-400",
                      )}
                    />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Date & Time"
              type="datetime-local"
              defaultValue={new Date().toISOString().slice(0, 16)}
            />
            {activityType === "reminders" && (
              <Select
                label="Priority"
                options={[
                  { value: "low", label: "Low Priority" },
                  { value: "medium", label: "Medium Priority" },
                  { value: "high", label: "High Priority" },
                ]}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />
            )}
          </div>

          {activityType === "files" && (
            <div
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
              onClick={() => document.getElementById("file-upload").click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <UploadCloud className="w-5 h-5 text-slate-400 mb-3 group-hover:text-indigo-500 transition-colors" />
              <p className="text-sm font-medium text-slate-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {file
                  ? `Selected: ${file.name}`
                  : "PDF, Images or Documents (Max 10MB)"}
              </p>
            </div>
          )}

          <div>
            <Textarea
              label={
                activityType === "notes"
                  ? "Activity Details / Notes"
                  : activityType === "reminders"
                    ? "Reminder Context / Task"
                    : "File Description"
              }
              placeholder="Enter details here..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => onNavigate("profile")}>
              Cancel
            </Button>
            <Button
              className="bg-[#1e3a5f] text-white"
              onClick={() => {
                toast.success("Activity logged successfully!");
                onNavigate("profile");
              }}
            >
              Save Activity
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline Preview */}
      <h3 className="text-lg font-semibold text-slate-800 mt-8 mb-4">
        Recent Activity for Rajiv Malhotra
      </h3>
      <div className="space-y-4">
        {activities.slice(0, 5).map((activity) => {
          const formatActivityTimestamp = (timestamp) => {
            if (!timestamp) return "Unknown Date";
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return "Unknown Date";

            const now = new Date();
            const today = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
            );
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

          return (
            <Card key={activity.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex flex-shrink-0 items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-slate-900">
                      {activity.title}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {formatActivityTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {activity.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {activities.length === 0 && (
          <p className="text-sm text-slate-500 italic">
            No recent activity found.
          </p>
        )}
      </div>
    </div>
  );
};
