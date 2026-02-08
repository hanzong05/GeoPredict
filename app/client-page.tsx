"use client";

import { useState, useCallback, memo } from "react";
import dynamic from "next/dynamic";
import Header from "./components/header";
import LiquefactionSidebar from "./components/sidebar";
import Comparison from "./components/comparison";
import PredictingModal from "./components/modal";

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

// Optimize Map import
const Map = dynamic(() => import("./components/map"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
        <span className="text-sm font-medium text-slate-600">
          Loading map...
        </span>
      </div>
    </div>
  ),
});

export default function ClientPage() {
  const [location, setLocation] = useState("Tarlac City");
  const [latitude, setLatitude] = useState(15.4754);
  const [longitude, setLongitude] = useState(120.5963);
  const [isPredicting, setIsPredicting] = useState(false);
  const [externalLocation, setExternalLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(
    null,
  );

  // Memoize location change handler
  const handleLocationChange = useCallback(async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      );
      const data = await response.json();

      const address = data.address || {};
      const locationName =
        address.city ||
        address.municipality ||
        address.town ||
        address.village ||
        address.county ||
        address.state ||
        "Unknown Location";

      setLocation(locationName);
    } catch (error) {
      console.error("Error fetching location:", error);
      setLocation(`Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);
    }
  }, []);

  // Memoize manual location submit handler
  const handleManualLocationSubmit = useCallback(
    (lat: number, lng: number) => {
      setExternalLocation({ lat, lng });
      setLatitude(lat);
      setLongitude(lng);
      handleLocationChange(lat, lng);
    },
    [handleLocationChange],
  );

  // Memoize prediction result handler
  const handlePredictionResult = useCallback(
    (data: PredictionData) => {
      setPredictionData(data);
      setLatitude(data.location.latitude);
      setLongitude(data.location.longitude);
      handleLocationChange(data.location.latitude, data.location.longitude);
    },
    [handleLocationChange],
  );

  // Memoize comparison toggle
  const toggleComparison = useCallback(() => {
    setShowComparison((prev) => !prev);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header
        onLocationSubmit={handleManualLocationSubmit}
        onPredictionResult={handlePredictionResult}
        onPredictingChange={setIsPredicting}
      />
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {showComparison ? (
          <Comparison
            onBack={() => setShowComparison(false)}
            predictionData={predictionData}
          />
        ) : (
          <LiquefactionSidebar
            location={location}
            predictionData={predictionData}
            onToggleComparison={toggleComparison}
          />
        )}
        <div className="flex-1 h-1/2 md:h-full">
          <Map
            onLocationChange={handleLocationChange}
            externalLocation={externalLocation}
            onPredictionResult={handlePredictionResult}
            onPredictingChange={setIsPredicting}
          />
        </div>
      </div>
      <PredictingModal
        open={isPredicting}
        message="Running soil liquefaction analysis…"
      />
    </div>
  );
}
