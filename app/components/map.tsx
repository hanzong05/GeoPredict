"use client";

import { useEffect, useState, useCallback } from "react";
import type { FeatureCollection } from "geojson";
import dynamic from "next/dynamic";
import type { BoreholeFeature, BoreholeLegend } from "./map-container";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface MapProps {
  externalLocation?: { lat: number; lng: number } | null;
  onRequestPrediction: (lat: number, lng: number) => void;
}

const LeafletMapContainer = dynamic(
  () => import("./map-container").then((mod) => mod.LeafletMapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full relative bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4" />
          <span className="text-sm font-medium text-slate-600">
            Loading map...
          </span>
        </div>
      </div>
    ),
  },
);

export default function Map({
  externalLocation,
  onRequestPrediction,
}: MapProps) {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    null,
  );
  const [tarlacGeoJson, setTarlacGeoJson] = useState<FeatureCollection | null>(
    null,
  );
  const [boreholes, setBoreholes] = useState<BoreholeFeature[]>([]);
  const [boreholesLoading, setBoreholesLoading] = useState(false);
  const [legend, setLegend] = useState<Record<string, BoreholeLegend>>({});

  const fetchBoreholes = useCallback(async () => {
    setBoreholesLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/boreholes`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBoreholes(data.boreholes ?? []);
      setLegend(data.legend ?? {});
    } catch (err) {
      console.error("Failed to fetch boreholes:", err);
    } finally {
      setBoreholesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (externalLocation) {
      setMarkerPosition([externalLocation.lat, externalLocation.lng]);
    }
  }, [externalLocation]);

  useEffect(() => {
    setMounted(true);

    const fetchBoundary = async () => {
      try {
        const res = await fetch("/maps/tarlac-province.json");
        const geoJson: FeatureCollection = await res.json();
        setTarlacGeoJson(geoJson);
      } catch (err) {
        console.error("Error loading Tarlac boundary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoundary();
    fetchBoreholes(); // ← fetch boreholes on mount
  }, [fetchBoreholes]);

  if (!mounted) {
    return (
      <div className="w-full h-full relative bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4" />
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
        setMarkerPosition={setMarkerPosition}
        tarlacGeoJson={tarlacGeoJson}
        loading={loading}
        onRequestPrediction={onRequestPrediction}
        boreholes={boreholes}
        boreholesLoading={boreholesLoading}
        legend={legend}
      />
    </div>
  );
}
