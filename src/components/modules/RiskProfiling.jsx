import { useState } from "react";
import { cn } from "../../utils/cn";
import {
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  Play,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { useAppStore } from "../../store/appStore";
import { riskQuestions } from "../../data/mockData";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const getRiskLevelColor = (level) => {
  switch (level) {
    case "Conservative":
      return "bg-blue-100 text-blue-700";
    case "Moderately Conservative":
      return "bg-cyan-100 text-cyan-700";
    case "Moderate":
      return "bg-emerald-100 text-emerald-700";
    case "Moderately Aggressive":
      return "bg-amber-100 text-amber-700";
    case "Aggressive":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const modelPortfolios = {
  Conservative: { equity: 20, debt: 70, gold: 10 },
  "Moderately Conservative": { equity: 35, debt: 55, gold: 10 },
  Moderate: { equity: 50, debt: 40, gold: 10 },
  "Moderately Aggressive": { equity: 70, debt: 25, gold: 5 },
  Aggressive: { equity: 85, debt: 10, gold: 5 },
};

const MetricCard = ({ title, value, icon: Icon, colorClass, iconColor }) => (
  <Card
    className={cn(
      "border-none shadow-sm overflow-hidden h-20 transition-all hover:shadow-md",
      colorClass,
    )}
  >
    <CardContent className="px-4 py-3 flex items-center justify-between h-full">
      <div>
        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">
            {value}
          </h3>
        </div>
      </div>
      <div
        className={`w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm flex items-center justify-center ${iconColor || "text-indigo-600"}`}
      >
        <Icon className="w-5 h-5" />
      </div>
    </CardContent>
  </Card>
);

export const RiskProfiling = () => {
  const { clients } = useAppStore();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  // IPS Demo State
  const [showIpsModal, setShowIpsModal] = useState(false);
  const [selectedClientForIps, setSelectedClientForIps] = useState(null);

  const calculateRiskLevel = (totalScore) => {
    const maxScore = riskQuestions.length * 5;
    const percentage = (totalScore / maxScore) * 100;

    if (percentage <= 20) return "Conservative";
    if (percentage <= 40) return "Moderately Conservative";
    if (percentage <= 60) return "Moderate";
    if (percentage <= 80) return "Moderately Aggressive";
    return "Aggressive";
  };

  const totalScore = Object.values(answers).reduce(
    (sum, score) => sum + score,
    0,
  );
  const riskLevel = calculateRiskLevel(totalScore);
  const portfolio = modelPortfolios[riskLevel];

  const handleAnswer = (questionId, score) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const startQuestionnaire = () => {
    setShowQuestionnaire(true);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  const clientsWithoutRisk = clients.filter((c) => !c.riskProfile);
  const riskLevels = [
    "Moderate",
    "Moderately Aggressive",
    "Conservative",
    "Aggressive",
  ];

  const generateIPSPDF = (client, level) => {
    const doc = new jsPDF();
    const port = modelPortfolios[level];
    const today = new Date().toLocaleDateString();

    // --------- HEADER SECTION ---------
    // Primary Brand Color #1e3a5f
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("WealthCRM", 15, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Investment Policy Statement", 15, 30);

    doc.setFontSize(10);
    doc.text(`Date: ${today}`, 160, 26);

    // --------- CLIENT INFO SECTION ---------
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Client Information", 15, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${client.name}`, 15, 65);
    doc.text(`Email: ${client.email}`, 15, 72);
    doc.text(`Risk Profile: ${level}`, 110, 65);
    doc.text(`Time Horizon: Long Term (7+ Years)`, 110, 72);

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 80, 195, 80);

    // --------- ASSET ALLOCATION ---------
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Target Asset Allocation", 15, 95);

    autoTable(doc, {
      startY: 100,
      head: [["Asset Class", "Target Allocation(%)", "Strategic Range(%)"]],
      body: [
        [
          "Equity (Growth & Wealth Creation)",
          `${port.equity}%`,
          `${port.equity - 5}% - ${port.equity + 5}%`,
        ],
        [
          "Debt (Stability & Regular Income)",
          `${port.debt}%`,
          `${port.debt - 5}% - ${port.debt + 5}%`,
        ],
        [
          "Gold/Commodities (Hedge)",
          `${port.gold}%`,
          `${Math.max(0, port.gold - 2)}% - ${port.gold + 2}%`,
        ],
      ],
      theme: "striped",
      headStyles: { fillColor: [30, 58, 95], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 5 },
      margin: { left: 15, right: 15 },
    });

    // --------- RECOMMENDED MUTUAL FUNDS SECITON ---------
    const nextY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Recommended Mutual Fund Categories", 15, nextY);

    const getFundRecommendations = (risk) => {
      switch (risk) {
        case "Conservative":
          return [
            ["Liquid / Ultra Short Term Funds", "Core Debt", "High"],
            ["Corporate Bond Funds", "Yield Enhancer", "Moderate-High"],
            ["Large Cap Index Funds", "Equity Exposure", "Moderate"],
          ];
        case "Moderately Conservative":
          return [
            ["Short Duration Debt Funds", "Core Debt", "High"],
            ["Conservative Hybrid Funds", "Balanced", "Moderate"],
            ["Large Cap Active Funds", "Core Equity", "Moderate"],
          ];
        case "Moderate":
          return [
            ["Dynamic Asset Allocation (BAF)", "Balanced", "Moderate"],
            ["Flexi Cap Equity Funds", "Core Equity", "Moderate"],
            ["Short/Medium Duration Debt", "Core Debt", "High"],
          ];
        case "Moderately Aggressive":
          return [
            ["Flexi Cap / Multi Cap Funds", "Core Equity", "Moderate"],
            ["Mid Cap Funds", "Alpha Generator", "Low"],
            ["Low Duration Debt Funds", "Stability", "High"],
          ];
        case "Aggressive":
          return [
            ["Small & Mid Cap Funds", "Growth Driver", "Low"],
            ["Flexi Cap / Focused Funds", "Core Equity", "Moderate"],
            ["Sectoral/Thematic (Max 10%)", "Alpha Generator", "Low"],
          ];
        default:
          return [["Diversified Equity", "Core", "Moderate"]];
      }
    };

    autoTable(doc, {
      startY: nextY + 5,
      head: [["Category", "Portfolio Role", "Liquidity"]],
      body: getFundRecommendations(level),
      theme: "grid",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [40, 40, 40],
        fontStyle: "bold",
      },
      styles: { fontSize: 10, cellPadding: 5 },
      margin: { left: 15, right: 15 },
    });

    // --------- FOOTER / SIGNATURE ---------
    const sigY = doc.internal.pageSize.height - 40;
    doc.setDrawColor(150, 150, 150);
    doc.line(15, sigY, 70, sigY);
    doc.line(140, sigY, 195, sigY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Advisor Signature", 25, sigY + 5);
    doc.text("Client Signature", 150, sigY + 5);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "This IPS is a highly automated demonstrative generated document. Mutual Fund investments are subject to market risks.",
      15,
      doc.internal.pageSize.height - 10,
      { maxWidth: 180 },
    );

    doc.save(`${client.name}_IPS_Report.pdf`);
    toast.success("IPS PDF downloaded successfully!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Risk Profiling & IPS
          </h1>
          <p className="text-slate-500">
            Assess client risk tolerance and generate Investment Policy
            Statement
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Profiled"
          value={clients.length - clientsWithoutRisk.length}
          icon={CheckCircle}
          colorClass="bg-emerald-50/50 border-emerald-100"
          iconColor="text-emerald-600"
        />
        <MetricCard
          title="Pending"
          value={clientsWithoutRisk.length}
          icon={AlertTriangle}
          colorClass="bg-amber-50/50 border-amber-100"
          iconColor="text-amber-600"
        />
        <MetricCard
          title="IPS Generated"
          value={12}
          icon={FileText}
          colorClass="bg-blue-50/50 border-blue-100"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="IPS Accepted"
          value={10}
          icon={ClipboardCheck}
          colorClass="bg-purple-50/50 border-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Pending Risk Profiles */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Risk Assessments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {clientsWithoutRisk.map((client) => (
              <div
                key={client.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white font-medium">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{client.name}</p>
                    <p className="text-sm text-slate-500">
                      {client.entityType} • {client.email}
                    </p>
                  </div>
                </div>
                <Button
                  className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"
                  onClick={startQuestionnaire}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Assessment
                </Button>
              </div>
            ))}
            {clientsWithoutRisk.length === 0 && (
              <div className="px-6 py-8 text-center text-slate-500">
                All clients have completed risk profiling
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Profiles */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Risk Profiles</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {clients.slice(0, 4).map((client, idx) => {
              const level = riskLevels[idx % riskLevels.length];
              return (
                <div
                  key={client.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white font-medium">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {client.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        Assessed: Jan 15, 2024
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getRiskLevelColor(level)}>{level}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedClientForIps({
                          ...client,
                          riskLevel: level,
                          portfolio: modelPortfolios[level],
                        });
                        setShowIpsModal(true);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View IPS
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateIPSPDF(client, level)}
                      title="Download Mutual Fund IPS PDF"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Risk Questionnaire Modal */}
      <Modal
        isOpen={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        title={
          showResult
            ? "Risk Assessment Result"
            : `Question ${currentQuestion + 1} of ${riskQuestions.length}`
        }
        size="lg"
      >
        {!showResult ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-[#1e3a5f] h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / riskQuestions.length) * 100}%`,
                }}
              />
            </div>

            {/* Question */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {riskQuestions[currentQuestion].question}
              </h3>
              <div className="space-y-3">
                {riskQuestions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      handleAnswer(
                        riskQuestions[currentQuestion].id,
                        option.score,
                      )
                    }
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      answers[riskQuestions[currentQuestion].id] ===
                      option.score
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((prev) => prev - 1)}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              {currentQuestion < riskQuestions.length - 1 ? (
                <Button
                  className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"
                  onClick={() => setCurrentQuestion((prev) => prev + 1)}
                  disabled={!answers[riskQuestions[currentQuestion].id]}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"
                  onClick={() => {
                    setShowResult(true);
                    toast.success("Risk Assessment completed!");
                  }}
                  disabled={Object.keys(answers).length < riskQuestions.length}
                >
                  Complete Assessment
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Result */}
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getRiskLevelColor(riskLevel)} mb-4`}
              >
                <ClipboardCheck className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {riskLevel}
              </h3>
              <p className="text-slate-600">
                Risk Score: {totalScore} / {riskQuestions.length * 5}
              </p>
            </div>

            {/* Model Portfolio */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">
                Recommended Asset Allocation
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Equity</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-[#1e3a5f] h-2 rounded-full"
                        style={{ width: `${portfolio.equity}%` }}
                      />
                    </div>
                    <span className="font-semibold w-12 text-right">
                      {portfolio.equity}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Debt</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${portfolio.debt}%` }}
                      />
                    </div>
                    <span className="font-semibold w-12 text-right">
                      {portfolio.debt}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Gold</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${portfolio.gold}%` }}
                      />
                    </div>
                    <span className="font-semibold w-12 text-right">
                      {portfolio.gold}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowQuestionnaire(false)}
              >
                Close
              </Button>
              <Button
                className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"
                onClick={() => {
                  toast.success("IPS generated successfully!");
                  setShowQuestionnaire(false);
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate IPS
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* IPS Demo Modal */}
      <Modal
        isOpen={showIpsModal}
        onClose={() => {
          setShowIpsModal(false);
          setSelectedClientForIps(null);
        }}
        title="Investment Policy Statement (IPS)"
        size="xl"
      >
        {selectedClientForIps && (
          <div className="space-y-6">
            {/* IPS Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedClientForIps.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedClientForIps.email}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  Generated: {new Date().toLocaleDateString()}
                </p>
                <div className="mt-1">
                  <Badge
                    className={getRiskLevelColor(
                      selectedClientForIps.riskLevel,
                    )}
                  >
                    {selectedClientForIps.riskLevel} Profile
                  </Badge>
                </div>
              </div>
            </div>

            {/* IPS Content Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                    1. Investment Objectives
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm text-slate-700">
                    <p>• Primary Goal: Capital Preservation & Growth</p>
                    <p>• Time Horizon: Long-term (7+ years)</p>
                    <p>• Liquidity Needs: Low to Moderate</p>
                    <p>• Tax Considerations: Maximize tax-efficient growth</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                    2. Risk Tolerance
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm text-slate-700">
                    <p>
                      Based on the risk assessment conducted, the client
                      exhibits a{" "}
                      <span className="font-semibold text-slate-900">
                        {selectedClientForIps.riskLevel}
                      </span>{" "}
                      risk profile. They are willing to accept moderate
                      volatility in exchange for potential higher long-term
                      returns.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                    3. Target Asset Allocation
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Equity
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-[#1e3a5f] h-2 rounded-full"
                            style={{
                              width: `${selectedClientForIps.portfolio.equity}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold w-10 text-right">
                          {selectedClientForIps.portfolio.equity}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Debt
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{
                              width: `${selectedClientForIps.portfolio.debt}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold w-10 text-right">
                          {selectedClientForIps.portfolio.debt}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Gold/Commodities
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{
                              width: `${selectedClientForIps.portfolio.gold}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold w-10 text-right">
                          {selectedClientForIps.portfolio.gold}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                    4. Rebalancing Guidelines
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm text-slate-700">
                    <p>• Review Frequency: Semi-Annually</p>
                    <p>• Rebalancing Threshold: +/- 5% deviation from target</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t mt-6">
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  toast.success("IPS rejected!");
                  setShowIpsModal(false);
                }}
              >
                Reject IPS
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    generateIPSPDF(
                      selectedClientForIps,
                      selectedClientForIps.riskLevel,
                    )
                  }
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"
                  onClick={() => {
                    toast.success("IPS approved!");
                    setShowIpsModal(false);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve IPS
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
