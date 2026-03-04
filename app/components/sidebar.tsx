"use client";

import React from "react";
import {
  IoLocation,
  IoDocumentText,
  IoSearchOutline,
} from "react-icons/io5";

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
    factor_of_safety?: number;
    confidence?: string;
    data_source?: string;
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
    predicted_cm: number;          // post-liquefaction settlement
    pre_liquefaction_cm?: number;  // without liquefaction settlement
    severity: string;
  };
  bearing_capacity: {
    pre_liquefaction_kpa: number;
    post_liquefaction_kpa: number;
    capacity_reduction_percent: number;
  };
  foundation_recommendation?: {
    base_m: number;
    depth_m: number;
    lb_ratio?: number;
  };
  recommendations: string[];
}

interface LiquefactionSidebarProps {
  location?: string;
  predictionData?: PredictionData | null;
  onToggleComparison?: () => void;
}

// Section header component
function SectionHeader({
  number,
  title,
  color,
}: {
  number: number;
  title: string;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-2 mb-3`}>
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${color}`}
      >
        {number}
      </span>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    </div>
  );
}

// Sub-item row
function SubRow({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string | number;
  unit?: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-slate-600">{label}</span>
      <div className="text-right">
        <span className={`text-sm font-bold ${accent ?? "text-slate-900"}`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs text-slate-400 ml-1">{unit}</span>
        )}
      </div>
    </div>
  );
}

export default function LiquefactionSidebar({
  location = "Tarlac City",
  predictionData,
}: LiquefactionSidebarProps) {
  const hasValidData =
    predictionData &&
    predictionData.soil_parameters.spt_n60 > 0 &&
    predictionData.soil_parameters.unit_weight > 0;

  const latitude = predictionData?.location.latitude ?? 15.4754;
  const longitude = predictionData?.location.longitude ?? 120.5963;
  const distanceKm = predictionData?.location.nearest_borehole_distance_km;

  const riskLevel = predictionData?.risk_assessment.risk_level ?? "MEDIUM";
  const probability = predictionData?.risk_assessment.probability ?? 0;
  const factorOfSafety = predictionData?.risk_assessment.factor_of_safety;
  const confidence = predictionData?.risk_assessment.confidence;

  const sptN60 = predictionData?.soil_parameters.spt_n60 ?? 0;
  const unitWeight = predictionData?.soil_parameters.unit_weight ?? 0;
  const csr = predictionData?.soil_parameters.csr ?? 0;
  const crr = predictionData?.soil_parameters.crr ?? 0;
  const gwl = predictionData?.soil_parameters.gwl ?? 0;
  const finesPercent = predictionData?.soil_parameters.fines_percent ?? 0;

  const bearingPre = predictionData?.bearing_capacity.pre_liquefaction_kpa ?? 0;
  const bearingPost = predictionData?.bearing_capacity.post_liquefaction_kpa ?? 0;

  const settlementPost = predictionData?.settlement.predicted_cm ?? 0;
  const settlementPre = predictionData?.settlement.pre_liquefaction_cm;

  const foundationBase = predictionData?.foundation_recommendation?.base_m;
  const foundationDepth = predictionData?.foundation_recommendation?.depth_m;
  const foundationLbRatio = predictionData?.foundation_recommendation?.lb_ratio;

  const riskColors = {
    HIGH:   { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-600",    bar: "bg-red-500",    badge: "bg-red-600"    },
    MEDIUM: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", bar: "bg-orange-500", badge: "bg-orange-500" },
    LOW:    { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-600",  bar: "bg-green-500",  badge: "bg-green-600"  },
  }[riskLevel] ?? { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600", bar: "bg-gray-500", badge: "bg-gray-500" };

  const handleDownload = () => {
    if (!hasValidData) {
      alert("No prediction data available. Please make a prediction first.");
      return;
    }

    const report = `LIQUEFACTION RISK ASSESSMENT REPORT
====================================

Location: ${location}
Coordinates: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E
${distanceKm ? `Nearest Borehole: ${distanceKm.toFixed(2)} km away` : ""}

1. LIQUEFACTION ANALYSIS
Risk Level: ${riskLevel}
Probability: ${probability}%
${factorOfSafety !== undefined ? `Factor of Safety: ${factorOfSafety.toFixed(2)}` : ""}
${confidence ? `Confidence: ${confidence}` : ""}
SPT N60: ${sptN60} | Unit Weight: ${unitWeight} kN/m³
CSR: ${csr} | CRR: ${crr}
GWL: ${gwl} m | Fines: ${finesPercent}%

2. WITHOUT LIQUEFACTION
A. Soil Bearing Capacity: ${Math.round(bearingPre)} kPa
${settlementPre !== undefined ? `B. Settlement: ${settlementPre.toFixed(2)} cm` : ""}

3. WITH LIQUEFACTION
A. Post Soil Bearing Capacity: ${Math.round(bearingPost)} kPa
B. Post Settlement: ${settlementPost.toFixed(2)} cm

4. FOUNDATION RECOMMENDATION
${foundationBase !== undefined ? `A. Base (B) of Foundation: ${foundationBase.toFixed(2)} m` : "A. Base (B) of Foundation: N/A"}
${foundationDepth !== undefined ? `B. Depth (D) of Foundation: ${foundationDepth.toFixed(2)} m` : "B. Depth (D) of Foundation: N/A"}
${foundationLbRatio !== undefined ? `C. L/B Ratio: ${foundationLbRatio.toFixed(2)}` : ""}

Generated: ${new Date().toLocaleString()}`;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liquefaction-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full md:w-96 h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 space-y-4">

          {/* Location Header */}
          <div className="flex items-start gap-3">
            <div className="bg-slate-900 p-2 rounded-md flex-shrink-0 mt-0.5">
              <IoLocation className="text-white" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-slate-900 truncate">
                {location}
              </h2>
              <p className="text-xs text-slate-500">
                {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
              </p>
              {distanceKm && hasValidData && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {distanceKm.toFixed(2)} km from nearest borehole
                </p>
              )}
            </div>
          </div>

          {/* No data state */}
          {!hasValidData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <IoSearchOutline className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    No Prediction Data
                  </h3>
                  <p className="text-xs text-blue-700">
                    Click on the map or enter coordinates to get a liquefaction
                    risk prediction.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasValidData && (
            <>
              {/* ── 1. Liq Analysis ── */}
              <div className={`${riskColors.bg} ${riskColors.border} border rounded-lg p-4`}>
                <SectionHeader number={1} title="Liq Analysis" color={riskColors.badge} />

                {/* Risk badge + probability */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Risk Level</p>
                    <p className={`text-2xl font-bold ${riskColors.text}`}>{riskLevel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-0.5">Probability</p>
                    <p className={`text-2xl font-bold ${riskColors.text}`}>{probability}%</p>
                  </div>
                </div>
                <div className="h-1.5 bg-white/70 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full ${riskColors.bar} transition-all duration-500`}
                    style={{ width: `${probability}%` }}
                  />
                </div>

                {/* Soil params grid */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "SPT N₆₀", value: sptN60, unit: "" },
                    { label: "Unit Wt", value: unitWeight, unit: "kN/m³" },
                    { label: "CSR", value: csr, unit: "" },
                    { label: "CRR", value: crr, unit: "" },
                    { label: "GWL", value: gwl, unit: "m" },
                    { label: "Fines", value: `${finesPercent}%`, unit: "" },
                  ].map(({ label, value, unit }) => (
                    <div key={label} className="bg-white/70 rounded-md p-2 text-center">
                      <p className="text-[10px] text-slate-500 mb-0.5">{label}</p>
                      <p className="text-sm font-bold text-slate-900">
                        {value}{unit && <span className="text-[10px] font-normal text-slate-400 ml-0.5">{unit}</span>}
                      </p>
                    </div>
                  ))}
                </div>

                {/* FS + Confidence row */}
                {(factorOfSafety !== undefined || confidence) && (
                  <div className="flex gap-2 mt-2">
                    {factorOfSafety !== undefined && (
                      <div className="flex-1 bg-white/70 rounded-md p-2 text-center">
                        <p className="text-[10px] text-slate-500 mb-0.5">Factor of Safety</p>
                        <p className="text-sm font-bold text-slate-900">{factorOfSafety.toFixed(2)}</p>
                      </div>
                    )}
                    {confidence && (
                      <div className="flex-1 bg-white/70 rounded-md p-2 text-center">
                        <p className="text-[10px] text-slate-500 mb-0.5">Confidence</p>
                        <p className="text-sm font-bold text-slate-900">{confidence}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── 2. W/o Liq ── */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <SectionHeader number={2} title="W/o Liq" color="bg-slate-600" />
                <SubRow
                  label="A. Soil Bearing Capacity"
                  value={Math.round(bearingPre)}
                  unit="kPa"
                />
                {settlementPre !== undefined ? (
                  <SubRow
                    label="B. Settlement"
                    value={settlementPre.toFixed(2)}
                    unit="cm"
                  />
                ) : (
                  <div className="py-2 text-xs text-slate-400">
                    B. Settlement — awaiting API data
                  </div>
                )}
              </div>

              {/* ── 3. W/ Liq ── */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <SectionHeader number={3} title="W/ Liq" color="bg-orange-500" />
                <SubRow
                  label="A. Post Soil Bearing Capacity"
                  value={Math.round(bearingPost)}
                  unit="kPa"
                  accent="text-orange-700"
                />
                <SubRow
                  label="B. Post Settlement"
                  value={settlementPost.toFixed(2)}
                  unit="cm"
                  accent="text-orange-700"
                />
              </div>

              {/* ── 4. Foundation Recommendation ── */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <SectionHeader number={4} title="Foundation Recommendation" color="bg-blue-600" />
                {foundationBase !== undefined ? (
                  <SubRow
                    label="A. Base (B) of Foundation"
                    value={foundationBase.toFixed(2)}
                    unit="m"
                    accent="text-blue-700"
                  />
                ) : (
                  <div className="py-2 text-xs text-slate-400">
                    A. Base (B) — awaiting API data
                  </div>
                )}
                {foundationDepth !== undefined ? (
                  <SubRow
                    label="B. Depth (D) of Foundation"
                    value={foundationDepth.toFixed(2)}
                    unit="m"
                    accent="text-blue-700"
                  />
                ) : (
                  <div className="py-2 text-xs text-slate-400">
                    B. Depth (D) — awaiting API data
                  </div>
                )}
                {foundationLbRatio !== undefined && (
                  <SubRow
                    label="C. L/B Ratio"
                    value={foundationLbRatio.toFixed(2)}
                    unit=""
                    accent="text-blue-700"
                  />
                )}
              </div>

              {/* Generate Report */}
              <div className="pt-1">
                <button
                  onClick={handleDownload}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-5 rounded-lg flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow-md"
                >
                  <IoDocumentText size={18} />
                  Generate Report
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
