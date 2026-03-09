import { useState } from "react";
import {
  Eye,
  FileText,
  Landmark,
  Users,
  FolderOpen,
  MessageSquare,
  Activity,
  ArrowLeft,
  Edit,
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Tabs } from "../../ui/tabs";
import { useAppStore } from "../../../store/appStore";
import { OverviewTab } from "./OverviewTab";
import { BankAccountsTab } from "./BankAccountsTab";
import { NomineesTab } from "./NomineesTab";
import { CommunicationLogTab } from "./CommunicationLogTab";
import { DocumentsTab } from "./DocumentsTab";
import { ActivityTab } from "./ActivityTab";
import { MakerCheckerPanel } from "./MakerCheckerPanel";

const maskPAN = (pan) => (pan ? `XXXX${pan.slice(-4)}` : "—");

const getStatusBadge = (status) => {
  const variants = {
    Active: "success",
    Lead: "info",
    Prospect: "warning",
    Dormant: "warning",
    Closed: "error",
  };
  return <Badge variant={variants[status]}>{status}</Badge>;
};

const getEntityBadge = (type) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1e3a5f]/10 text-[#1e3a5f]">
      {type}
    </span>
  );
};

const profileTabs = [
  { id: "overview", label: "Overview", icon: <Eye className="w-4 h-4" /> },
  { id: "kyc", label: "KYC", icon: <FileText className="w-4 h-4" /> },
  {
    id: "bank",
    label: "Bank Accounts",
    icon: <Landmark className="w-4 h-4" />,
  },
  { id: "nominees", label: "Nominees", icon: <Users className="w-4 h-4" /> },
  {
    id: "documents",
    label: "Documents",
    icon: <FolderOpen className="w-4 h-4" />,
  },
  {
    id: "communication",
    label: "Communication Log",
    icon: <MessageSquare className="w-4 h-4" />,
  },
  { id: "activity", label: "Activity", icon: <Activity className="w-4 h-4" /> },
];

export const ClientProfile = ({ client, onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showMakerChecker, setShowMakerChecker] = useState(false);
  const { getClientPendingChanges } = useAppStore();

  const pendingChanges = getClientPendingChanges(client.id);
  const hasPendingChanges =
    pendingChanges.filter((c) => c.status === "Pending").length > 0;

  const tabsWithCounts = profileTabs.map((tab) => {
    if (tab.id === "bank")
      return { ...tab, count: client.bankAccounts?.length || 0 };
    if (tab.id === "nominees")
      return { ...tab, count: client.nominees?.length || 0 };
    return tab;
  });

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            client={client}
            onEditRM={() => setShowMakerChecker(true)}
          />
        );
      case "kyc":
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                KYC Details
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${client.kycStatus === "Verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${client.kycStatus === "Verified" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
                />
                {client.kycStatus || "Pending"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: "CKYC Registry ID",
                  value: client.ckyc || "54021 89043 01",
                },
                { label: "KYC Mode", value: "eKYC – Aadhaar OTP" },
                { label: "KYC Date", value: client.dateJoined || "2024-01-15" },
                { label: "Risk Category", value: "Low Risk (Category I)" },
                { label: "Aadhaar Linked", value: "XXXX-XXXX-4523 ✓" },
                {
                  label: "PAN Verified",
                  value: client.pan ? `${client.pan} ✓` : "—",
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className="bg-slate-50/70 rounded-xl p-4 border border-slate-100"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {row.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">
                Documents Verified
              </h4>
              <div className="space-y-2">
                {[
                  { doc: "PAN Card", status: "Verified", date: "2024-01-15" },
                  {
                    doc: "Aadhaar Card (Front & Back)",
                    status: "Verified",
                    date: "2024-01-15",
                  },
                  {
                    doc: "Address Proof – Utility Bill",
                    status: "Verified",
                    date: "2024-01-20",
                  },
                  {
                    doc: "Income Tax Return (ITR-V)",
                    status: "Pending",
                    date: "—",
                  },
                ].map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5 bg-white rounded-lg border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700 font-medium">
                        {d.doc}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">{d.date}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full ${d.status === "Verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {d.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "bank":
        return <BankAccountsTab client={client} />;
      case "nominees":
        return <NomineesTab client={client} />;
      case "documents":
        return <DocumentsTab client={client} />;
      case "communication":
        return <CommunicationLogTab client={client} />;
      case "activity":
        return <ActivityTab client={client} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#1e3a5f] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to clients
      </button>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Photo placeholder */}
            <div className="w-20 h-20 bg-gradient-to-br from-[#1e3a5f] to-[#2a5f8f] rounded-full flex items-center justify-center text-white font-bold text-3xl shrink-0 shadow-lg">
              {client.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  {client.name}
                </h1>
                <div className="flex items-center gap-2">
                  {getEntityBadge(client.entityType)}
                  {getStatusBadge(client.status)}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="font-mono">{maskPAN(client.pan)}</span>
                <span>
                  RM:{" "}
                  <strong className="text-slate-700">{client.rmName}</strong>
                </span>
                {client.familyName && (
                  <span>
                    Family:{" "}
                    <strong className="text-slate-700">
                      {client.familyName}
                    </strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {hasPendingChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMakerChecker(true)}
                  className="border-amber-300 text-amber-600 hover:bg-amber-50"
                >
                  {pendingChanges.filter((c) => c.status === "Pending").length}{" "}
                  Pending
                </Button>
              )}
              <Button
                size="sm"
                className="px-4 py-1.5 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#1e3a5f]/90 transition-colors"
                onClick={() => onEdit(client)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <Card>
        <Tabs
          tabs={tabsWithCounts}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        <CardContent className="p-0">{renderTab()}</CardContent>
      </Card>

      {/* Maker-Checker Drawer */}
      <MakerCheckerPanel
        isOpen={showMakerChecker}
        onClose={() => setShowMakerChecker(false)}
        clientId={client.id}
      />
    </div>
  );
};
