"use client";

import { Waves, MapPin, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { predictByLocation } from "@/lib/actions/liquefaction";

interface HeaderProps {
  onLocationSubmit?: (lat: number, lng: number) => void;
  onPredictionResult?: (data: any) => void; // ← ADD THIS PROP
}

const Header = ({ onLocationSubmit, onPredictionResult }: HeaderProps) => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const searchInputRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (searchInputRef.current && showResults) {
      const rect = searchInputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [showResults, searchQuery]);

  // ============================================================================
  // NEW: Prediction function
  // ============================================================================
  const handlePrediction = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const result = await predictByLocation(lat, lng);

      if (result.success && result.data) {
        // Pass prediction result to parent component
        if (onPredictionResult) {
          onPredictionResult(result.data);
        }

        // Also notify parent about location change
        if (onLocationSubmit) {
          await onLocationSubmit(lat, lng);
        }
      } else {
        alert(`Prediction failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Failed to get prediction");
    } finally {
      setIsLoading(false);
    }
  };
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      await handlePrediction(lat, lng); // ← CHANGED: Now calls prediction
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Fill the lat/long fields with 4 decimal places
          setLatitude(lat.toFixed(4));
          setLongitude(lng.toFixed(4));

          // Get prediction
          await handlePrediction(lat, lng); // ← CHANGED: Now calls prediction
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to get your location. Please check your browser permissions.",
          );
          setIsLoading(false);
        },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSearch = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching location:", error);
      setSearchResults([]);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleSelectResult = async (result: any) => {
    // Hide dropdown immediately
    setShowResults(false);
    setSearchResults([]);
    setSearchQuery("");

    // Fill lat/long inputs with 4 decimal places
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setLatitude(lat.toFixed(4));
    setLongitude(lng.toFixed(4));

    // Get prediction
    await handlePrediction(lat, lng); // ← CHANGED: Now calls prediction
  };

  return (
    <header className="bg-white border-b border-gray-200 relative z-[100]">
      <div className="px-4 md:px-8 py-3 md:py-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-0">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="bg-slate-900 p-2 md:p-2.5 rounded-md">
              <Waves className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-sm md:text-lg font-semibold text-slate-900 tracking-tight">
                Liquefaction Assessment Platform
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                Geotechnical Risk Analysis System
              </p>
            </div>
          </div>

          {/* Location Input */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative" ref={searchInputRef}>
              <div className="relative">
                <Search
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  disabled={isLoading}
                  className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Search Results Dropdown - Using Portal */}
              {mounted &&
                showResults &&
                searchResults.length > 0 &&
                createPortal(
                  <div
                    style={{
                      position: "fixed",
                      top: `${dropdownPosition.top + 4}px`,
                      left: `${dropdownPosition.left}px`,
                      minWidth: "256px",
                      width: "320px",
                      zIndex: 99999,
                    }}
                    className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                  >
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectResult(result)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-100 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="text-xs font-medium text-slate-900 break-words">
                          {result.display_name}
                        </div>
                      </button>
                    ))}
                  </div>,
                  document.body,
                )}
            </div>

            <div className="hidden lg:block w-px h-8 bg-gray-300"></div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 flex-1 sm:flex-initial"
            >
              <input
                type="text"
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                disabled={isLoading}
                className="w-20 sm:w-24 md:w-28 px-2 md:px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                disabled={isLoading}
                className="w-20 sm:w-24 md:w-28 px-2 md:px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-2 md:px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md hover:bg-slate-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : "Go"}
              </button>
            </form>

            <div className="hidden lg:block w-px h-8 bg-gray-300"></div>

            <button
              onClick={handleUseMyLocation}
              disabled={isLoading}
              className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <MapPin size={14} />
              <span className="hidden sm:inline">
                {isLoading ? "Loading..." : "Use My Location"}
              </span>
              <span className="sm:hidden">
                {isLoading ? "Loading..." : "My Location"}
              </span>
            </button>

            <div className="hidden lg:block w-px h-8 bg-gray-300"></div>

            {/* Status Indicator */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-xs font-medium text-slate-600">
                System Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
