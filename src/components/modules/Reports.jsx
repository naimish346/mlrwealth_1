import { useState } from "react";
import {
  FileText,
  Download,
  Filter,
  Mail,
  Printer,
  FileSpreadsheet,
  File,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Input, Select } from "../ui/Input";
import { useAppStore } from "../../store/appStore";
import { ReportGeneratorDrawer } from "./reports/ReportGeneratorDrawer";
import { cn } from "../../lib/utils";

const reportTypes = [
  {
    id: "portfolio_summary",
    name: "Portfolio Summary",
    description: "Complete portfolio overview with holdings and performance",
    icon: FileText,
    formats: ["PDF", "Excel"],
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "transaction_statement",
    name: "Transaction Statement",
    description: "Detailed transaction history for selected period",
    icon: FileSpreadsheet,
    formats: ["PDF", "CSV", "Excel"],
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    id: "family_aum",
    name: "Family AUM Report",
    description: "Consolidated AUM across family members",
    icon: File,
    formats: ["PDF", "Excel"],
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "risk_profile",
    name: "Risk Profile Report",
    description: "Risk assessment results and IPS document",
    icon: FileText,
    formats: ["PDF"],
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "goal_tracker",
    name: "Goal Tracking Report",
    description: "Progress towards financial goals",
    icon: FileText,
    formats: ["PDF", "Excel"],
    gradient: "from-rose-500 to-pink-600",
  },
  {
    id: "capital_gains",
    name: "Capital Gains Statement",
    description: "Tax-ready capital gains report",
    icon: FileSpreadsheet,
    formats: ["PDF", "Excel"],
    gradient: "from-orange-500 to-red-600",
  },
];

const recentReports = [
  {
    name: "Portfolio Summary - Amit Patel",
    date: "Jan 15, 2024",
    size: "245 KB",
    format: "PDF",
  },
  {
    name: "Transaction Statement - Q4 2023",
    date: "Jan 10, 2024",
    size: "128 KB",
    format: "Excel",
  },
  {
    name: "Family AUM - Patel Family",
    date: "Jan 08, 2024",
    size: "312 KB",
    format: "PDF",
  },
  {
    name: "Capital Gains - FY 2023-24",
    date: "Jan 05, 2024",
    size: "89 KB",
    format: "CSV",
  },
];

export const Reports = () => {
  const { clients } = useAppStore();
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFormat, setFilterFormat] = useState("all");

  const filteredReports = recentReports.filter((report) => {
    const matchesSearch = report.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFormat =
      filterFormat === "all" ||
      report.format.toLowerCase() === filterFormat.toLowerCase();
    return matchesSearch && matchesFormat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500">Generate and download client reports</p>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card
              key={report.id}
              className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200 overflow-hidden cursor-pointer bg-white"
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300",
                        report.gradient,
                      )}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {report.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {report.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-1.5">
                      {report.formats.map((format) => (
                        <Badge
                          key={format}
                          variant="outline"
                          className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-600 border-slate-200"
                        >
                          {format}
                        </Badge>
                      ))}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "h-1.5 w-full bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity",
                    report.gradient,
                  )}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Recent Reports</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full sm:w-64"
                />
              </div>
              <select
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="all">All Formats</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {filteredReports.length > 0 ? (
              filteredReports.map((report, idx) => (
                <div
                  key={idx}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      <FileText className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {report.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {report.date} • {report.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold px-3 py-1 mr-2"
                    >
                      {report.format}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all rounded-xl shadow-sm hover:shadow"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all rounded-xl shadow-sm hover:shadow"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all rounded-xl shadow-sm hover:shadow"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">
                  No reports found matching your filters
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-indigo-600 hover:text-indigo-700 font-bold"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterFormat("all");
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SEBI Disclaimer */}
      <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/10">
              <AlertTriangle className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="font-bold text-white tracking-tight">
                Compliance & SEBI Disclaimer
              </p>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed max-w-4xl">
                All reports generated include mandatory SEBI disclaimers. MLR
                Wealth is a SEBI Registered Investment Advisor (Registration No:
                INH000XXXXXX). Investment in securities market are subject to
                market risks. Read all the related documents carefully before
                investing. Past performance is not indicative of future returns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReportGeneratorDrawer
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        reportType={selectedReport}
        onGenerate={(data) => {
          console.log("Generating report with data:", data);
        }}
      />
    </div>
  );
};
