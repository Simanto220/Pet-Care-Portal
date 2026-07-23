import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Heart, Users, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QuickActions = () => {
  const navigate = useNavigate();
  const [nearbyHomes, setNearbyHomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const storedUser = localStorage.getItem("user");
  let userRole = "user";
  try {
    const parsed = storedUser ? JSON.parse(storedUser) : null;
    userRole = parsed?.role || "user";
  } catch (e) {}

  const upcomingEvents = [
    { title: "Pet Adoption Fair", date: "Dec 15", location: "Central Park" },
    { title: "Vet Health Checkup", date: "Dec 18", location: "PetCare Clinic" },
    {
      title: "Training Workshop",
      date: "Dec 22",
      location: "Community Center",
    },
  ];

  // Fetch nearby services with given coordinates
  const fetchNearbyServices = async (lat, lng) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/api/care/services/nearby?lat=${lat}&lng=${lng}&radius=50000`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      const mapped = (data.services || []).map((s) => ({
        name: s.name,
        distance: s.distance ? `${(s.distance / 1000).toFixed(1)} km` : "Nearby",
        rating: s.rating || 4.5,
        slots: s.slots || Math.floor(Math.random() * 5) + 1,
      }));
      setNearbyHomes(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    // Default: Dhaka coordinates (fallback)
    const DHAKA_LAT = 23.8103;
    const DHAKA_LNG = 90.4125;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchNearbyServices(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Location denied — use Dhaka as default silently
          fetchNearbyServices(DHAKA_LAT, DHAKA_LNG);
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    } else {
      fetchNearbyServices(DHAKA_LAT, DHAKA_LNG);
    }
  }, []);

  if (userRole === "vet") {
    return (
      <div className="flex flex-col gap-6">
        <Card className="shadow-md bg-white/80 backdrop-blur-sm border-purple-100">
          <div className="flex items-center border-b border-gray-200 px-4 py-3 bg-purple-50 rounded-t-xl">
            <Stethoscope size={20} className="text-purple-600 mr-2" />
            <h2 className="text-base font-bold text-gray-900">Doctor Quick Actions</h2>
          </div>
          <CardContent className="space-y-3 pt-4">
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Manage patient consultations, treatment records, and appointment schedules directly from your portal.
            </p>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 rounded-xl transition cursor-pointer shadow-sm hover:shadow"
              onClick={() => navigate("/vet")}
            >
              Open Vet Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Nearby Adoption Homes */}
      <Card className="shadow-md bg-white/80 backdrop-blur-sm">
        <div className="flex items-center border-b border-gray-200 px-4 py-2">
          <MapPin size={20} className="text-purple-600 mr-2" />
          <h2 className="text-base font-semibold">Nearby Care & Pet Centers</h2>
        </div>
        <CardContent className="space-y-3">
          {loading && (
            <p className="text-sm text-gray-500">Fetching nearby homes…</p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!loading && !error && nearbyHomes.length === 0 && (
            <p className="text-sm text-gray-500">No homes found nearby.</p>
          )}
          {nearbyHomes.map((home, index) => (
            <div
              key={index}
              className="rounded-lg p-3 space-y-2"
              style={{
                background: "linear-gradient(to right, #f5f3ff, #ffe4e6)",
              }}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm">{home.name}</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  ⭐ {home.rating}
                </span>
              </div>
              <p className="text-xs text-gray-600">{home.distance} away</p>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-600">
                  {home.slots} slots available
                </p>
                <Button 
                  variant="outline" 
                  className="h-7 px-3 text-xs cursor-pointer"
                  onClick={() => navigate("/care")}
                >
                  Book
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

     

    </div>
  );
};

export default QuickActions;
