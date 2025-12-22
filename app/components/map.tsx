'use client';

import { useEffect, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import dynamic from 'next/dynamic';

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

// Dynamically import map hooks to avoid SSR issues
const ZoomToTarlac = dynamic(
  () => import('react-leaflet').then((mod) => {
    const { useMap } = mod;
    return {
      default: () => {
        const map = useMap();

        useEffect(() => {
          if (!map) return;

          // Wait for map to be ready
          setTimeout(() => {
            try {
              map.setView([12.8797, 121.7740], 6);

              setTimeout(() => {
                map.flyTo([15.4754, 120.5963], 10, {
                  duration: 2.5,
                  easeLinearity: 0.25
                });
              }, 800);
            } catch (error) {
              console.error('Map initialization error:', error);
            }
          }, 100);
        }, [map]);

        return null;
      }
    };
  }),
  { ssr: false }
);

const LocationMarker = dynamic(
  () => import('react-leaflet').then((mod) => {
    const { useMapEvents } = mod;
    return {
      default: ({ position, setPosition }: {
        position: [number, number] | null;
        setPosition: (pos: [number, number]) => void;
      }) => {
        useMapEvents({
          click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
          },
        });

        return position ? <Marker position={position} /> : null;
      }
    };
  }),
  { ssr: false }
);

const FlyToLocation = dynamic(
  () => import('react-leaflet').then((mod) => {
    const { useMap } = mod;
    return {
      default: ({ position }: { position: [number, number] | null }) => {
        const map = useMap();

        useEffect(() => {
          if (position && map) {
            map.flyTo(position, 13, {
              duration: 1.5
            });
          }
        }, [position, map]);

        return null;
      }
    };
  }),
  { ssr: false }
);

interface MapProps {
  onLocationChange?: (lat: number, lng: number) => void;
  externalLocation?: { lat: number; lng: number } | null;
}

export default function Map({ onLocationChange, externalLocation }: MapProps = {}) {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);

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
  const [tarlacGeoJson, setTarlacGeoJson] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    // Fix Leaflet default icon issue
    import('leaflet').then((L) => {
      // Dynamically add Leaflet CSS
      if (typeof document !== 'undefined') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });

    // Fetch Tarlac Province boundary from local GeoJSON file
    const fetchTarlacBoundary = async () => {
      try {
        const response = await fetch('/maps/tarlac-province.json');
        const geoJson: FeatureCollection = await response.json();
        setTarlacGeoJson(geoJson);
      } catch (error) {
        console.error('Error loading Tarlac boundary:', error);
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
          <span className="text-sm font-medium text-slate-600">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-white">
      <MapContainer
        center={[12.8797, 121.7740]}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={true}
      >
        <ZoomToTarlac />
        <FlyToLocation position={markerPosition} />
        <LocationMarker position={markerPosition} setPosition={handlePositionChange} />

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {tarlacGeoJson && (
          <GeoJSON
            data={tarlacGeoJson}
            style={{
              fillColor: '#3b82f6',
              fillOpacity: 0.3,
              color: '#1d4ed8',
              weight: 3,
            }}
          />
        )}
      </MapContainer>

      {loading && (
        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-md shadow-md border border-gray-200 z-[1000]">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-900"></div>
            <span className="text-xs font-medium text-slate-700">Loading boundary data...</span>
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