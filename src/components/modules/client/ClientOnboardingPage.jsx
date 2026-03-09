import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Users,
  Baby,
  Building2,
  Globe,
  Shield,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Briefcase,
  MapPin,
  CreditCard,
  Info,
  ChevronRight,
  LayoutList,
  Search,
  CheckCircle,
  Clock,
  Plus,
  Mail,
  Phone,
  Building,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input, Select } from "../../ui/input";
import { Stepper } from "../../ui/Stepper";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import { cn } from "../../../utils/cn";
import { toast } from "sonner";
import { useAppStore } from "../../../store/appStore";

const entityTypes = [
  {
    id: "Individual",
    label: "Individual",
    icon: User,
    desc: "Single person account",
  },
  { id: "Joint", label: "Joint", icon: Users, desc: "Joint holders account" },
  { id: "Minor", label: "Minor", icon: Baby, desc: "Minor with guardian" },
  { id: "HUF", label: "HUF", icon: Shield, desc: "Hindu Undivided Family" },
  {
    id: "Corporate",
    label: "Corporate",
    icon: Building2,
    desc: "Company / LLP",
  },
  { id: "Trust", label: "Trust", icon: Shield, desc: "Trust or Society" },
  { id: "NRI", label: "NRI", icon: Globe, desc: "Non-Resident Indian" },
];

const steps = [
  { id: "basic", label: "Primary Details" },
  { id: "bank", label: "Bank & Nominee" },
  { id: "review", label: "Final Review" },
  { id: "kyc", label: "KYC Verification" },
];

export const ClientOnboardingPage = ({ clientToEdit }) => {
  const navigate = useNavigate();
  const { addClient, updateClient } = useAppStore();

  // In edit mode, skip the KYC Verification step
  const activeSteps = clientToEdit
    ? steps.filter((s) => s.id !== "kyc")
    : steps;

  const defaultFormData = {
    entityType: "",
    name: "",
    pan: "",
    dob: "",
    gender: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    jointHolderName: "",
    jointHolderPAN: "",
    jointHolderDOB: "",
    modeOfOperation: "Either or Survivor",
    guardianName: "",
    guardianPAN: "",
    guardianRelationship: "Father",
    hufName: "",
    kartaName: "",
    kartaPAN: "",
    kartaDOB: "",
    companyName: "",
    cin: "",
    incorporationDate: "",
    signatoryName: "",
    signatoryDesignation: "",
    registrationNumber: "",
    trustDeedDate: "",
    trustType: "Private",
    trusteeName: "",
    passportNumber: "",
    countryOfResidence: "",
    nreNroPreference: "NRE",
    femaDeclaration: false,
    bankName: "",
    accountNumber: "",
    ifsc: "",
    accountType: "Savings",
    nomineeName: "",
    nomineeRelationship: "",
    nomineePercentage: "100",
  };

  // Restore step: only if we're in edit mode for the same client
  const editClientId = clientToEdit?.id || null;
  const savedEditId = sessionStorage.getItem("editingClientId");
  const hasSameDraft = editClientId && editClientId === savedEditId;

  // Restore step from sessionStorage to survive page reload
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      return hasSameDraft
        ? parseInt(sessionStorage.getItem("onboardingStep") || "0", 10)
        : 0;
    } catch {
      return 0;
    }
  });

  // Restore formData: for edit — use saved draft only if it belongs to the same client
  // For new — use saved draft or defaults
  const [formData, setFormData] = useState(() => {
    if (clientToEdit) {
      if (hasSameDraft) {
        try {
          const saved = sessionStorage.getItem("onboardingFormData");
          if (saved) return { ...defaultFormData, ...JSON.parse(saved) };
        } catch {}
      }
      // Always fall back to client's actual data for edit mode
      return { ...defaultFormData, ...clientToEdit };
    }
    // New client: restore draft if any
    try {
      if (!savedEditId) {
        const saved = sessionStorage.getItem("onboardingFormData");
        if (saved) return { ...defaultFormData, ...JSON.parse(saved) };
      }
    } catch {}
    return defaultFormData;
  });

  const [kycLoading, setKycLoading] = useState(false);
  const [kycFetched, setKycFetched] = useState(() => {
    try {
      return (
        hasSameDraft &&
        sessionStorage.getItem("onboardingKycFetched") === "true"
      );
    } catch {
      return false;
    }
  });
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");

  // On mount in edit mode: stamp the client id and seed sessionStorage
  useEffect(() => {
    if (clientToEdit) {
      if (!hasSameDraft) {
        // Fresh edit for this client — clear any old draft
        const merged = { ...defaultFormData, ...clientToEdit };
        setFormData(merged);
        sessionStorage.setItem("onboardingFormData", JSON.stringify(merged));
        sessionStorage.setItem("editingClientId", clientToEdit.id);
        sessionStorage.setItem("onboardingStep", "0");
        setCurrentStep(0);
        if (clientToEdit.kycStatus === "Verified") {
          setKycFetched(true);
          sessionStorage.setItem("onboardingKycFetched", "true");
        } else {
          sessionStorage.removeItem("onboardingKycFetched");
        }
      }
    } else {
      // New client mode — clear any leftover edit stamp
      sessionStorage.removeItem("editingClientId");
    }
  }, [clientToEdit?.id]);

  const updateField = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      sessionStorage.setItem("onboardingFormData", JSON.stringify(next));
      return next;
    });
  };

  const handleNext = () => {
    const next = currentStep + 1;
    if (next < steps.length) {
      setCurrentStep(next);
      sessionStorage.setItem("onboardingStep", String(next));
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      sessionStorage.setItem("onboardingStep", String(prev));
    } else {
      clearSessionDraft();
      navigate("/clients");
    }
  };

  const clearSessionDraft = () => {
    sessionStorage.removeItem("onboardingFormData");
    sessionStorage.removeItem("onboardingStep");
    sessionStorage.removeItem("onboardingKycFetched");
    sessionStorage.removeItem("editingClient");
    sessionStorage.removeItem("editingClientId");
  };

  const handleKYCFetch = () => {
    setKycLoading(true);
    setTimeout(() => {
      setKycLoading(false);
      setKycFetched(true);
      sessionStorage.setItem("onboardingKycFetched", "true");
      toast.success("KYC details fetched successfully!");
    }, 2000);
  };

  const handleSubmit = () => {
    if (clientToEdit) {
      updateClient(clientToEdit.id, formData);
      toast.success("Client details updated successfully!");
    } else {
      const newClient = {
        ...formData,
        id: `CL${Math.floor(1000 + Math.random() * 9000)}`,
        status: "Prospect",
        kycStatus: kycFetched ? "Verified" : "Pending",
        aum: 0,
        dateJoined: new Date().toISOString().split("T")[0],
        rmName: "Priya Sharma",
      };
      addClient(newClient);
      toast.success("Registration request submitted to Ops for verification.");
    }
    clearSessionDraft();
    navigate("/clients/list");
  };

  const renderContactFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 col-span-full mt-6 pt-6 border-t border-slate-100">
      <h3 className="col-span-full text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-blue-600" />
        Contact Information
      </h3>
      <Input
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => updateField("email", e.target.value)}
        placeholder="rahul.sharma@example.com"
      />
      <Input
        label="Mobile Number"
        type="tel"
        value={formData.mobile}
        onChange={(e) => updateField("mobile", e.target.value)}
        placeholder="+91 98765 43210"
      />
      <Input
        label="Residence Address"
        className="col-span-full"
        value={formData.address}
        onChange={(e) => updateField("address", e.target.value)}
        placeholder="Street, Building, Flat No."
      />
      <div className="grid grid-cols-3 gap-4 col-span-full">
        <Input
          label="City"
          value={formData.city}
          onChange={(e) => updateField("city", e.target.value)}
          placeholder="e.g. Mumbai"
        />
        <Input
          label="State"
          value={formData.state}
          onChange={(e) => updateField("state", e.target.value)}
          placeholder="e.g. Maharashtra"
        />
        <Input
          label="Pincode"
          value={formData.pincode}
          onChange={(e) => updateField("pincode", e.target.value)}
          placeholder="400001"
        />
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Entity Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <LayoutList className="w-4 h-4 text-blue-600" />
                  Select Entity Type
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
                  Required
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {entityTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.entityType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => updateField("entityType", type.id)}
                      className={cn(
                        "relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border-2",
                        isSelected
                          ? "bg-blue-50/30 border-blue-600 shadow-sm ring-4 ring-blue-600/5"
                          : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50",
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-all duration-300",
                          isSelected
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                            : "bg-slate-100 text-slate-400",
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <span
                        className={cn(
                          "text-[9px] font-semibold tracking-tight uppercase",
                          isSelected ? "text-blue-700" : "text-slate-500",
                        )}
                      >
                        {type.label}
                      </span>

                      {isSelected && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Basic Details Section */}
            {formData.entityType && (
              <div className="pt-8 border-t border-slate-100 animate-in slide-in-from-top-2 duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    {formData.entityType} Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Conditional Fields based on Entity Type */}
                  {(formData.entityType === "Individual" ||
                    formData.entityType === "NRI" ||
                    formData.entityType === "Joint") && (
                    <>
                      <Input
                        label="Full Name (as per PAN) *"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                      />
                      <Input
                        label="PAN Number *"
                        placeholder="ABCDE1234F"
                        value={formData.pan}
                        onChange={(e) =>
                          updateField("pan", e.target.value.toUpperCase())
                        }
                        maxLength={10}
                      />
                      <Input
                        label="Date of Birth"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => updateField("dob", e.target.value)}
                      />
                      <Select
                        label="Gender"
                        value={formData.gender}
                        onChange={(e) => updateField("gender", e.target.value)}
                        options={[
                          { value: "Male", label: "Male" },
                          { value: "Female", label: "Female" },
                          { value: "Other", label: "Other" },
                        ]}
                      />
                    </>
                  )}

                  {formData.entityType === "Joint" && (
                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                      <h4 className="col-span-full text-[10px] font-semibold text-slate-600 uppercase flex items-center gap-2 tracking-widest">
                        Joint Holder Details
                      </h4>
                      <Input
                        label="Name"
                        value={formData.jointHolderName}
                        onChange={(e) =>
                          updateField("jointHolderName", e.target.value)
                        }
                      />
                      <Input
                        label="PAN"
                        value={formData.jointHolderPAN}
                        onChange={(e) =>
                          updateField(
                            "jointHolderPAN",
                            e.target.value.toUpperCase(),
                          )
                        }
                        maxLength={10}
                      />
                      <Select
                        label="Mode of Operation"
                        value={formData.modeOfOperation}
                        onChange={(e) =>
                          updateField("modeOfOperation", e.target.value)
                        }
                        options={[
                          {
                            value: "Either or Survivor",
                            label: "Either or Survivor",
                          },
                          { value: "Jointly", label: "Jointly" },
                          {
                            value: "Anyone or Survivor",
                            label: "Anyone or Survivor",
                          },
                        ]}
                      />
                    </div>
                  )}

                  {formData.entityType === "Minor" && (
                    <>
                      <Input
                        label="Minor's Full Name"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                      />
                      <Input
                        label="Minor's DOB"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => updateField("dob", e.target.value)}
                      />
                      <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                        <h4 className="col-span-full text-[10px] font-semibold text-blue-700 uppercase flex items-center gap-2 tracking-widest">
                          Guardian Details
                        </h4>
                        <Input
                          label="Guardian Name"
                          value={formData.guardianName}
                          onChange={(e) =>
                            updateField("guardianName", e.target.value)
                          }
                        />
                        <Input
                          label="Guardian PAN"
                          value={formData.guardianPAN}
                          onChange={(e) =>
                            updateField(
                              "guardianPAN",
                              e.target.value.toUpperCase(),
                            )
                          }
                          maxLength={10}
                        />
                        <Select
                          label="Relationship"
                          value={formData.guardianRelationship}
                          onChange={(e) =>
                            updateField("guardianRelationship", e.target.value)
                          }
                          options={[
                            { value: "Father", label: "Father" },
                            { value: "Mother", label: "Mother" },
                            {
                              value: "Legal Guardian",
                              label: "Legal Guardian",
                            },
                          ]}
                        />
                      </div>
                    </>
                  )}

                  {formData.entityType === "HUF" && (
                    <>
                      <Input
                        label="HUF Name"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                      />
                      <Input
                        label="HUF PAN"
                        value={formData.pan}
                        onChange={(e) =>
                          updateField("pan", e.target.value.toUpperCase())
                        }
                        maxLength={10}
                      />
                      <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-orange-50/30 rounded-xl border border-orange-100">
                        <h4 className="col-span-full text-[10px] font-semibold text-orange-700 uppercase flex items-center gap-2 tracking-widest">
                          Karta Details
                        </h4>
                        <Input
                          label="Karta Name"
                          value={formData.kartaName}
                          onChange={(e) =>
                            updateField("kartaName", e.target.value)
                          }
                        />
                        <Input
                          label="Karta PAN"
                          value={formData.kartaPAN}
                          onChange={(e) =>
                            updateField(
                              "kartaPAN",
                              e.target.value.toUpperCase(),
                            )
                          }
                          maxLength={10}
                        />
                      </div>
                    </>
                  )}

                  {formData.entityType === "Corporate" && (
                    <>
                      <Input
                        label="Company Name"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                      />
                      <Input
                        label="PAN"
                        value={formData.pan}
                        onChange={(e) =>
                          updateField("pan", e.target.value.toUpperCase())
                        }
                        maxLength={10}
                      />
                      <Input
                        label="CIN / LLPIN"
                        value={formData.cin}
                        onChange={(e) => updateField("cin", e.target.value)}
                      />
                      <Input
                        label="Date of Incorporation"
                        type="date"
                        value={formData.incorporationDate}
                        onChange={(e) =>
                          updateField("incorporationDate", e.target.value)
                        }
                      />
                      <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                        <h4 className="col-span-full text-[10px] font-semibold text-slate-600 uppercase flex items-center gap-2 tracking-widest">
                          Authorized Signatory
                        </h4>
                        <Input
                          label="Signatory Name"
                          value={formData.signatoryName}
                          onChange={(e) =>
                            updateField("signatoryName", e.target.value)
                          }
                        />
                        <Input
                          label="Designation"
                          value={formData.signatoryDesignation}
                          onChange={(e) =>
                            updateField("signatoryDesignation", e.target.value)
                          }
                        />
                      </div>
                    </>
                  )}

                  {formData.entityType === "NRI" && (
                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-indigo-50/30 rounded-xl border border-indigo-100">
                      <h4 className="col-span-full text-[10px] font-bold text-indigo-600 uppercase flex items-center gap-2 tracking-widest">
                        Overseas Details
                      </h4>
                      <Input
                        label="Passport Number"
                        value={formData.passportNumber}
                        onChange={(e) =>
                          updateField("passportNumber", e.target.value)
                        }
                      />
                      <Input
                        label="Country of Residence"
                        value={formData.countryOfResidence}
                        onChange={(e) =>
                          updateField("countryOfResidence", e.target.value)
                        }
                      />
                    </div>
                  )}

                  {formData.entityType === "Trust" && (
                    <>
                      <Input
                        label="Trust / Society Name"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="e.g. The Sunrise Charitable Trust"
                      />
                      <Input
                        label="PAN (Trust)"
                        value={formData.pan}
                        onChange={(e) =>
                          updateField("pan", e.target.value.toUpperCase())
                        }
                        maxLength={10}
                        placeholder="ABCDE1234F"
                      />
                      <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-violet-50/30 rounded-xl border border-violet-100">
                        <h4 className="col-span-full text-[10px] font-bold text-violet-600 uppercase flex items-center gap-2 tracking-widest">
                          Trust Details
                        </h4>
                        <Input
                          label="Registration Number"
                          value={formData.registrationNumber}
                          onChange={(e) =>
                            updateField("registrationNumber", e.target.value)
                          }
                          placeholder="e.g. TR/MH/2020/001234"
                        />
                        <Input
                          label="Trust Deed Date"
                          type="date"
                          value={formData.trustDeedDate}
                          onChange={(e) =>
                            updateField("trustDeedDate", e.target.value)
                          }
                        />
                        <Select
                          label="Trust Type"
                          value={formData.trustType}
                          onChange={(e) =>
                            updateField("trustType", e.target.value)
                          }
                          options={[
                            { value: "Private", label: "Private Trust" },
                            { value: "Public", label: "Public Trust" },
                            { value: "Charitable", label: "Charitable Trust" },
                            { value: "Religious", label: "Religious Trust" },
                          ]}
                        />
                        <Input
                          label="Managing Trustee Name"
                          value={formData.trusteeName}
                          onChange={(e) =>
                            updateField("trusteeName", e.target.value)
                          }
                          placeholder="Full name of primary trustee"
                        />
                      </div>
                    </>
                  )}

                  {renderContactFields()}

                  <div className="col-span-full mt-6 pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Family & Grouping
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <Select
                        label="Family Group"
                        value={
                          formData.familyName === "The Mehta Family" ||
                          formData.familyName === "Sharma Household" ||
                          formData.familyName === "" ||
                          formData.familyName === "NEW"
                            ? formData.familyName || ""
                            : "NEW"
                        }
                        onChange={(e) => {
                          if (e.target.value === "NEW") {
                            // keep formData.familyName as "NEW" sentinel temporarily
                            updateField("familyName", "NEW");
                            setNewFamilyName("");
                          } else {
                            updateField("familyName", e.target.value);
                            setNewFamilyName("");
                          }
                        }}
                        options={[
                          { value: "", label: "Self (No Family Group)" },
                          {
                            value: "The Mehta Family",
                            label: "The Mehta Family",
                          },
                          {
                            value: "Sharma Household",
                            label: "Sharma Household",
                          },
                          { value: "NEW", label: "+ Create New Family Group" },
                        ]}
                      />
                      {(formData.familyName === "NEW" ||
                        (formData.familyName &&
                          formData.familyName !== "The Mehta Family" &&
                          formData.familyName !== "Sharma Household")) && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                            New Family Group Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. The Agarwal Family"
                            value={
                              newFamilyName ||
                              (formData.familyName !== "NEW"
                                ? formData.familyName
                                : "")
                            }
                            onChange={(e) => setNewFamilyName(e.target.value)}
                            onBlur={() => {
                              if (newFamilyName.trim()) {
                                updateField("familyName", newFamilyName.trim());
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newFamilyName.trim()) {
                                updateField("familyName", newFamilyName.trim());
                              }
                            }}
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all placeholder:text-slate-400"
                          />
                          {newFamilyName.trim() && (
                            <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Press Enter or click Next to confirm "
                              {newFamilyName.trim()}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-8 animate-in fade-in duration-500 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Bank Account Details
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Account Number
                    </label>
                    <div className="relative">
                      <input
                        type={showAccountNumber ? "text" : "password"}
                        placeholder="Enter 12-16 digit number"
                        value={formData.accountNumber}
                        onChange={(e) =>
                          updateField("accountNumber", e.target.value)
                        }
                        className="w-full h-10 pl-3 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/50 transition-all placeholder:text-slate-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAccountNumber(!showAccountNumber)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-[#1e3a5f] transition-colors"
                        tabIndex={-1}
                      >
                        {showAccountNumber ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Input
                    label="IFSC Code"
                    placeholder="e.g. SBIN0001234"
                    value={formData.ifsc}
                    onChange={(e) =>
                      updateField("ifsc", e.target.value.toUpperCase())
                    }
                    maxLength={11}
                  />
                  <Select
                    label="Account Type"
                    value={formData.accountType}
                    onChange={(e) => updateField("accountType", e.target.value)}
                    options={
                      formData.entityType === "NRI"
                        ? [
                            { value: "NRE", label: "NRE" },
                            { value: "NRO", label: "NRO" },
                          ]
                        : [
                            { value: "Savings", label: "Savings" },
                            { value: "Current", label: "Current" },
                          ]
                    }
                  />
                </div>
              </div>

              {formData.entityType !== "Corporate" &&
                formData.entityType !== "Trust" && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      Nominee Details
                    </h4>
                    <div className="grid grid-cols-1 gap-5">
                      <Input
                        label="Nominee Name"
                        placeholder="e.g. Aditi Sharma"
                        value={formData.nomineeName}
                        onChange={(e) =>
                          updateField("nomineeName", e.target.value)
                        }
                      />
                      <Select
                        label="Relationship"
                        value={formData.nomineeRelationship}
                        onChange={(e) =>
                          updateField("nomineeRelationship", e.target.value)
                        }
                        options={[
                          { value: "Spouse", label: "Spouse" },
                          { value: "Son", label: "Son" },
                          { value: "Daughter", label: "Daughter" },
                          { value: "Father", label: "Father" },
                          { value: "Mother", label: "Mother" },
                        ]}
                      />
                      <Input
                        label="Allocation %"
                        type="number"
                        placeholder="100"
                        value={formData.nomineePercentage}
                        onChange={(e) =>
                          updateField("nomineePercentage", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 max-w-4xl mx-auto font-sans animate-in fade-in duration-500">
            <div className="flex items-center gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-800 shadow-sm">
              <Info className="w-5 h-5 shrink-0 text-blue-600" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Review all sections carefully. KYC Verification will be the
                final step after this review.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/30">
                  <CardTitle className="text-[10px] font-bold flex items-center gap-2 text-slate-900 uppercase tracking-widest">
                    <Briefcase className="w-3 h-3 text-blue-600" /> Identity
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-1">
                  <ReviewRow
                    label="Entity"
                    value={formData.entityType}
                    onEdit={() => setCurrentStep(0)}
                  />
                  <ReviewRow
                    label="Name"
                    value={formData.name}
                    onEdit={() => setCurrentStep(0)}
                  />
                  <ReviewRow
                    label="PAN"
                    value={formData.pan}
                    onEdit={() => setCurrentStep(0)}
                  />
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/30">
                  <CardTitle className="text-[10px] font-bold flex items-center gap-2 text-slate-900 uppercase tracking-widest">
                    <CreditCard className="w-3 h-3 text-blue-600" /> Banking
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-1">
                  <ReviewRow
                    label="Account"
                    value={formData.accountNumber}
                    onEdit={() => setCurrentStep(1)}
                  />
                  <ReviewRow
                    label="IFSC"
                    value={formData.ifsc}
                    onEdit={() => setCurrentStep(1)}
                  />
                  <ReviewRow
                    label="Type"
                    value={formData.accountType}
                    onEdit={() => setCurrentStep(1)}
                  />
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm bg-white overflow-hidden col-span-full">
                <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/30">
                  <CardTitle className="text-[10px] font-bold flex items-center gap-2 text-slate-900 uppercase tracking-widest">
                    <MapPin className="w-3 h-3 text-blue-600" /> Contact &
                    Communication
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-12">
                  <ReviewRow
                    label="Email"
                    value={formData.email}
                    onEdit={() => setCurrentStep(0)}
                  />
                  <ReviewRow
                    label="Mobile"
                    value={formData.mobile}
                    onEdit={() => setCurrentStep(0)}
                  />
                  <ReviewRow
                    label="City"
                    value={formData.city}
                    onEdit={() => setCurrentStep(0)}
                  />
                  <ReviewRow
                    label="State"
                    value={formData.state}
                    onEdit={() => setCurrentStep(0)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-2xl mx-auto text-center space-y-8 py-10 font-sans animate-in zoom-in-95 duration-500">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                <Shield className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">
                Final KYC Verification
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Verify identity via CKYC registry for PAN:{" "}
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mx-1">
                  {formData.pan || "MISSING"}
                </span>
              </p>
            </div>

            {!kycFetched ? (
              <div className="space-y-6">
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <Button
                    onClick={handleKYCFetch}
                    disabled={kycLoading}
                    size="lg"
                    className="px-10 bg-[#1e3a5f] hover:bg-[#152a45] text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-900/10 transition-all uppercase tracking-widest text-xs"
                  >
                    {kycLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Fetching CKYC Data...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Verify & Authorize
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-bold">
                  Matches data with CVL / NDML KRA Registries
                </p>
              </div>
            ) : (
              <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100 animate-in zoom-in-95 duration-500 shadow-sm">
                <div className="flex items-center justify-center gap-3 text-emerald-600 font-bold mb-6 uppercase tracking-widest text-xs">
                  <CheckCircle className="w-5 h-5" />
                  KYC Verified Successfully
                </div>
                <div className="grid grid-cols-2 gap-4 text-left p-5 bg-white rounded-2xl border border-emerald-100 shadow-sm">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                      Status
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      Active Registry
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                      Registry ID
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      CKYC-{Math.floor(10000 + Math.random() * 90000)}
                    </p>
                  </div>
                  <div className="col-span-full pt-4 border-t border-slate-50">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Address Match
                    </p>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed mt-2 italic">
                      {formData.address || "Confirmed as per PAN card records"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 h-full pt-4">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 py-10 px-12 sm:px-16">
          <div className="max-w-3xl mx-auto w-full">
            <Stepper
              steps={activeSteps}
              currentStep={currentStep}
              onStepClick={(step) => {
                if (step < currentStep) setCurrentStep(step);
              }}
            />
          </div>
        </div>

        {/* Unified Content Area */}
        <CardContent className="p-6 flex-1">
          {renderStep()}

          {/* In-Content Navigation Buttons (Matches Lead Capture Style) */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-10 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-lg transition-all text-xs uppercase tracking-widest"
            >
              {currentStep === 0 ? "Cancel" : "Back"}
            </Button>

            <div className="flex items-center gap-3">
              {currentStep < activeSteps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 0 &&
                      (!formData.entityType ||
                        !formData.name ||
                        !formData.pan)) ||
                    (currentStep === 1 &&
                      (!formData.accountNumber || !formData.ifsc))
                  }
                  className="bg-[#1e3a5f] hover:bg-[#152a45] h-10 px-8 font-bold rounded-lg shadow-sm transition-all text-xs uppercase tracking-widest text-white disabled:opacity-50"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!clientToEdit && !kycFetched}
                  className="bg-emerald-600 hover:bg-emerald-700 h-10 px-8 font-bold rounded-lg shadow-sm transition-all text-xs uppercase tracking-widest text-white disabled:opacity-50"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {clientToEdit ? "Update Client" : "Complete Registration"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </div>

      <div className="flex items-center justify-center gap-6 py-4">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
          <Shield className="w-3 h-3" /> Secure Data Encryption
        </p>
        <div className="w-1 h-1 bg-slate-200 rounded-full" />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
          <Building className="w-3 h-3" /> Regulatory Compliant
        </p>
      </div>
    </div>
  );
};

const ReviewRow = ({ label, value, onEdit }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 group">
    <span className="text-[10px] text-slate-400 font-semibold uppercase w-32 tracking-wider">
      {label}
    </span>
    <span className="text-sm font-semibold text-slate-800 flex-1 truncate">
      {value || "—"}
    </span>
    <button
      onClick={onEdit}
      className="text-xs font-bold text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      CHANGE
    </button>
  </div>
);
