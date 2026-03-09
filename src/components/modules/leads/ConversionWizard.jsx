import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Input, Select } from "../../ui/input";
import {
  CheckCircle2,
  Copy,
  FileText,
  UserPlus,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useLeadStore } from "../../../store/useLeadStore";
import { cn } from "../../../utils/cn";

const steps = [
  { id: 1, label: "Data Verification", icon: Copy },
  { id: 2, label: "KYC & Compliance", icon: ShieldAlert },
  { id: 3, label: "Document Setup", icon: FileText },
  { id: 4, label: "Client Creation", icon: UserPlus },
];

export const ConversionWizard = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-6 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-800">
                  Lead is ready for conversion
                </h4>
                <p className="text-sm text-emerald-700">
                  Rajiv Malhotra has reached the 'Negotiation' stage and has a
                  high lead score.
                </p>
              </div>
            </div>

            <h3 className="text-lg font-medium text-slate-800 border-b pb-2 mb-4">
              Carry-forward Data Preview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="First Name" defaultValue="Rajiv" readOnly />
              <Input label="Last Name" defaultValue="Malhotra" readOnly />
              <Input
                label="Email Address"
                defaultValue="rajiv@malhotragroup.in"
                readOnly
              />
              <Input
                label="Phone Number"
                defaultValue="+91 98765 12345"
                readOnly
              />
              <Select
                label="Entity Type"
                defaultValue="individual"
                options={[
                  { value: "individual", label: "Individual" },
                  { value: "corporate", label: "Corporate" },
                  { value: "huf", label: "HUF" },
                ]}
              />
              <Input label="Company / Employer" defaultValue="Malhotra Group" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-medium text-slate-800 border-b pb-2 mb-4">
              Initial KYC Requirement
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Select the primary ID proofs available to initiate the CKYC check
              process after conversion.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="PAN Number" placeholder="e.g. ABCDE1234F" />
              <Input label="Aadhar Number" placeholder="12-digit Aadhar" />
              <Input label="Date of Birth" type="date" />
              <Select
                label="Risk Tolerance Profile"
                defaultValue="moderate"
                options={[
                  { value: "conservative", label: "Conservative" },
                  { value: "moderate", label: "Moderate" },
                  { value: "aggressive", label: "Aggressive" },
                ]}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-medium text-slate-800 border-b pb-2 mb-4">
              Generate Welcome Documents
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Select which documents should be pre-filled and sent to the client
              upon creation.
            </p>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 flex-shrink-0 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    Advisory Mandate Agreement
                  </p>
                  <p className="text-sm text-slate-500">
                    Standard terms of service and advisory fee structure.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 flex-shrink-0 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    Welcome Letter & RM Assignment
                  </p>
                  <p className="text-sm text-slate-500">
                    Formal letter introducing Priya Sharma as the assigned RM.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 flex-shrink-0 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    Initial Risk Profiling Questionnaire
                  </p>
                  <p className="text-sm text-slate-500">
                    Digital form link for detailed risk assessment.
                  </p>
                </div>
              </label>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <UserPlus className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Ready to Convert!
            </h2>
            <p className="text-slate-600 max-w-md mx-auto mb-8">
              Rajiv Malhotra will be removed from active leads and promoted to a
              full Client profile. An email with opening documents will be sent
              automatically.
            </p>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 w-full max-w-md text-left">
              <h4 className="font-semibold text-slate-800 mb-4 border-b pb-2">
                Conversion Summary
              </h4>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span className="font-medium">Client Name:</span>{" "}
                  <span>Rajiv Malhotra</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Assigned RM:</span>{" "}
                  <span>Priya Sharma</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Lead Value:</span>{" "}
                  <span>₹50.00 Lakhs</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Documents:</span>{" "}
                  <span>3 Selected</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 h-full">
      <Card className="shadow-md">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <div className="flex justify-between flex-col md:flex-row gap-4 mb-4">
            <div>
              <CardTitle className="text-2xl text-slate-900">
                Convert Lead to Client
              </CardTitle>
              <CardDescription>
                Promote Rajiv Malhotra from a lead to an active client profile.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => onNavigate("dashboard")}
              className="self-start"
            >
              Cancel Conversion
            </Button>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mt-6">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className="flex flex-col items-center relative z-10 flex-1"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 bg-white",
                    currentStep === step.id
                      ? "border-emerald-500 text-emerald-600 shadow-sm"
                      : currentStep > step.id
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-200 text-slate-400",
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold mt-2 hidden sm:block whitespace-nowrap",
                    currentStep >= step.id
                      ? "text-slate-800"
                      : "text-slate-400",
                  )}
                >
                  {step.label}
                </span>
                {/* Connector Line */}
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-5 left-[50%] w-full h-0.5 -z-10",
                      currentStep > step.id ? "bg-emerald-500" : "bg-slate-200",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {renderStepContent()}

          <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Back
            </Button>

            {currentStep < steps.length ? (
              <Button onClick={nextStep} className="bg-[#1e3a5f]">
                Next Step <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"
                onClick={() => {
                  toast.success("Client Created Successfully!");
                  onNavigate && onNavigate("profile");
                }}
              >
                Convert & Create Client <UserPlus className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
