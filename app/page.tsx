'use client';

import { useState } from "react";
import Map from "./components/map";
import Header from "./components/header";
import LiquefactionSidebar from "./components/sidebar";
import Comparison from "./components/comparison";

export default function Page() {
  const [location, setLocation] = useState("Tarlac City");
  const [latitude, setLatitude] = useState(15.4754);
  const [longitude, setLongitude] = useState(120.5963);
  const [externalLocation, setExternalLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const handleLocationChange = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);

    // Reverse geocoding using Nominatim (OpenStreetMap)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();

      // Extract city/municipality name from the response
      const address = data.address || {};
      const locationName =
        address.city ||
        address.municipality ||
        address.town ||
        address.village ||
        address.county ||
        address.state ||
        'Unknown Location';

      setLocation(locationName);
    } catch (error) {
      console.error('Error fetching location:', error);
      setLocation(`Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);
    }
  };

  const handleManualLocationSubmit = (lat: number, lng: number) => {
    setExternalLocation({ lat, lng });
    setLatitude(lat);
    setLongitude(lng);

    // Reverse geocoding in background (non-blocking)
    handleLocationChange(lat, lng);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header onLocationSubmit={handleManualLocationSubmit} />
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {showComparison ? (
          <Comparison onBack={() => setShowComparison(false)} />
        ) : (
          <LiquefactionSidebar
            location={location}
            latitude={latitude}
            longitude={longitude}
            onToggleComparison={() => setShowComparison(true)}
          />
        )}
        <div className="flex-1 h-1/2 md:h-full">
          <Map
            onLocationChange={handleLocationChange}
            externalLocation={externalLocation}
          />
        </div>
      </div>
    </div>
  );
}
