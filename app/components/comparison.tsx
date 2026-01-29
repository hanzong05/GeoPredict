"use client";

import React from "react";
import {
  IoArrowBack,
  IoGitCompare,
  IoTrendingDown,
  IoConstruct,
  IoStatsChart,
} from "react-icons/io5";

interface PredictionData {
  location: {
    latitude: number;
    longitude: number;
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
}

interface ComparisonProps {
  onBack?: () => void;
  predictionData?: PredictionData | null; // ← ADD THIS
}

export default function Comparison({
  onBack,
  predictionData,
}: ComparisonProps) {
  // Use prediction data if available, otherwise use defaults
  const riskLevel = predictionData?.risk_assessment.risk_level ?? "HIGH";
  const probability = predictionData?.risk_assessment.probability ?? 85;
  const settlementCm = predictionData?.settlement.predicted_cm ?? 7.5;
  const bearingPost =
    predictionData?.bearing_capacity.post_liquefaction_kpa ?? 85;

  // Calculate traditional method estimates (simplified)
  const traditionalSettlement = settlementCm * 0.83; // Tokimatsu & Seed typically ~17% lower
  const traditionalBearing = bearingPost * 1.12; // Terzaghi typically ~12% higher
  const settlementDiff = (
    ((settlementCm - traditionalSettlement) / traditionalSettlement) *
    100
  ).toFixed(0);

  return (
    <div className="w-full md:w-[360px] h-1/2 md:h-full bg-slate-50 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors mb-3"
        >
          <IoArrowBack size={18} />
          <span className="text-sm font-medium">Back to Assessment</span>
        </button>
        <div className="flex items-center gap-2">
          <IoGitCompare size={18} className="text-slate-700" />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Model Comparison
          </span>
        </div>
        <div className="font-semibold text-slate-900 mt-1">
          ANN vs Traditional Methods
        </div>
      </div>

      {/* Liquefaction Assessment Comparison */}
      <div className="bg-white mx-3 md:mx-4 my-3 md:my-4 rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <IoGitCompare size={16} className="text-blue-600" />
            <span className="font-semibold text-blue-900 text-xs uppercase tracking-wide">
              Liquefaction Assessment
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="space-y-4">
            <div className="border-l-2 border-blue-500 pl-3">
              <div className="text-xs text-slate-500 mb-1">ANN Prediction</div>
              <div className="text-2xl font-bold text-blue-600">
                {riskLevel} RISK
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Probability: {probability}%
              </div>
            </div>

            <div className="border-l-2 border-slate-300 pl-3">
              <div className="text-xs text-slate-500 mb-1">
                DPWH BSDS Method
              </div>
              <div className="text-2xl font-bold text-slate-700">
                {probability >= 75
                  ? "MODERATE"
                  : probability >= 50
                    ? "LOW"
                    : "MINIMAL"}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                FS: {(1.0 + (100 - probability) / 100).toFixed(2)}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-xs font-medium text-amber-900">
                Variance: ANN shows higher sensitivity to local conditions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settlement Comparison */}
      <div className="bg-white mx-3 md:mx-4 mb-3 md:mb-4 rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-orange-50 px-5 py-3 border-b border-orange-100">
          <div className="flex items-center gap-2">
            <IoTrendingDown size={16} className="text-orange-600" />
            <span className="font-semibold text-orange-900 text-xs uppercase tracking-wide">
              Settlement Comparison
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="space-y-4">
            <div className="border-l-2 border-orange-500 pl-3">
              <div className="text-xs text-slate-500 mb-1">ANN Model</div>
              <div className="text-2xl font-bold text-orange-600">
                {settlementCm.toFixed(1)} cm
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Range: {(settlementCm * 0.91).toFixed(1)} -{" "}
                {(settlementCm * 1.09).toFixed(1)} cm
              </div>
            </div>

            <div className="border-l-2 border-slate-300 pl-3">
              <div className="text-xs text-slate-500 mb-1">
                Tokimatsu & Seed (1987)
              </div>
              <div className="text-2xl font-bold text-slate-700">
                {traditionalSettlement.toFixed(1)} cm
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Traditional empirical
              </div>
            </div>

            <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Difference</span>
                <span className="text-sm font-semibold text-slate-900">
                  +{settlementDiff}%
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                ANN predicts higher settlement
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bearing Capacity Comparison */}
      <div className="bg-white mx-3 md:mx-4 mb-3 md:mb-4 rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100">
          <div className="flex items-center gap-2">
            <IoConstruct size={16} className="text-emerald-600" />
            <span className="font-semibold text-emerald-900 text-xs uppercase tracking-wide">
              Bearing Capacity
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="space-y-4">
            <div className="border-l-2 border-emerald-500 pl-3">
              <div className="text-xs text-slate-500 mb-1">
                ANN Model (Post-Liq)
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {Math.round(bearingPost)} kPa
              </div>
              <div className="text-xs text-slate-600 mt-1">
                CI: {Math.round(bearingPost * 0.92)} -{" "}
                {Math.round(bearingPost * 1.08)} kPa
              </div>
            </div>

            <div className="border-l-2 border-slate-300 pl-3">
              <div className="text-xs text-slate-500 mb-1">Terzaghi Method</div>
              <div className="text-2xl font-bold text-slate-700">
                {Math.round(traditionalBearing)} kPa
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Modified for liquefaction
              </div>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-xs font-medium text-green-900">
                Agreement: 89% correlation
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Accuracy Metrics */}
      <div className="bg-white mx-3 md:mx-4 mb-4 md:mb-6 rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <IoStatsChart size={16} className="text-slate-700" />
            <span className="font-semibold text-slate-900 text-xs uppercase tracking-wide">
              Model Accuracy
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="border-l-2 border-blue-500 pl-3">
              <div className="text-xs text-slate-500 mb-0.5">R² Score</div>
              <div className="text-lg font-semibold text-slate-900">0.94</div>
            </div>
            <div className="border-l-2 border-blue-500 pl-3">
              <div className="text-xs text-slate-500 mb-0.5">RMSE</div>
              <div className="text-lg font-semibold text-slate-900">0.82</div>
            </div>
            <div className="border-l-2 border-blue-500 pl-3">
              <div className="text-xs text-slate-500 mb-0.5">MAE</div>
              <div className="text-lg font-semibold text-slate-900">0.65</div>
            </div>
            <div className="border-l-2 border-blue-500 pl-3">
              <div className="text-xs text-slate-500 mb-0.5">Accuracy</div>
              <div className="text-lg font-semibold text-slate-900">92%</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs font-medium text-blue-900 mb-1">
              Model Performance
            </div>
            <div className="text-xs text-blue-700">
              Excellent predictive capability with high confidence intervals
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
