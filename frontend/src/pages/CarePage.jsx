import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  RefreshCw,
  Phone,
  AlertCircle,
  Search,
  Compass,
  ArrowRight,
  Shield,
  Clock,
  Briefcase
} from "lucide-react";

export default function NearbyServices() {
  const [status, setStatus] = useState("idle"); // idle | getting | loading | ready | error
  const [error, setError] = useState("");
  const [services, setServices] = useState([]);
  const [radius, setRadius] = useState(5000); // meters
  const navigate = useNavigate();

  useEffect(() => {
    getNearby();
  }, []);

  function getNearby(customCoords) {
    setStatus("getting");
    setError("");
    const onSuccess = async (pos) => {
      const lat = customCoords?.lat ?? pos.coords.latitude;
      const lng = customCoords?.lng ?? pos.coords.longitude;

      try {
        setStatus("loading");
        const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000");
        const url = `${apiBase}/api/care/services/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch services");
        setServices(data.services);
        setStatus("ready");
      } catch (e) {
        setError(e.message);
        setStatus("error");
      }
    };

    const onError = (err) => {
      setError(err.message || "Could not retrieve your location. Please check browser permissions.");
      setStatus("error");
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    } else {
      setError("Geolocation is not supported by this browser.");
      setStatus("error");
    }
  }

  const getCategoryEmoji = (category) => {
    const emojis = {
      consultation: "🩺",
      grooming: "✂️",
      training: "🎓",
      boarding: "🏠",
      emergency: "🚨",
      vaccination: "💉",
      dental: "🦷",
      nutrition: "🥗",
      clinic: "🏥",
      hospital: "🏥"
    };
    return emojis[category?.toLowerCase()] || "🐾";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Header */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 sm:p-12 shadow-2xl mb-8">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-8 translate-x-8">
            <Compass className="w-80 h-80" />
          </div>

          <div className="relative z-10 max-w-xl">
            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              🏥 Professional Care & Help
            </span>
            <h1 className="text-4xl sm:text-5xl font-black mt-4 leading-tight">
              Nearby Pet Care Services
            </h1>
            <p className="text-lg text-indigo-100 mt-4 leading-relaxed">
              Find professional clinics, grooming salons, trainers, and emergency care near you based on your live GPS location.
            </p>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-purple-100 shadow-lg mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <label className="flex items-center gap-2 text-sm text-gray-700 font-bold w-full">
              Radius (meters):
              <input
                type="number"
                min={500}
                step={500}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="border border-gray-200 rounded-xl px-4 py-2 w-32 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white text-gray-800 font-bold"
              />
            </label>
          </div>

          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => getNearby()}
              disabled={status === "getting" || status === "loading"}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-md hover:shadow-lg disabled:opacity-50 w-full sm:w-auto cursor-pointer"
            >
              <RefreshCw size={16} className={status === "getting" || status === "loading" ? "animate-spin" : ""} />
              Scan Location
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {status === "getting" && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-2xl mb-6 shadow-sm">
            <RefreshCw className="animate-spin text-blue-600" size={20} />
            <p className="font-bold">Requesting browser location access…</p>
          </div>
        )}

        {status === "loading" && (
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 text-purple-800 p-4 rounded-2xl mb-6 shadow-sm">
            <RefreshCw className="animate-spin text-purple-600" size={20} />
            <p className="font-bold">Searching care centers within {radius}m…</p>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 text-red-800 border border-red-200 p-6 rounded-2xl mb-8 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle size={22} className="text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-black text-lg">Location Search Failed</p>
                <p className="text-sm mt-1 text-red-700 leading-relaxed">{error}</p>
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-gray-500 font-medium">Or use fallback:</span>
                  <button
                    className="bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm transition"
                    onClick={() => getNearby({ lat: 23.777176, lng: 90.399452 })}
                  >
                    Dhaka Center
                  </button>
                  <button
                    className="bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm transition"
                    onClick={() => getNearby({ lat: 22.3569, lng: 91.7832 })}
                  >
                    Chittagong
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {status === "ready" && services.length === 0 && (
          <div className="text-center py-16 bg-white/60 backdrop-blur-md rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg font-bold">No pet care services found within {radius} meters.</p>
            <p className="text-sm text-gray-400 mt-1">Try expanding the search radius or choosing a different center.</p>
          </div>
        )}

        <div className="grid gap-6">
          {services.map((s) => (
            <div
              key={s._id}
              onClick={() => navigate(`services/${s._id}`)}
              className="group bg-white border border-purple-50 hover:border-purple-200 shadow-md hover:shadow-2xl rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex items-start gap-4">
                <span className="text-5xl bg-purple-50 p-3 rounded-2xl group-hover:bg-purple-100 transition shadow-inner">
                  {getCategoryEmoji(s.category)}
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-purple-600 transition">
                      {s.name}
                    </h3>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                      {s.category}
                    </span>
                  </div>
                  
                  {s.location?.address && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" /> {s.location.address}
                    </p>
                  )}

                  {s.vetName && (
                    <div className="mt-2">
                      <span className="text-xs text-purple-700 bg-purple-50 border border-purple-100 font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 shadow-sm">
                        🩺 <span className="font-black">Duty Vet:</span> {s.vetName} ({s.vetSpecialization || "Specialist"})
                      </span>
                    </div>
                  )}

                  {s.phone && (
                    <p className="text-sm text-gray-700 mt-2 flex items-center gap-1.5 font-medium">
                      <Phone size={14} className="text-purple-600" /> {s.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Distance Badge & Link */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                {s.distance && (
                  <span className="text-sm bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full font-black">
                    {(s.distance / 1000).toFixed(1)} km away
                  </span>
                )}
                <span className="text-purple-600 hover:text-purple-800 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform duration-300">
                  Book Care <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
