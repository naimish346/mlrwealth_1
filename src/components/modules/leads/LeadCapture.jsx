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
import {
  UploadCloud,
  CheckCircle2,
  UserPlus,
  FileSpreadsheet,
  AlertTriangle,
  UserCircle, // Added UserCircle as per instruction
  List,
} from "lucide-react";
import { toast } from "sonner";
import { useLeadStore } from "../../../store/useLeadStore";

export const LeadCapture = ({ onNavigate, captureMode, setCaptureMode }) => {
  const { addLead } = useLeadStore();
  const activeTab = captureMode || "direct";
  const setActiveTab = setCaptureMode || (() => {});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    source: "web",
    company: "",
    title: "",
    description: "",
    notes: "",
    type: "new business",
    expectedCloseDate: "",
    assignedTo: "Priya Sharma",
    value: "",
  });

  const [importStatus, setImportStatus] = useState("idle"); // 'idle' | 'mapping' | 'success'

  return (
    <div className="space-y-6 animate-fade-in pb-10 h-full pt-4">
      {activeTab === "direct" && (
        <Card className="shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
            <CardDescription>
              Enter the details of the new lead to capture them into the CRM.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <Select
                label="Lead Source"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                options={[
                  { value: "web", label: "Web" },
                  { value: "email", label: "Email" },
                  { value: "web form", label: "Web Form" },
                  { value: "phone", label: "Phone" },
                  { value: "direct", label: "Direct" },
                ]}
              />
              <Select
                label="Lead Type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                options={[
                  { value: "new business", label: "New Business" },
                  { value: "existing business", label: "Existing Business" },
                ]}
              />
              <Input
                label="Expected Close Date"
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expectedCloseDate: e.target.value,
                  })
                }
              />
              <Select
                label="Assign To"
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
                options={[
                  { value: "Priya Sharma", label: "Priya Sharma" },
                  { value: "Rajesh Kumar", label: "Rajesh Kumar" },
                  { value: "Sanjay Desai", label: "Sanjay Desai" },
                  { value: "Anita Singh", label: "Anita Singh" },
                ]}
              />
              <Input
                label="Lead Value (₹)"
                type="number"
                placeholder="e.g. 500000"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
              />
              <Input
                label="Company/Organization"
                placeholder="Optional"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />
              <Input
                label="Description"
                placeholder="Brief description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-medium text-slate-900 mb-4">
                Additional Context
              </h3>
              <Textarea
                label="Initial Notes / Requirements"
                placeholder="What is the lead looking for? Any specific financial goals discussed?"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
              />
            </div>

            {/* Duplicate Detection Warning Mock */}
            {formData.email && formData.email.includes("test") && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800">
                    Possible Duplicate Detected
                  </h4>
                  <p className="text-sm text-amber-700 mt-1">
                    A lead with a similar email (test@example.com) already
                    exists. Would you like to view the existing lead instead?
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => onNavigate("dashboard")}>
                Cancel
              </Button>
              <Button
                className="bg-[#1e3a5f] text-white"
                onClick={() => {
                  if (!formData.name) {
                    toast.error("Please enter a full name.");
                    return;
                  }
                  addLead({
                    name: formData.name,
                    company: formData.company || "Individual",
                    designation: formData.title,
                    email: formData.email,
                    phone: formData.phone,
                    source: formData.source,
                    type: formData.type,
                    expectedCloseDate: formData.expectedCloseDate,
                    assignedTo: formData.assignedTo,
                    value: parseInt(formData.value) || 0,
                    stage: "New",
                    rm: formData.assignedTo,
                    description: formData.description,
                    notes: formData.notes,
                  });
                  toast.success("Lead captured successfully!");
                  onNavigate("list");
                }}
              >
                Save Lead
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "bulk" && (
        <Card className="border-t-4 border-t-blue-500 border-x-0 border-b-0 shadow-md">
          <CardHeader>
            <CardTitle>Import Leads from CSV</CardTitle>
            <CardDescription>
              Upload a CSV file to bulk import leads. You will be able to map
              columns on the next step.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {importStatus === "idle" && (
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => setImportStatus("mapping")}
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Click to Upload or Drag and Drop
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mb-6">
                  Support for .csv, .xls, .xlsx files up to 10MB.
                </p>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="text-sm text-blue-600 font-medium hover:underline"
                  >
                    Download Template
                  </a>
                </div>
              </div>
            )}

            {importStatus === "mapping" && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">
                      File uploaded: leads_q3.csv
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      We detected 45 rows. Please map your columns below.
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 bg-slate-50 p-3 border-b border-slate-200 font-medium text-sm text-slate-700">
                    <div>Your CSV Column</div>
                    <div>CRM Field</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {[
                      "First Name",
                      "Last Name",
                      "Email",
                      "Phone",
                      "Company",
                    ].map((col, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-2 p-3 items-center"
                      >
                        <div className="text-sm text-slate-600">
                          {col}{" "}
                          <span className="text-slate-400 text-xs">
                            (e.g. "Sample Data")
                          </span>
                        </div>
                        <div>
                          <Select
                            value={col.toLowerCase().replace(" ", "")}
                            options={[
                              { value: "firstname", label: "First Name" },
                              { value: "lastname", label: "Last Name" },
                              { value: "email", label: "Email Address" },
                              { value: "phone", label: "Phone Number" },
                              { value: "company", label: "Company" },
                              { value: "ignore", label: "-- Ignore Column --" },
                            ]}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setImportStatus("idle")}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setImportStatus("success")}>
                    Import 45 Leads
                  </Button>
                </div>
              </div>
            )}

            {importStatus === "success" && (
              <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Import Successful!
                </h3>
                <p className="text-slate-500 max-w-md mb-8">
                  45 new leads have been added to your pipeline and marked as
                  'New' stage.
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setImportStatus("idle")}
                  >
                    Import Another File
                  </Button>
                  <Button onClick={() => onNavigate("list")}>
                    Go to Pipeline
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
