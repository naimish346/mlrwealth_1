import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { StatusStepper } from "../../ui/Stepper";
import { useAppStore } from "../../../store/appStore";
import { Users, Edit, Shield } from "lucide-react";

const formatCurrency = (value) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
};

const statusSteps = [
  {
    id: "Lead",
    label: "Lead",
    actions: [
      { id: "promote", label: "Promote to Prospect", variant: "primary" },
    ],
  },
  {
    id: "Prospect",
    label: "Prospect",
    actions: [{ id: "onboard", label: "Start Onboarding", variant: "primary" }],
  },
  {
    id: "Onboarding",
    label: "Onboarding",
    actions: [{ id: "activate", label: "Activate Client", variant: "primary" }],
  },
  {
    id: "Active",
    label: "Active",
    actions: [
      { id: "dormant", label: "Mark Dormant", variant: "secondary" },
      { id: "close", label: "Close Account", variant: "danger" },
    ],
  },
  {
    id: "Dormant",
    label: "Dormant",
    actions: [{ id: "reactivate", label: "Reactivate", variant: "primary" }],
  },
  { id: "Closed", label: "Closed", actions: [] },
];

export const OverviewTab = ({ client, onEditRM }) => {
  const { clients } = useAppStore();

  // Find family members
  const familyMembers = client.familyId
    ? clients.filter(
        (c) => c.familyId === client.familyId && c.id !== client.id,
      )
    : [];
  const familyTotalAUM = client.familyId
    ? clients
        .filter((c) => c.familyId === client.familyId)
        .reduce((sum, c) => sum + c.aum, 0)
    : client.aum;

  return (
    <div className="p-6 space-y-6">
      {/* Personal Details Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-[#1e3a5f]" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
            Personal Details
          </h3>
        </div>
        <Card className="border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-8">
              <DetailField
                label="PAN"
                value={client.pan ? `XXXX${client.pan.slice(-4)}` : "—"}
              />
              <DetailField
                label="Date of Birth"
                value={client.dateOfBirth || "—"}
              />
              <DetailField label="Gender" value={client.gender || "—"} />
              <DetailField label="Mobile" value={client.mobile || "—"} />
              <DetailField label="Email" value={client.email || "—"} />
              <DetailField
                label="Address"
                value={
                  client.address
                    ? `${client.address}, ${client.city}, ${client.state} - ${client.pincode}`
                    : "—"
                }
              />
              <DetailField label="CKYC ID" value={client.ckyc || "—"} />
              <DetailField
                label="FATCA Status"
                value={
                  client.fatcaStatus ? (
                    <Badge
                      variant={client.fatcaCompliant ? "success" : "warning"}
                    >
                      {client.fatcaStatus}
                    </Badge>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailField
                label="Tax Residency"
                value={client.taxResidency || "—"}
              />

              {/* Entity Specific Fields */}
              {client.entityType === "Joint" && (
                <>
                  <DetailField
                    label="Joint Holder"
                    value={client.jointHolderName || "—"}
                  />
                  <DetailField
                    label="Joint PAN"
                    value={client.jointHolderPAN || "—"}
                  />
                  <DetailField
                    label="Mode of Op"
                    value={client.modeOfOperation || "—"}
                  />
                </>
              )}

              {client.entityType === "Minor" && (
                <>
                  <DetailField
                    label="Guardian"
                    value={client.guardianName || "—"}
                  />
                  <DetailField
                    label="Guardian PAN"
                    value={client.guardianPAN || "—"}
                  />
                  <DetailField
                    label="Relationship"
                    value={client.guardianRelationship || "—"}
                  />
                </>
              )}

              {client.entityType === "HUF" && (
                <>
                  <DetailField
                    label="Karta Name"
                    value={client.kartaName || "—"}
                  />
                  <DetailField
                    label="Karta PAN"
                    value={client.kartaPAN || "—"}
                  />
                </>
              )}

              {client.entityType === "Corporate" && (
                <>
                  <DetailField label="CIN / LLPIN" value={client.cin || "—"} />
                  <DetailField
                    label="Inc. Date"
                    value={client.incorporationDate || "—"}
                  />
                  <DetailField
                    label="Signatory"
                    value={client.signatoryName || "—"}
                  />
                  <DetailField
                    label="Designation"
                    value={client.signatoryDesignation || "—"}
                  />
                </>
              )}

              {client.entityType === "Trust" && (
                <>
                  <DetailField
                    label="Reg. No"
                    value={client.registrationNumber || "—"}
                  />
                  <DetailField
                    label="Trustee"
                    value={client.trusteeName || "—"}
                  />
                </>
              )}

              {client.entityType === "NRI" && (
                <>
                  <DetailField
                    label="Passport No"
                    value={client.passportNumber || "—"}
                  />
                  <DetailField
                    label="Residence"
                    value={client.countryOfResidence || "—"}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <hr className="border-slate-100" />

      {/* Family Grouping */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-[#1e3a5f]" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
            Family Group
          </h3>
        </div>
        {client.familyId ? (
          <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-lg">
                  {client.familyName}
                </span>
                <span className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
                  Household AUM:{" "}
                  <strong className="text-[#1e3a5f]">
                    {formatCurrency(familyTotalAUM)}
                  </strong>
                </span>
              </div>
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-[#1e3a5f]/30 hover:shadow-sm cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-[#1e3a5f] font-bold shadow-sm group-hover:scale-105 transition-transform">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {member.entityType}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {formatCurrency(member.aum)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-slate-400">No family group linked.</p>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* RM Assignment */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#1e3a5f]" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
              RM Assignment
            </h3>
          </div>
          <button
            onClick={onEditRM}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1e3a5f] bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 px-3 py-1.5 rounded-md transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Assignment
          </button>
        </div>
        <Card className="border-slate-200/60 shadow-sm bg-white/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DetailField
                label="Relationship Manager"
                value={client.rmName || "—"}
              />
              <DetailField
                label="Sub-Advisor"
                value={client.subAdvisor || "—"}
              />
              <DetailField
                label="Introducer"
                value={client.introducer || "—"}
              />
              <DetailField
                label="Validity From"
                value={client.rmValidityFrom || "—"}
              />
              <DetailField
                label="Validity To"
                value={client.rmValidityTo || "—"}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <hr className="border-slate-100" />

      {/* Client Status Workflow */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
          Client Lifecycle
        </h3>
        <Card>
          <CardContent className="p-4">
            <StatusStepper
              steps={statusSteps}
              currentStatus={client.status}
              onAction={(actionId) => {
                console.log("Status action:", actionId);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DetailField = ({ label, value }) => (
  <div className="space-y-1.5">
    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
      {label}
    </p>
    <div className="text-sm font-medium text-slate-800 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-100/50">
      {value}
    </div>
  </div>
);
