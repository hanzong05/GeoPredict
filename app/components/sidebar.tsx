"use client";

import React from "react";
import {
  IoLocation,
  IoFlask,
  IoTrendingDown,
  IoConstruct,
  IoBulb,
  IoDocumentText,
  IoAlertCircle,
  IoGitCompare,
  IoSearchOutline,
} from "react-icons/io5";

// ============================================================================
// Type definition for prediction result
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
  predictionData?: PredictionData | null;
  onToggleComparison?: () => void;
}

export default function LiquefactionSidebar({
  location = "Tarlac City",
  predictionData,
  onToggleComparison,
}: LiquefactionSidebarProps) {
  // Check if we have valid prediction data (not all zeros)
  const hasValidData =
    predictionData &&
    predictionData.soil_parameters.spt_n60 > 0 &&
    predictionData.soil_parameters.unit_weight > 0;

  // Use prediction data if available, otherwise show placeholder
  const latitude = predictionData?.location.latitude ?? 15.4754;
  const longitude = predictionData?.location.longitude ?? 120.5963;
  const distanceKm = predictionData?.location.nearest_borehole_distance_km;

  const riskLevel = predictionData?.risk_assessment.risk_level ?? "MEDIUM";
  const probability = predictionData?.risk_assessment.probability ?? 0;
  const severity = predictionData?.risk_assessment.severity ?? "Unknown";

  const sptN60 = predictionData?.soil_parameters.spt_n60 ?? 0;
  const unitWeight = predictionData?.soil_parameters.unit_weight ?? 0;
  const csr = predictionData?.soil_parameters.csr ?? 0;
  const crr = predictionData?.soil_parameters.crr ?? 0;
  const gwl = predictionData?.soil_parameters.gwl ?? 0;
  const finesPercent = predictionData?.soil_parameters.fines_percent ?? 0;

  const settlementCm = predictionData?.settlement.predicted_cm ?? 0;
  const settlementSeverity = predictionData?.settlement.severity ?? "Unknown";

  const bearingPre = predictionData?.bearing_capacity.pre_liquefaction_kpa ?? 0;
  const bearingPost =
    predictionData?.bearing_capacity.post_liquefaction_kpa ?? 0;
  const capacityReduction =
    predictionData?.bearing_capacity.capacity_reduction_percent ?? 0;

  const recommendations = predictionData?.recommendations ?? [];

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
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-600",
          bar: "bg-gray-500",
        };
    }
  };

  const riskColors = getRiskColor();

  const handleDownload = () => {
    if (!hasValidData) {
      alert(
        "No prediction data available to download. Please make a prediction first.",
      );
      return;
    }

    const report = `LIQUEFACTION RISK ASSESSMENT REPORT
====================================

Location: ${location}
Coordinates: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E
${distanceKm ? `Nearest Borehole: ${distanceKm.toFixed(2)} km away` : ""}

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
    <div className="w-full md:w-96 h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 space-y-4 md:space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="bg-slate-900 p-2 rounded-md flex-shrink-0 mt-0.5">
                <IoLocation className="text-white" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-1 truncate">
                  {location}
                </h2>
                <p className="text-xs text-slate-500 break-words">
                  {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
                </p>
                {distanceKm && hasValidData && (
                  <p className="text-xs text-slate-400 mt-1">
                    📍 {distanceKm.toFixed(2)} km from borehole
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* No Data Warning */}
          {!hasValidData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <IoSearchOutline
                  className="text-blue-600 flex-shrink-0 mt-0.5"
                  size={20}
                />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    No Prediction Data
                  </h3>
                  <p className="text-xs text-blue-700">
                    Click on the map or enter coordinates to get a liquefaction
                    risk prediction for your location.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Risk Alert */}
          {hasValidData && (
            <div
              className={`${riskColors.bg} ${riskColors.border} border rounded-lg p-4`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`${riskColors.bg} p-2 rounded-md flex-shrink-0`}
                >
                  <IoAlertCircle className={riskColors.text} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium text-slate-600 mb-1">
                    Risk Assessment
                  </h3>
                  <p
                    className={`text-xl md:text-2xl font-bold ${riskColors.text} mb-1`}
                  >
                    {riskLevel}
                  </p>
                  <p className="text-xs text-slate-500">Risk Level</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    Probability
                  </span>
                  <span className={`font-semibold ${riskColors.text}`}>
                    {probability}%
                  </span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className={`h-full ${riskColors.bar} transition-all duration-500`}
                    style={{ width: `${probability}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Soil Parameters */}
          {hasValidData && (
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <IoFlask className="text-slate-700" size={18} />
                <h3 className="text-sm font-semibold text-slate-900">
                  Soil Parameters
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-md border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">SPT N₆₀</p>
                  <p className="text-lg font-bold text-slate-900">{sptN60}</p>
                </div>
                <div className="bg-white p-3 rounded-md border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Unit Weight</p>
                  <p className="text-lg font-bold text-slate-900">
                    {unitWeight}
                  </p>
                  <p className="text-xs text-slate-400">kN/m³</p>
                </div>
                <div className="bg-white p-3 rounded-md border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">CSR</p>
                  <p className="text-lg font-bold text-slate-900">{csr}</p>
                </div>
                <div className="bg-white p-3 rounded-md border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">CRR</p>
                  <p className="text-lg font-bold text-slate-900">{crr}</p>
                </div>
                <div className="bg-white p-3 rounded-md border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">GWL</p>
                  <p className="text-lg font-bold text-slate-900">{gwl}</p>
                  <p className="text-xs text-slate-400">meters</p>
                </div>
                <div className="bg-white p-3 rounded-md border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Fines</p>
                  <p className="text-lg font-bold text-slate-900">
                    {finesPercent}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Predicted Settlement */}
          {hasValidData && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <IoTrendingDown className="text-orange-700" size={18} />
                <h3 className="text-sm font-semibold text-slate-900">
                  Predicted Settlement
                </h3>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-orange-700">
                  {settlementCm}
                </span>
                <span className="text-lg text-orange-600">cm</span>
              </div>

              <p className="text-xs text-orange-600">
                Severity: {settlementSeverity}
              </p>
            </div>
          )}

          {/* Bearing Capacity */}
          {hasValidData && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <IoConstruct className="text-slate-700" size={18} />
                <h3 className="text-sm font-semibold text-slate-900">
                  Bearing Capacity
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-xs text-slate-600">
                    Pre-Liquefaction
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900">
                      {Math.round(bearingPre)}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">kPa</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-xs text-slate-600">
                    Post-Liquefaction
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-orange-600">
                      {Math.round(bearingPost)}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">kPa</span>
                  </div>
                </div>

                <div className="bg-red-50 p-2 rounded-md">
                  <p className="text-xs text-red-700 font-medium">
                    ⚠️ {Math.round(capacityReduction)}% Capacity Reduction
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {hasValidData && recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <IoBulb className="text-blue-700" size={18} />
                <h3 className="text-sm font-semibold text-slate-900">
                  Recommendations
                </h3>
              </div>

              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold text-xs mt-0.5 flex-shrink-0">
                      {index + 1}.
                    </span>
                    <span className="text-xs text-blue-900 leading-relaxed">
                      {rec}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {hasValidData && (
              <button
                onClick={() => onToggleComparison?.()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-5 rounded-lg flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow-md"
              >
                <IoGitCompare size={18} />
                View Comparison
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={!hasValidData}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-5 rounded-lg flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <IoDocumentText size={18} />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
