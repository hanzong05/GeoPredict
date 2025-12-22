'use client';

import React from 'react';
import { IoLocation, IoClose, IoWarning, IoFlask, IoTrendingDown, IoConstruct, IoBulb, IoDocumentText, IoAlertCircle, IoGitCompare } from 'react-icons/io5';

interface LiquefactionSidebarProps {
  location?: string;
  latitude?: number;
  longitude?: number;
  onToggleComparison?: () => void;
}

export default function LiquefactionSidebar({
  location = "Tarlac City",
  latitude = 15.4567,
  longitude = 120.5678,
  onToggleComparison
}: LiquefactionSidebarProps) {
  const handleDownload = () => {
    const report = `LIQUEFACTION RISK ASSESSMENT REPORT
====================================
Location: ${location}
Coordinates: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E

RISK LEVEL: HIGH
Probability: 85%

SOIL PARAMETERS:
- SPT N₆₀: 8
- Unit Weight: 17.8 kN/m³
- CSR: 0.28
- CRR: 0.15
- Ground Water Level: 3.0 m
- Fines Content: 20%

PREDICTED SETTLEMENT: 7.5 cm (Severe)

BEARING CAPACITY:
- Pre-Liquefaction: 250 kPa
- Post-Liquefaction: 85 kPa
- Reduction: 66%

RECOMMENDATIONS:
• Detailed investigation
• Deep foundation system
• Soil densification
• Post-liq design

Generated: ${new Date().toLocaleString()}`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'liquefaction-risk-report.txt';
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
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Location</span>
            </div>
          </div>
          <div className="font-semibold text-slate-900">{location}</div>
          <div className="text-xs text-slate-500 mt-1">{latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E</div>
        </div>

        {/* Risk Alert */}
        <div className="bg-white mx-3 md:mx-4 my-3 md:my-4 rounded-lg border border-red-200 overflow-hidden">
          <div className="bg-red-50 px-5 py-3 border-b border-red-100">
            <div className="flex items-center gap-2">
              <IoWarning size={16} className="text-red-600" />
              <span className="font-semibold text-red-900 text-xs uppercase tracking-wide">Risk Assessment</span>
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="flex items-baseline gap-2 mb-2">
              <div className="text-3xl font-bold text-red-600">HIGH</div>
              <div className="text-sm text-slate-600">Risk Level</div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-600">Probability</span>
                <span className="text-sm font-semibold text-slate-900">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-red-500 h-full transition-all duration-500" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Soil Parameters */}
        <div className="bg-white mx-3 md:mx-4 mb-3 md:mb-4 rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <IoFlask size={16} className="text-slate-700" />
              <span className="font-semibold text-slate-900 text-xs uppercase tracking-wide">Soil Parameters</span>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="border-l-2 border-slate-300 pl-3">
                <div className="text-xs text-slate-500 mb-0.5">SPT N₆₀</div>
                <div className="text-lg font-semibold text-slate-900">8</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-3">
                <div className="text-xs text-slate-500 mb-0.5">Unit Weight</div>
                <div className="text-lg font-semibold text-slate-900">17.8</div>
                <div className="text-xs text-slate-400">kN/m³</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-3">
                <div className="text-xs text-slate-500 mb-0.5">CSR</div>
                <div className="text-lg font-semibold text-slate-900">0.28</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-3">
                <div className="text-xs text-slate-500 mb-0.5">CRR</div>
                <div className="text-lg font-semibold text-slate-900">0.15</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-3">
                <div className="text-xs text-slate-500 mb-0.5">GWL</div>
                <div className="text-lg font-semibold text-slate-900">3.0</div>
                <div className="text-xs text-slate-400">meters</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-3">
                <div className="text-xs text-slate-500 mb-0.5">Fines</div>
                <div className="text-lg font-semibold text-slate-900">20%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Predicted Settlement */}
        <div className="bg-white mx-3 md:mx-4 mb-3 md:mb-4 rounded-lg border border-orange-200 overflow-hidden">
          <div className="bg-orange-50 px-5 py-3 border-b border-orange-100">
            <div className="flex items-center gap-2">
              <IoTrendingDown size={16} className="text-orange-600" />
              <span className="font-semibold text-orange-900 text-xs uppercase tracking-wide">Predicted Settlement</span>
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="flex items-baseline gap-2 mb-2">
              <div className="text-3xl font-bold text-orange-600">7.5</div>
              <div className="text-sm text-slate-600">cm</div>
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-md bg-orange-100 border border-orange-200">
              <span className="text-xs font-medium text-orange-900">Severity: Severe</span>
            </div>
          </div>
        </div>

        {/* Bearing Capacity */}
        <div className="bg-white mx-3 md:mx-4 mb-3 md:mb-4 rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <IoConstruct size={16} className="text-slate-700" />
              <span className="font-semibold text-slate-900 text-xs uppercase tracking-wide">Bearing Capacity</span>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-xs text-emerald-700 mb-1 font-medium">Pre-Liquefaction</div>
                <div className="text-2xl font-bold text-emerald-700">250</div>
                <div className="text-xs text-emerald-600">kPa</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-xs text-orange-700 mb-1 font-medium">Post-Liquefaction</div>
                <div className="text-2xl font-bold text-orange-700">85</div>
                <div className="text-xs text-orange-600">kPa</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <IoAlertCircle size={16} className="text-red-600 flex-shrink-0" />
              <span className="text-red-700 text-sm font-medium">66% Capacity Reduction</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white mx-3 md:mx-4 mb-3 md:mb-4 rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <IoBulb size={16} className="text-slate-700" />
              <span className="font-semibold text-slate-900 text-xs uppercase tracking-wide">Recommendations</span>
            </div>
          </div>

          <div className="p-5">
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                <span className="text-sm text-slate-700">Detailed geotechnical investigation</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                <span className="text-sm text-slate-700">Deep foundation system implementation</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                <span className="text-sm text-slate-700">Soil densification treatment</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></div>
                <span className="text-sm text-slate-700">Post-liquefaction design considerations</span>
              </div>
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