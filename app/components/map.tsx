"use client";

import { useEffect, useState } from "react";
import type { FeatureCollection } from "geojson";
import dynamic from "next/dynamic";
import { predictByLocation } from "@/lib/actions/liquefaction";

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);

const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false },
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

const ZoomToTarlac = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMap } = mod;
      function ZoomToTarlacComponent() {
        const map = useMap();
        useEffect(() => {
          if (!map) return;
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
      }
      return { default: ZoomToTarlacComponent };
    }),
  { ssr: false },
);

const FlyToLocation = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMap } = mod;
      function FlyToLocationComponent({
        position,
      }: {
        position: [number, number] | null;
      }) {
        const map = useMap();
        useEffect(() => {
          if (position && map) {
            map.flyTo(position, 13, {
              duration: 1.5,
            });
          }
        }, [position, map]);
        return null;
      }
      return { default: FlyToLocationComponent };
    }),
  { ssr: false },
);

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

  // Create LocationMarker component with prediction
  const LocationMarker = dynamic(
    () =>
      import("react-leaflet").then((mod) => {
        const { useMapEvents } = mod;
        function LocationMarkerComponent({
          position,
          setPosition,
        }: {
          position: [number, number] | null;
          setPosition: (pos: [number, number]) => void;
        }) {
          useMapEvents({
            async click(e) {
              const pos: [number, number] = [e.latlng.lat, e.latlng.lng];
              setPosition(pos);

              // Make prediction when map is clicked
              try {
                onPredictingChange?.(true);
                const result = await predictByLocation(
                  e.latlng.lat,
                  e.latlng.lng,
                );
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
        }
        return { default: LocationMarkerComponent };
      }),
    { ssr: false },
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

  useEffect(() => {
    // Fix Leaflet default icon issue
    import("leaflet").then((L) => {
      // Dynamically add Leaflet CSS
      if (typeof document !== "undefined") {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });

    // Fetch Tarlac Province boundary from local GeoJSON file
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

    setMounted(true);
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
      <MapContainer
        center={[12.8797, 121.774]}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={true}
      >
        <ZoomToTarlac />
        <FlyToLocation position={markerPosition} />
        <LocationMarker
          position={markerPosition}
          setPosition={handlePositionChange}
        />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {tarlacGeoJson && (
          <GeoJSON
            data={tarlacGeoJson}
            style={{
              fillColor: "#3b82f6",
              fillOpacity: 0.3,
              color: "#1d4ed8",
              weight: 3,
            }}
          />
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
    </div>
  );
}
