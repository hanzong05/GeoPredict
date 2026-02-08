"use client";

import { useEffect, useRef, memo } from "react";
import type { FeatureCollection } from "geojson";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { predictByLocation } from "@/lib/actions/liquefaction";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon - do this once at module level
if (typeof window !== "undefined") {
  import("leaflet").then((L) => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  });
}

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

// ZoomToTarlac component - memoized
const ZoomToTarlac = memo(() => {
  const map = useMap();
  const hasZoomed = useRef(false);

  useEffect(() => {
    if (!map || hasZoomed.current) return;
    hasZoomed.current = true;

    setTimeout(() => {
      try {
        map.setView([12.8797, 121.774], 6);
        setTimeout(() => {
          map.flyTo([15.4754, 120.5963], 10, {
            duration: 2.5,
            easeLinearity: 0.25,
          });
        }, 800);
      } catch (error) {
        console.error("Map initialization error:", error);
      }
    }, 100);
  }, [map]);

  return null;
});

ZoomToTarlac.displayName = "ZoomToTarlac";

// FlyToLocation component - memoized
const FlyToLocation = memo(
  ({ position }: { position: [number, number] | null }) => {
    const map = useMap();

    useEffect(() => {
      if (position && map) {
        map.flyTo(position, 13, { duration: 1.5 });
      }
    }, [position, map]);

    return null;
  },
);

FlyToLocation.displayName = "FlyToLocation";

// LocationMarker component - memoized
const LocationMarker = memo(
  ({
    position,
    setPosition,
    onPredictingChange,
    onPredictionResult,
  }: {
    position: [number, number] | null;
    setPosition: (pos: [number, number]) => void;
    onPredictingChange?: (loading: boolean) => void;
    onPredictionResult?: (data: PredictionData) => void;
  }) => {
    useMapEvents({
      async click(e) {
        const pos: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPosition(pos);

        try {
          onPredictingChange?.(true);
          const result = await predictByLocation(e.latlng.lat, e.latlng.lng);
          if (result.success && result.data && onPredictionResult) {
            onPredictionResult(result.data as PredictionData);
          }
        } catch (error) {
          console.error("Prediction error:", error);
        } finally {
          onPredictingChange?.(false);
        }
      },
    });

    return position ? <Marker position={position} /> : null;
  },
);

LocationMarker.displayName = "LocationMarker";

// GeoJSON style - constant outside component
const geoJsonStyle = {
  fillColor: "#3b82f6",
  fillOpacity: 0.3,
  color: "#1d4ed8",
  weight: 3,
};

// Main map component
interface LeafletMapContainerProps {
  markerPosition: [number, number] | null;
  setMarkerPosition: (pos: [number, number]) => void;
  tarlacGeoJson: FeatureCollection | null;
  loading: boolean;
  onPredictingChange?: (loading: boolean) => void;
  onPredictionResult?: (data: PredictionData) => void;
}

export const LeafletMapContainer = memo(
  ({
    markerPosition,
    setMarkerPosition,
    tarlacGeoJson,
    loading,
    onPredictingChange,
    onPredictionResult,
  }: LeafletMapContainerProps) => {
    return (
      <>
        <MapContainer
          center={[12.8797, 121.774]}
          zoom={6}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={true}
          whenReady={(map) => {
            setTimeout(() => {
              map.target.invalidateSize();
            }, 100);
          }}
        >
          <ZoomToTarlac />
          <FlyToLocation position={markerPosition} />
          <LocationMarker
            position={markerPosition}
            setPosition={setMarkerPosition}
            onPredictingChange={onPredictingChange}
            onPredictionResult={onPredictionResult}
          />

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {tarlacGeoJson && (
            <GeoJSON data={tarlacGeoJson} style={geoJsonStyle} />
          )}
        </MapContainer>

        {loading && (
          <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-md shadow-md border border-gray-200 z-[1000]">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-900"></div>
              <span className="text-xs font-medium text-slate-700">
                Loading boundary data...
              </span>
            </div>
          </div>
        )}

        <style jsx global>{`
          .leaflet-popup-content-wrapper {
            border-radius: 12px !important;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
          }

          .leaflet-popup-content {
            margin: 0 !important;
          }
        `}</style>
      </>
    );
  },
);

LeafletMapContainer.displayName = "LeafletMapContainer";
