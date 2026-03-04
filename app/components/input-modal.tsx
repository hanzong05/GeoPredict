"use client";

import { useState } from "react";

const MAGNITUDE_OPTIONS = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

interface InputModalProps {
  open: boolean;
  onSubmit: (qActual: number, magnitude: number) => void;
  onClose: () => void;
}

export default function InputModal({ open, onSubmit, onClose }: InputModalProps) {
  const [qActual, setQActual] = useState("");
  const [magnitude, setMagnitude] = useState("7.0");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseFloat(qActual);
    if (isNaN(q) || q < 0) return;
    onSubmit(q, parseFloat(magnitude));
    setQActual("");
    setMagnitude("7.0");
  };

  const handleClose = () => {
    setQActual("");
    setMagnitude("7.0");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl px-6 py-6 w-[320px] sm:w-[380px]">
        <h2 className="text-base font-semibold text-slate-900 mb-1">
          Location Parameters
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Enter building details before running the analysis.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Building Weight */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Building Weight — q actual (kPa)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g. 120.0"
              value={qActual}
              onChange={(e) => setQActual(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Magnitude */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Earthquake Magnitude (Mw)
            </label>
            <select
              value={magnitude}
              onChange={(e) => setMagnitude(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
            >
              {MAGNITUDE_OPTIONS.map((m) => (
                <option key={m} value={m.toFixed(1)}>
                  {m.toFixed(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!qActual || parseFloat(qActual) < 0}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Analyze
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
