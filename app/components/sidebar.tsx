"use client";

import React from "react";
import {
  IoLocation,
  IoClose,
  IoWarning,
  IoFlask,
  IoTrendingDown,
  IoConstruct,
  IoBulb,
  IoDocumentText,
  IoAlertCircle,
  IoGitCompare,
} from "react-icons/io5";

// ============================================================================
// ADD: Type definition for prediction result
// ============================================================================
interface PredictionData {
  location: {
    latitude: number;
    longitude: number;
    nearest_borehole_distance_km?: number;
  };
  risk_assessment: {
    risk_level: "LOW" | "MEDIUM" | "HIGH";
    probability: number;
    severity: string;
  };
  soil_parameters: {
    spt_n60: number;
    unit_weight: number;
    csr: number;
    crr: number;
    gwl: number;
    fines_percent: number;
    source?: string;
  };
  settlement: {
    predicted_cm: number;
    severity: string;
  };
  bearing_capacity: {
    pre_liquefaction_kpa: number;
    post_liquefaction_kpa: number;
    capacity_reduction_percent: number;
  };
  recommendations: string[];
}

interface LiquefactionSidebarProps {
  location?: string;
  predictionData?: PredictionData | null; // ← ADD THIS PROP
  onToggleComparison?: () => void;
}

export default function LiquefactionSidebar({
  location = "Tarlac City",
  predictionData, // ← ADD THIS
  onToggleComparison,
}: LiquefactionSidebarProps) {
  // Use prediction data if available, otherwise use defaults
  const latitude = predictionData?.location.latitude ?? 15.4567;
  const longitude = predictionData?.location.longitude ?? 120.5678;
  const riskLevel = predictionData?.risk_assessment.risk_level ?? "HIGH";
  const probability = predictionData?.risk_assessment.probability ?? 85;
  const severity = predictionData?.risk_assessment.severity ?? "Severe";

  const sptN60 = predictionData?.soil_parameters.spt_n60 ?? 8;
  const unitWeight = predictionData?.soil_parameters.unit_weight ?? 17.8;
  const csr = predictionData?.soil_parameters.csr ?? 0.28;
  const crr = predictionData?.soil_parameters.crr ?? 0.15;
  const gwl = predictionData?.soil_parameters.gwl ?? 3.0;
  const finesPercent = predictionData?.soil_parameters.fines_percent ?? 20;

  const settlementCm = predictionData?.settlement.predicted_cm ?? 7.5;
  const settlementSeverity = predictionData?.settlement.severity ?? "Severe";

  const bearingPre =
    predictionData?.bearing_capacity.pre_liquefaction_kpa ?? 250;
  const bearingPost =
    predictionData?.bearing_capacity.post_liquefaction_kpa ?? 85;
  const capacityReduction =
    predictionData?.bearing_capacity.capacity_reduction_percent ?? 66;

  const recommendations = predictionData?.recommendations ?? [
    "Detailed geotechnical investigation",
    "Deep foundation system implementation",
    "Soil densification treatment",
    "Post-liquefaction design considerations",
  ];

  // Determine color classes based on risk level
  const getRiskColor = () => {
    switch (riskLevel) {
      case "HIGH":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-600",
          bar: "bg-red-500",
        };
      case "MEDIUM":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          text: "text-orange-600",
          bar: "bg-orange-500",
        };
      case "LOW":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-600",
          bar: "bg-green-500",
        };
      default:
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-600",
          bar: "bg-red-500",
        };
    }
  };

  const riskColors = getRiskColor();

  const handleDownload = () => {
    const report = `LIQUEFACTION RISK ASSESSMENT REPORT
====================================
Location: ${location}
Coordinates: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E

RISK LEVEL: ${riskLevel}
Probability: ${probability}%
Severity: ${severity}

SOIL PARAMETERS:
- SPT N₆₀: ${sptN60}
- Unit Weight: ${unitWeight} kN/m³
- CSR: ${csr}
- CRR: ${crr}
- Ground Water Level: ${gwl} m
- Fines Content: ${finesPercent}%

PREDICTED SETTLEMENT: ${settlementCm} cm (${settlementSeverity})

BEARING CAPACITY:
- Pre-Liquefaction: ${bearingPre} kPa
- Post-Liquefaction: ${bearingPost} kPa
- Reduction: ${capacityReduction}%

RECOMMENDATIONS:
${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join("\n")}

Generated: ${new Date().toLocaleString()}`;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liquefaction-risk-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full md:w-[360px] h-1/2 md:h-full bg-slate-50 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <IoLocation size={18} className="text-slate-700" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Location
            </span>
          </div>
        </div>
        <div className="font-semibold text-slate-900">{location}</div>
        <div className="text-xs text-slate-500 mt-1">
          {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
        </div>
      </div>

      {/* Risk Alert */}
      <div
        className={`bg-white mx-3 md:mx-4 my-3 md:my-4 rounded-lg border ${riskColors.border} overflow-hidden`}
      >
        <div
          className={`${riskColors.bg} px-5 py-3 border-b ${riskColors.border.replace("border-", "border-b-")}`}
        >
          <div className="flex items-center gap-2">
            <IoWarning size={16} className={riskColors.text} />
            <span
              className={`font-semibold ${riskColors.text.replace("text-", "text-").replace("600", "900")} text-xs uppercase tracking-wide`}
            >
              Risk Assessment
            </span>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-baseline gap-2 mb-2">
            <div className={`text-3xl font-bold ${riskColors.text}`}>
              {riskLevel}
            </div>
            <div className="text-sm text-slate-600">Risk Level</div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-600">Probability</span>
              <span className="text-sm font-semibold text-slate-900">
                {probability}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`${riskColors.bar} h-full transition-all duration-500`}
                style={{ width: `${probability}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Soil Parameters */}
      <div className="bg-white mx-3 md:mx-4 mb-3 md:mb-4 rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <IoFlask size={16} className="text-slate-700" />
            <span className="font-semibold text-slate-900 text-xs uppercase tracking-wide">
              Soil Parameters
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="border-l-2 border-slate-300 pl-3">
              <div className="text-xs text-slate-500 mb-0.5">SPT N₆₀</div>
              <div className="text-lg font-semibold text-slate-900">
                {sptN60}
              </div>
            </div>
            <div className="border-l-2 border-slate-300 pl-3">
              <div className="text-xs text-slate-500 mb-0.5">Unit Weight</div>
              <div className="text-lg font-semibold text-slate-900">
                {unitWeight}
              </div>
              <div className="text-xs text-slate-400">kN/m³</div>
            </div>
            <div className="border-l-2 border-slate-300 pl-3">
              <div className="text-xs text-slate-500 mb-0.5">CSR</div>
              <div className="text-lg font-semibold text-slate-900">{csr}</div>
            </div>
            <div className="border-l-2 border-slate-300 pl-3">
              <div className="text-xs text-slate-500 mb-0.5">CRR</div>
              <div className="text-lg font-semibold text-slate-900">{crr}</div>
            </div>
            <div className="border-l-2 border-slate-300 pl-3">
              <div className="text-xs text-slate-500 mb-0.5">GWL</div>
              <div className="text-lg font-semibold text-slate-900">{gwl}</div>
              <div className="text-xs text-slate-400">meters</div>
            </div>
            <div className="border-l-2 border-slate-300 pl-3">
              <div className="text-xs text-slate-500 mb-0.5">Fines</div>
              <div className="text-lg font-semibold text-slate-900">
                {finesPercent}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predicted Settlement */}
      <div className="bg-white mx-3 md:mx-4 mb-3 md:mb-4 rounded-lg border border-orange-200 overflow-hidden">
        <div className="bg-orange-50 px-5 py-3 border-b border-orange-100">
          <div className="flex items-center gap-2">
            <IoTrendingDown size={16} className="text-orange-600" />
            <span className="font-semibold text-orange-900 text-xs uppercase tracking-wide">
              Predicted Settlement
            </span>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-3xl font-bold text-orange-600">
              {settlementCm}
            </div>
            <div className="text-sm text-slate-600">cm</div>
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-md bg-orange-100 border border-orange-200">
            <span className="text-xs font-medium text-orange-900">
              Severity: {settlementSeverity}
            </span>
          </div>
        </div>
      </div>

      {/* Bearing Capacity */}
      <div className="bg-white mx-3 md:mx-4 mb-3 md:mb-4 rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <IoConstruct size={16} className="text-slate-700" />
            <span className="font-semibold text-slate-900 text-xs uppercase tracking-wide">
              Bearing Capacity
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-xs text-emerald-700 mb-1 font-medium">
                Pre-Liquefaction
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                {Math.round(bearingPre)}
              </div>
              <div className="text-xs text-emerald-600">kPa</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-xs text-orange-700 mb-1 font-medium">
                Post-Liquefaction
              </div>
              <div className="text-2xl font-bold text-orange-700">
                {Math.round(bearingPost)}
              </div>
              <div className="text-xs text-orange-600">kPa</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <IoAlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span className="text-red-700 text-sm font-medium">
              {Math.round(capacityReduction)}% Capacity Reduction
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white mx-3 md:mx-4 mb-3 md:mb-4 rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <IoBulb size={16} className="text-slate-700" />
            <span className="font-semibold text-slate-900 text-xs uppercase tracking-wide">
              Recommendations
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="space-y-2.5">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                <span className="text-sm text-slate-700">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mx-3 md:mx-4 mb-4 md:mb-6 space-y-2 md:space-y-3">
        <button
          onClick={onToggleComparison}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-5 rounded-lg flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow-md"
        >
          <IoGitCompare size={18} />
          <span className="text-sm">View Comparison</span>
        </button>

        <button
          onClick={handleDownload}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-5 rounded-lg flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow-md"
        >
          <IoDocumentText size={18} />
          <span className="text-sm">Generate Report</span>
        </button>
      </div>
    </div>
  );
}
