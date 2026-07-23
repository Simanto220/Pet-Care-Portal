import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Heart,
  ChevronLeft,
  Calendar,
  CheckCircle,
  HelpCircle,
  Briefcase
} from "lucide-react";

// Booking Form Component
function BookingForm({ serviceId, servicesList }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  let currentUser = null;
  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
  }

  const [form, setForm] = useState({
    services: [],
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    petName: "",
    petType: "Dog",
    address1: currentUser?.location || "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleServiceToggle(service) {
    setForm((prev) => {
      const alreadySelected = prev.services.includes(service);
      return {
        ...prev,
        services: alreadySelected
          ? prev.services.filter((s) => s !== service)
          : [...prev.services, service],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      toast.warning("Please sign in to book a service.");
      navigate("/signin");
      return;
    }

    if (form.services.length === 0) {
      toast.error("Please select at least one service option.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:7000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: serviceId,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to book");

      toast.success("🎉 Booking request created successfully!");
      navigate("/bookings"); // redirect to bookings history page
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {/* Services Checklist */}
      <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-6">
        <p className="font-black text-gray-900 text-lg flex items-center gap-2 mb-3">
          <Briefcase size={18} className="text-purple-600" /> Select Care Options *
        </p>
        <p className="text-xs text-gray-400 font-bold mb-4 uppercase tracking-wider">Choose all that apply</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {servicesList.map((s) => (
            <label
              key={s}
              className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer text-sm font-semibold transition-all ${
                form.services.includes(s)
                  ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-100"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-purple-50/50"
              }`}
            >
              <input
                type="checkbox"
                checked={form.services.includes(s)}
                onChange={() => handleServiceToggle(s)}
                className="hidden"
              />
              <span className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                form.services.includes(s) ? "bg-white border-white text-purple-600" : "border-gray-300"
              }`}>
                {form.services.includes(s) && <span className="font-black text-[10px]">✓</span>}
              </span>
              {s}
            </label>
          ))}
        </div>
      </div>

      {/* Customer Info */}
      <div className="space-y-4">
        <p className="font-black text-gray-900 text-lg flex items-center gap-2">
          <User size={18} className="text-purple-600" /> Personal Contact Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <input
              name="name"
              placeholder="Your Name *"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
          <div className="relative">
            <input
              name="email"
              type="email"
              placeholder="Email Address *"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
          <div className="relative">
            <input
              name="phone"
              type="tel"
              placeholder="Phone Number *"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Pet Info */}
      <div className="space-y-4">
        <p className="font-black text-gray-900 text-lg flex items-center gap-2">
          <Heart size={18} className="text-purple-600" /> Pet Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="petName"
            placeholder="Pet Name(s) *"
            value={form.petName}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <select
            name="petType"
            value={form.petType}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700 font-medium"
          >
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Bird">Bird</option>
            <option value="Rabbit">Rabbit</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <p className="font-black text-gray-900 text-lg flex items-center gap-2">
          <MapPin size={18} className="text-purple-600" /> Care Address Details
        </p>
        <div className="space-y-3">
          <input
            name="address1"
            placeholder="Street Address"
            value={form.address1}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <input
            name="address2"
            placeholder="Address Line 2 (Apartment, suite, unit, etc.)"
            value={form.address2}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
            <input
              name="state"
              placeholder="State / Province"
              value={form.state}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
            <input
              name="zip"
              placeholder="ZIP / Postal Code"
              value={form.zip}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <label className="font-black text-gray-900 text-lg flex items-center gap-2">
          <FileText size={18} className="text-purple-600" /> Care Request Notes
        </label>
        <textarea
          name="notes"
          rows="4"
          placeholder="Describe your pet's specific requirements, behavioral notes, and when the care services are needed..."
          value={form.notes}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white leading-relaxed"
        ></textarea>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-4 rounded-xl font-black text-base shadow-lg transition duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw className="animate-spin" size={18} /> Booking...
          </>
        ) : (
          <>Submit Booking Request</>
        )}
      </button>
    </form>
  );
}

// Service Details Page Component
export default function ServiceDetails() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:7000/api/care/services/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setService(data.service || data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <HelpCircle size={48} className="text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-700">Service not found</h3>
        <p className="text-gray-500 mt-1 max-w-sm">The care service directory you're trying to access might have been removed.</p>
        <Link to="/care" className="mt-6 text-purple-600 hover:underline font-bold">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-purple-50 shadow-2xl p-6 sm:p-10">
        {/* Navigation */}
        <Link
          to="/care"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-600 hover:text-purple-800 transition mb-6"
        >
          <ChevronLeft size={16} /> Back to Directory
        </Link>

        {/* Clinic Header */}
        <div className="border-b border-gray-100 pb-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">
              {service.category}
            </span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">{service.name}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm text-gray-600">
            {service.location?.address && (
              <p className="flex items-center gap-1.5">
                <MapPin size={14} className="text-purple-600" /> {service.location.address}
              </p>
            )}
            {service.phone && (
              <p className="flex items-center gap-1.5 font-semibold">
                <Phone size={14} className="text-purple-600" /> {service.phone}
              </p>
            )}
          </div>

          {service.vetName && (
            <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
              <div className="bg-purple-600 text-white p-2.5 rounded-xl shadow-md">
                <User size={20} />
              </div>
              <div>
                <p className="text-xs text-purple-700 font-black uppercase tracking-wider">Designated Duty Vet / Specialist</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">{service.vetName}</p>
                <p className="text-xs text-gray-500 font-medium">{service.vetSpecialization || "Specialist Consultant"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Booking Form */}
        <BookingForm
          serviceId={service._id}
          servicesList={service.servicesOffered || []}
        />
      </div>
    </div>
  );
}
