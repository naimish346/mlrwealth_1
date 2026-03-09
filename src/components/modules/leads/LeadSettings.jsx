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
  Star,
  Bell,
  Link2,
  ShieldAlert,
  Cpu,
  Database,
  Mail,
} from "lucide-react";
import { cn } from "../../../utils/cn";

export const LeadSettings = () => {
  const [activeTab, setActiveTab] = useState("scoring"); // scoring | notifications | integration

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      {/* Settings Navigation */}
      <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-2 gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("scoring")}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === "scoring"
              ? "bg-amber-50 text-amber-700"
              : "text-slate-600 hover:bg-slate-50",
          )}
        >
          <Star className="w-5 h-5" /> Lead Scoring System
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === "notifications"
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-50",
          )}
        >
          <Bell className="w-5 h-5" /> Notifications & Alerts
        </button>
        <button
          onClick={() => setActiveTab("integration")}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === "integration"
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-600 hover:bg-slate-50",
          )}
        >
          <Link2 className="w-5 h-5" /> Module Integration Map
        </button>
      </div>

      <Card className="shadow-md">
        {/* Scoring Settings */}
        {activeTab === "scoring" && (
          <div className="animate-fade-in">
            <CardHeader className="bg-amber-50/50 border-b border-amber-100 pb-6 rounded-t-xl">
              <CardTitle className="text-amber-900">
                100-Point Lead Scoring Rules
              </CardTitle>
              <CardDescription className="text-amber-700">
                Configure how leads acquire points based on demographic and
                behavioral data.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                  Score Tiers
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <span className="block text-xl font-bold text-slate-400 mb-1">
                      Cold
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      0 - 25 pts
                    </span>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center">
                    <span className="block text-xl font-bold text-blue-500 mb-1">
                      Warm
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      26 - 50 pts
                    </span>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
                    <span className="block text-xl font-bold text-amber-500 mb-1">
                      Hot
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      51 - 80 pts
                    </span>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                    <span className="block text-xl font-bold text-emerald-600 mb-1 mt-1">
                      Highly Qualified
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      81 - 100 pts
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                  Rule Configuration
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">
                        Job Title / Role
                      </p>
                      <p className="text-sm text-slate-500">
                        Add points if title matches 'Director', 'CEO', 'Founder'
                      </p>
                    </div>
                    <div className="w-24">
                      <Input type="number" defaultValue={15} />
                    </div>
                    <span className="text-sm font-medium text-slate-400">
                      pts
                    </span>
                  </div>
                  <div className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">
                        Estimated Value &gt; ₹1 Cr
                      </p>
                      <p className="text-sm text-slate-500">
                        High net worth indicators
                      </p>
                    </div>
                    <div className="w-24">
                      <Input type="number" defaultValue={25} />
                    </div>
                    <span className="text-sm font-medium text-slate-400">
                      pts
                    </span>
                  </div>
                  <div className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">
                        Email Interaction
                      </p>
                      <p className="text-sm text-slate-500">
                        Points added when a lead replies to an email
                      </p>
                    </div>
                    <div className="w-24">
                      <Input type="number" defaultValue={10} />
                    </div>
                    <span className="text-sm font-medium text-slate-400">
                      pts
                    </span>
                  </div>

                  <div className="flex items-center gap-4 bg-rose-50 border border-rose-200 p-4 rounded-lg shadow-sm">
                    <div className="flex-1">
                      <p className="font-medium text-rose-800">
                        Score Decay (Inactive Lead)
                      </p>
                      <p className="text-sm text-rose-600">
                        Points subtracted per week of inactivity
                      </p>
                    </div>
                    <div className="w-24">
                      <Input type="number" defaultValue={-5} />
                    </div>
                    <span className="text-sm font-medium text-rose-400">
                      pts
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Scoring Rules</Button>
              </div>
            </CardContent>
          </div>
        )}

        {/* Notifications & Settings */}
        {activeTab === "notifications" && (
          <div className="animate-fade-in">
            <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-6 rounded-t-xl">
              <CardTitle className="text-blue-900">Alerts & SLAs</CardTitle>
              <CardDescription className="text-blue-700">
                Define Service Level Agreements (SLAs) and automated
                notification triggers for RMs.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">
                      New Lead Assignment Alert
                    </h4>
                    <p className="text-sm text-slate-500">
                      Notify RM via Email/In-app when a new lead is assigned to
                      them.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-amber-200 bg-amber-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm">
                      Stale Lead Warning (SLA Breach)
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-amber-700">
                        Trigger alert if lead is in same stage for
                      </span>
                      <select className="border border-amber-300 rounded px-2 py-1 text-sm bg-white text-amber-900">
                        <option>3 Days</option>
                        <option selected>7 Days</option>
                        <option>14 Days</option>
                      </select>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-emerald-200 bg-emerald-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-emerald-900 text-sm">
                      High Score Alert
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-emerald-700">
                        Notify Admin when lead score exceeds
                      </span>
                      <input
                        type="number"
                        defaultValue={85}
                        className="w-16 border border-emerald-300 rounded px-2 py-1 text-sm bg-white text-emerald-900"
                      />
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </div>
        )}

        {/* Integration Map */}
        {activeTab === "integration" && (
          <div className="animate-fade-in">
            <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pb-6 rounded-t-xl">
              <CardTitle className="text-indigo-900">
                Module Integration Architecture
              </CardTitle>
              <CardDescription className="text-indigo-700">
                Visual mapping of how the Leads module data flows into other CRM
                systems.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center space-y-8">
                {/* Source */}
                <div className="w-64 bg-indigo-600 text-white p-4 rounded-xl shadow-lg border-2 border-indigo-400 text-center relative z-10">
                  <Cpu className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <h3 className="font-bold text-lg">Leads Module</h3>
                  <p className="text-xs text-indigo-100 mt-1">
                    Prospect Data & Activity
                  </p>
                </div>

                <div className="h-10 w-0.5 bg-slate-300"></div>

                {/* Decision / Router */}
                <div className="bg-slate-100 px-6 py-2 rounded-full border border-slate-300 text-sm font-semibold text-slate-500 shadow-sm">
                  Conversion Event Trigger
                </div>

                <div className="h-10 w-0.5 bg-slate-300 relative">
                  {/* Branches */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-0.5 bg-slate-300"></div>
                </div>

                {/* Destinations */}
                <div className="flex gap-8 w-full justify-center max-w-[800px] relative mt-4">
                  <div className="w-56 bg-white p-4 rounded-xl shadow-md border-t-4 border-t-emerald-500 text-center">
                    <Database className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                    <h4 className="font-bold text-slate-800 text-sm">
                      Client Management
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Creates unified profile
                    </p>
                  </div>
                  <div className="w-56 bg-white p-4 rounded-xl shadow-md border-t-4 border-t-blue-500 text-center">
                    <ShieldAlert className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <h4 className="font-bold text-slate-800 text-sm">
                      KYC & Compliance
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Triggers CKYC check flow
                    </p>
                  </div>
                  <div className="w-56 bg-white p-4 rounded-xl shadow-md border-t-4 border-t-amber-500 text-center">
                    <Mail className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                    <h4 className="font-bold text-slate-800 text-sm">
                      Email Service
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Dispatches welcome kit
                    </p>
                  </div>
                </div>

                {/* Audit Logging Line */}
                <div className="mt-8 pt-8 border-t border-dashed border-slate-300 w-full text-center">
                  <p className="text-sm text-slate-500 italic">
                    All lead modifications and conversions are permanently
                    written to the global{" "}
                    <span className="font-semibold">Audit Log</span>.
                  </p>
                </div>
              </div>
            </CardContent>
          </div>
        )}
      </Card>
    </div>
  );
};
