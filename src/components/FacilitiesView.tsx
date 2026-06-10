import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Navigation,
  Hospital,
  Pill,
  Activity,
  Loader2,
  LocateFixed,
} from "lucide-react";
import { Language, translations } from "../data/translations";
import { FacilityType } from "../data/facilities";
import { Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

interface Props {
  language: Language;
  t: (typeof translations)["en"];
  initialTypeFilter?: string;
}

export default function FacilitiesView({ language, t, initialTypeFilter }: Props) {
  const normalizedInitialType = initialTypeFilter 
    ? initialTypeFilter.charAt(0).toUpperCase() + initialTypeFilter.slice(1).toLowerCase() 
    : "Hospital";
    
  const validInitialType = ["Hospital", "Clinic", "Pharmacy"].includes(normalizedInitialType) 
    ? normalizedInitialType 
    : "Hospital";

  const [typeFilter, setTypeFilter] = useState<string>(validInitialType);

  useEffect(() => {
    if (initialTypeFilter) {
      const normalized = initialTypeFilter.charAt(0).toUpperCase() + initialTypeFilter.slice(1).toLowerCase();
      if (["Hospital", "Clinic", "Pharmacy"].includes(normalized)) {
        setTypeFilter(normalized);
      }
    }
  }, [initialTypeFilter]);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // GMP Places API
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const [places, setPlaces] = useState<google.maps.places.Place[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auto-locate user on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location: ", error);
          setIsLocating(false);
        }
      );
    }
  }, []);

  const handleLocateMe = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location: ", error);
        setIsLocating(false);
      },
    );
  };

  // Search Places when type or location changes
  useEffect(() => {
    if (!placesLib) return;

    const fetchPlaces = async () => {
      setIsLoading(true);
      try {
        const textQuery = `${typeFilter} in Philippines`;
        let locationBias = undefined;
        if (userLocation) {
           locationBias = {
             center: userLocation,
             radius: 10000 // 10km bias
           };
        }
        
        const result = await placesLib.Place.searchByText({
          textQuery: textQuery,
          fields: ['id', 'displayName', 'location', 'formattedAddress', 'types'],
          locationBias: locationBias,
          maxResultCount: 15,
        });

        if (result.places) {
          setPlaces(result.places);
        } else {
          setPlaces([]);
        }
      } catch (err) {
        console.error("Error fetching places:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, [placesLib, typeFilter, userLocation]);

  const types: FacilityType[] = [
    "Hospital",
    "Clinic",
    "Pharmacy",
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "Hospital":
        return <Hospital className="w-5 h-5" />;
      case "Pharmacy":
        return <Pill className="w-5 h-5" />;
      case "Clinic":
        return <Activity className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getTranslatedType = (type: string) => {
    switch (type) {
      case "Hospital":
        return t.hospital;
      case "Pharmacy":
        return t.pharmacy;
      case "Clinic":
        return t.clinic;
      default:
        return type;
    }
  };

  // Center map based on filtered locations or user location
  const mapCenter = useMemo(() => {
    if (userLocation) return userLocation; // Use user location if available
    if (places.length === 0) return { lat: 14.58, lng: 121.08 }; // default center Manila
    const sum = places.reduce(
      (acc, curr) => {
        if (!curr.location) return acc;
        return { lat: acc.lat + curr.location.lat(), lng: acc.lng + curr.location.lng() };
      },
      { lat: 0, lng: 0 },
    );
    return {
      lat: sum.lat / places.length,
      lng: sum.lng / places.length,
    };
  }, [places, userLocation]);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-lg shadow-slate-200/40 p-4 md:p-8 flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h3 className="font-display font-bold text-slate-900 text-2xl md:text-3xl tracking-tight">
          {t.facilitiesTitle}
        </h3>
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LocateFixed className="w-4 h-4" />
          )}
          {t.locateMe}
        </button>
      </div>

      {/* Map Section */}
      <div className="w-full h-80 md:h-[400px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-inner relative group isolate bg-slate-100 flex items-center justify-center">
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none z-10" />
        <Map
          defaultCenter={mapCenter}
          center={mapCenter}
          defaultZoom={12}
          mapId="FACILITIES_MAP_ID"
          internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
          style={{ width: "100%", height: "100%" }}
        >
          {userLocation && (
            <AdvancedMarker
              position={userLocation}
              title={t.myLocation}
              zIndex={100}
            >
              <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-xl relative">
                <div className="absolute -inset-3 bg-blue-500/30 rounded-full animate-ping"></div>
              </div>
            </AdvancedMarker>
          )}
          {places.map((place) => {
            if (!place.location) return null;
            return (
              <AdvancedMarker
                key={place.id}
                position={{ lat: place.location.lat(), lng: place.location.lng() }}
                title={place.displayName || ""}
              >
                <Pin
                  background={
                    typeFilter === "Hospital"
                      ? "#e11d48"
                      : typeFilter === "Clinic"
                        ? "#2563eb"
                        : "#059669"
                  }
                  borderColor="transparent"
                  glyphColor="#fff"
                  scale={1.2}
                />
              </AdvancedMarker>
            );
          })}
        </Map>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mt-2">
        <div className="relative flex-1">
          <select
            className="appearance-none w-full pl-5 pr-10 py-3.5 text-sm border-2 border-slate-100 focus:outline-none focus:border-blue-500 rounded-2xl bg-slate-50 font-semibold text-slate-800 transition-all cursor-pointer shadow-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {getTranslatedType(type as FacilityType)}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-slate-100">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4 drop-shadow-md" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse">
            {t.loading}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-2">
          {places.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 font-semibold bg-slate-50 rounded-2xl border border-slate-100">
              No facilities found nearby.
            </div>
          )}
          
          {places.map((place) => {
            const loc = place.location;
            let distance = undefined;
            if (userLocation && loc) {
               distance = calculateDistance(userLocation.lat, userLocation.lng, loc.lat(), loc.lng());
            }

            return (
              <div
                key={place.id}
                className="p-5 md:p-6 bg-slate-50/80 backdrop-blur-sm border-2 border-slate-100 rounded-3xl flex justify-between items-start hover:border-slate-300 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="space-y-1.5 pr-3 overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center text-white
                      ${typeFilter === "Hospital" ? "bg-rose-500 shadow-rose-500/20" : 
                        typeFilter === "Clinic" ? "bg-blue-500 shadow-blue-500/20" : 
                        "bg-emerald-500 shadow-emerald-500/20"} shadow-md`}
                    >
                      {getIcon(typeFilter)}
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {getTranslatedType(typeFilter)}
                    </p>
                  </div>
                  <h4 className="font-display font-bold text-slate-900 text-lg leading-tight line-clamp-2">
                    {place.displayName || "Unknown Facility"}
                  </h4>
                  <div className="flex flex-col gap-1 pb-3">
                    {distance !== undefined && (
                      <p className="text-xs font-black text-rose-600 bg-rose-50 inline-block px-2 py-1 rounded-lg w-max mt-1">
                        {distance.toFixed(1)} {t.km} • {Math.ceil(distance * 3)} {t.minDrive}
                      </p>
                    )}
                  </div>
                  <div className="flex items-start gap-2 text-slate-600 text-sm bg-white p-2.5 rounded-xl border border-slate-100">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                    <p className="leading-tight font-medium text-xs line-clamp-2">
                      {place.formattedAddress || "Address not available"}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${loc?.lat()},${loc?.lng()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-900 flex items-center justify-center flex-shrink-0 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-xl hover:shadow-slate-900/20 transition-all duration-300 group-hover:scale-105 active:scale-95 ml-2"
                  title="Get Directions"
                >
                  <Navigation className="w-6 h-6" />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

