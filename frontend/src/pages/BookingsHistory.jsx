import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Calendar,
  Heart,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  FileText,
  Trash2,
  Eye,
  X,
  Mail
} from "lucide-react";

export default function BookingsHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/api/bookings/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to load booking history");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel booking");
      toast.success("Booking cancelled successfully!");
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.warning("Please sign in to view your bookings");
      navigate("/signin");
      return;
    }
    fetchBookings();
  }, [token]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200";
      case "done":
        return "bg-green-50 text-green-700 border border-green-200";
      default:
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return <CheckCircle2 size={14} className="text-indigo-600" />;
      case "done":
        return <CheckCircle2 size={14} className="text-green-600" />;
      default:
        return <Clock size={14} className="text-yellow-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Title */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white p-8 sm:p-12 shadow-2xl mb-8">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-8 translate-x-8">
            <Calendar className="w-80 h-80" />
          </div>

          <div className="relative z-10 max-w-xl">
            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              📅 Booking Dashboard
            </span>
            <h1 className="text-4xl sm:text-5xl font-black mt-4 leading-tight">
              My Service Bookings
            </h1>
            <p className="text-lg text-indigo-100 mt-4 leading-relaxed">
              Track medical checkups, grooming services, pet training, and boarding appointments that you have scheduled.
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-purple-100 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Total Bookings</p>
              <h3 className="text-3xl font-black text-purple-700 mt-1">{bookings.length}</h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <FileText size={24} />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-yellow-100 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Pending Checkups</p>
              <h3 className="text-3xl font-black text-yellow-600 mt-1">
                {bookings.filter((b) => b.status !== "done").length}
              </h3>
            </div>
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-green-100 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Completed Services</p>
              <h3 className="text-3xl font-black text-green-600 mt-1">
                {bookings.filter((b) => b.status === "done").length}
              </h3>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-md rounded-2xl border">
            <RefreshCw className="animate-spin text-purple-600 mb-4" size={32} />
            <p className="text-gray-500 font-bold">Loading your booking history...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-2xl border border-dashed border-gray-300">
            <div className="text-6xl mb-4">🗓️</div>
            <h3 className="text-xl font-bold text-gray-700">No bookings found</h3>
            <p className="text-gray-500 mt-1 max-w-sm mx-auto mb-6">
              You haven't scheduled any professional care services yet. Check out the service directory to make your first booking!
            </p>
            <Link
              to="/care"
              className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold px-6 py-3 rounded-full hover:bg-purple-700 transition shadow-md"
            >
              Browse Care Centers <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
              >
                {/* Left/Middle: Care Center & Service Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-black text-gray-900">
                        {b.serviceId?.name || "Unknown Care Center"}
                      </h3>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                        {b.serviceId?.category}
                      </span>
                    </div>

                    {b.serviceId?.location?.address && (
                      <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" /> {b.serviceId.location.address}
                      </p>
                    )}
                  </div>

                  {/* Selected Options */}
                  {b.services && b.services.length > 0 && (
                    <div className="bg-purple-50/40 border border-purple-100 p-3 rounded-xl">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Briefcase size={12} className="text-purple-600" /> Booked Options
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {b.services.map((option, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-white border border-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-semibold"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pet Info & Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 border-t border-gray-50 pt-3">
                    <p className="flex items-center gap-1.5 font-semibold text-gray-700">
                      <Heart size={14} className="text-pink-500" /> Pet: {b.petName} ({b.petType})
                    </p>
                    {b.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone size={14} className="text-gray-400" /> Contact: {b.phone}
                      </p>
                    )}
                  </div>

                  {b.notes && (
                    <div className="text-xs text-gray-500 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-2">
                      <span className="font-bold not-italic block text-gray-400 mb-0.5 uppercase tracking-wider text-[10px]">Notes:</span>
                      "{b.notes}"
                    </div>
                  )}
                </div>

                {/* Right: Booking Status & Action */}
                <div className="min-w-[180px] w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end gap-3">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black capitalize ${getStatusColor(b.status)}`}>
                      {getStatusIcon(b.status)}
                      {b.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 text-right font-medium">
                    Requested on:<br />
                    <span className="font-bold text-gray-600">{new Date(b.createdAt).toLocaleDateString()}</span>
                  </p>

                  <div className="flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="inline-flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs px-3 py-1.5 rounded-xl font-bold transition cursor-pointer hover:shadow-sm"
                    >
                      <Eye size={13} /> View Details
                    </button>
                    {b.status !== "done" && (
                      <button
                        onClick={() => handleCancelBooking(b._id)}
                        className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs px-3 py-1.5 rounded-xl font-bold transition cursor-pointer hover:shadow-sm"
                      >
                        <Trash2 size={13} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 text-purple-700 p-2 rounded-xl">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900 leading-snug">
                    {selectedBooking.serviceId?.name || "Booking Details"}
                  </h3>
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                    {selectedBooking.serviceId?.category || "Service"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Status & Date Banner */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Booking Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black capitalize mt-1 ${getStatusColor(selectedBooking.status)}`}>
                    {getStatusIcon(selectedBooking.status)}
                    {selectedBooking.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Booking Date</p>
                  <p className="text-sm font-bold text-gray-700 mt-1">
                    {new Date(selectedBooking.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Duty Vet / Specialist Info */}
              {selectedBooking.serviceId?.vetName && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex items-center gap-3">
                  <div className="bg-purple-600 text-white p-2.5 rounded-xl shadow-md">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-purple-700 font-black uppercase tracking-wider">Designated Vet / Specialist</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedBooking.serviceId.vetName}</p>
                    <p className="text-xs text-gray-500">{selectedBooking.serviceId.vetSpecialization || "Specialist Consultant"}</p>
                  </div>
                </div>
              )}

              {/* Pet Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Heart size={14} className="text-pink-500" /> Pet & Owner Information
                </h4>
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Pet Name:</span>
                    <span className="font-bold text-purple-700">{selectedBooking.petName} ({selectedBooking.petType})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Owner Name:</span>
                    <span className="font-bold">{selectedBooking.name}</span>
                  </div>
                  {selectedBooking.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-medium">Email:</span>
                      <span className="font-medium">{selectedBooking.email}</span>
                    </div>
                  )}
                  {selectedBooking.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-medium">Contact Phone:</span>
                      <span className="font-bold">{selectedBooking.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={14} className="text-purple-600" /> Location / Care Address
                </h4>
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-gray-800">{selectedBooking.serviceId?.name}</p>
                  {selectedBooking.serviceId?.location?.address && (
                    <p className="text-xs text-gray-500">{selectedBooking.serviceId.location.address}</p>
                  )}
                  {(selectedBooking.address1 || selectedBooking.city) && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                      <p className="font-bold text-gray-500 uppercase text-[10px]">User Provided Address:</p>
                      <p>{selectedBooking.address1} {selectedBooking.address2}</p>
                      <p>{selectedBooking.city} {selectedBooking.state} {selectedBooking.zip}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booked Services Options */}
              {selectedBooking.services && selectedBooking.services.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Briefcase size={14} className="text-purple-600" /> Booked Options & Requirements
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.services.map((option, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-xl font-bold border border-purple-200">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Request Notes</h4>
                  <p className="text-xs italic bg-gray-50 p-3 rounded-2xl border border-gray-100 text-gray-600">
                    "{selectedBooking.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-3xl flex justify-between items-center">
              {selectedBooking.status !== "done" ? (
                <button
                  onClick={() => {
                    handleCancelBooking(selectedBooking._id);
                    setSelectedBooking(null);
                  }}
                  className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs px-4 py-2 rounded-xl font-bold transition cursor-pointer"
                >
                  <Trash2 size={14} /> Cancel Booking
                </button>
              ) : (
                <div></div>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-5 py-2 rounded-xl font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
