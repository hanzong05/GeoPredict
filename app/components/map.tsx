"use client";

import { useEffect, useState, useRef } from "react";
import type { FeatureCollection } from "geojson";
import dynamic from "next/dynamic";
import { predictByLocation } from "@/lib/actions/liquefaction";

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

interface MapProps {
  onLocationChange?: (lat: number, lng: number) => void;
  externalLocation?: { lat: number; lng: number } | null;
  onPredictionResult?: (data: PredictionData) => void;
  onPredictingChange?: (loading: boolean) => void;
}

// Simplified dynamic import - just import the map container component
const LeafletMapContainer = dynamic(
  () => import("./map-container").then((mod) => mod.LeafletMapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full relative bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <span className="text-sm font-medium text-slate-600">
            Loading map...
          </span>
        </div>
      </div>
    ),
  },
);

export default function Map({
  onLocationChange,
  externalLocation,
  onPredictionResult,
  onPredictingChange,
}: MapProps = {}) {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    null,
  );
  const [tarlacGeoJson, setTarlacGeoJson] = useState<FeatureCollection | null>(
    null,
  );

  const handlePositionChange = (pos: [number, number]) => {
    setMarkerPosition(pos);
    if (onLocationChange) {
      onLocationChange(pos[0], pos[1]);
    }
  };

  // Update marker when external location changes
  useEffect(() => {
    if (externalLocation) {
      setMarkerPosition([externalLocation.lat, externalLocation.lng]);
    }
  }, [externalLocation]);

  // One-time initialization
  useEffect(() => {
    setMounted(true);

    // Fetch GeoJSON only once
    const fetchTarlacBoundary = async () => {
      try {
        const response = await fetch("/maps/tarlac-province.json");
        const geoJson: FeatureCollection = await response.json();
        setTarlacGeoJson(geoJson);
      } catch (error) {
        console.error("Error loading Tarlac boundary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTarlacBoundary();
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full relative bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <span className="text-sm font-medium text-slate-600">
            Loading map...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-white">
      <LeafletMapContainer
        markerPosition={markerPosition}
        setMarkerPosition={handlePositionChange}
        tarlacGeoJson={tarlacGeoJson}
        loading={loading}
        onPredictingChange={onPredictingChange}
        onPredictionResult={onPredictionResult}
      />
    </div>
  );
}
