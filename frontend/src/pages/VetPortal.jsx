import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Users,
  Calendar,
  FileText,
  Bell,
  PawPrint,
  ChevronRight,
  Search,
  Plus,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Heart,
  X,
  RefreshCw,
  Phone,
  Mail,
  User,
  PlusCircle,
  Trash2
} from "lucide-react";

export default function VetPortal() {
  const [activeTab, setActiveTab] = useState("Patients"); // "Patients" | "Appointments" | "Medical Records" | "Reminders"
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [selectedPetForRecord, setSelectedPetForRecord] = useState(null); // prepopulated when opening from patient card
  
  // New Record Form State
  const [recordForm, setRecordForm] = useState({
    petId: "",
    details: "",
    vaccinations: [] // array of { name: "", date: "", nextDue: "" }
  });
  
  // Temporary vaccine item state
  const [tempVaccine, setTempVaccine] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    nextDue: ""
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch all Vet Portal data
  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch patients
      const patRes = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/api/vet/patients", { headers });
      const patData = await patRes.json();
      setPatients(patData.pets || []);

      // Fetch appointments
      const appRes = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/api/vet/appointments", { headers });
      const appData = await appRes.json();
      setAppointments(appData.appointments || []);

      // Fetch medical records
      const recRes = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/api/vet/records", { headers });
      const recData = await recRes.json();
      setRecords(recData.records || []);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load veterinary portal data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.warning("Please sign in to access the Vet Portal");
      navigate("/signin");
      return;
    }
    fetchData();
  }, [token]);

  // Update appointment status
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/api/vet/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      toast.success(`Booking status updated to ${newStatus}!`);
      // Refresh appointments
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Add vaccine to record form
  const handleAddVaccine = () => {
    if (!tempVaccine.name) {
      toast.error("Please provide a vaccine name.");
      return;
    }
    setRecordForm((prev) => ({
      ...prev,
      vaccinations: [...prev.vaccinations, tempVaccine]
    }));
    setTempVaccine({
      name: "",
      date: new Date().toISOString().split("T")[0],
      nextDue: ""
    });
  };

  // Remove vaccine from record form
  const handleRemoveVaccine = (index) => {
    setRecordForm((prev) => ({
      ...prev,
      vaccinations: prev.vaccinations.filter((_, idx) => idx !== index)
    }));
  };

  // Submit medical record
  const handleSaveRecord = async (e) => {
    e.preventDefault();
    const finalPetId = selectedPetForRecord?._id || recordForm.petId;
    
    if (!finalPetId) {
      toast.error("Please select a pet.");
      return;
    }
    if (!recordForm.details.trim()) {
      toast.error("Please provide diagnosis/prescription details.");
      return;
    }

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/api/vet/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          petId: finalPetId,
          details: recordForm.details,
          vaccinationRecords: recordForm.vaccinations
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add record");

      toast.success("Medical record saved successfully!");
      setShowAddRecordModal(false);
      setSelectedPetForRecord(null);
      setRecordForm({ petId: "", details: "", vaccinations: [] });
      fetchData(); // reload
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getAge = (dob) => {
    if (!dob) return "Unknown";
    const birth = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      years--;
    }
    return `${years} yr${years !== 1 ? "s" : ""}`;
  };

  // Filtered patients
  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.breed?.toLowerCase().includes(search.toLowerCase())
  );

  // Dynamic Reminders collection from records
  const dynamicReminders = [];
  records.forEach((r) => {
    if (r.vaccinationRecords && r.vaccinationRecords.length > 0) {
      r.vaccinationRecords.forEach((v) => {
        if (v.nextDue) {
          const isUrgent = new Date(v.nextDue) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // within 7 days
          dynamicReminders.push({
            petName: r.petId?.name || "Unknown Pet",
            petSpecies: r.petId?.species || "Dog",
            petBreed: r.petId?.breed || "Breed",
            vaccineName: v.name,
            nextDue: v.nextDue,
            urgent: isUrgent,
            recordId: r._id
          });
        }
      });
    }
  });

  // Sort reminders by closest date
  dynamicReminders.sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));

  // Count active stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const stats = [
    { label: "Total Patients", value: patients.length, icon: <PawPrint size={22} className="text-purple-600" />, bg: "bg-purple-50 border-purple-100" },
    { label: "Vet Bookings", value: appointments.length, icon: <Calendar size={22} className="text-blue-600" />, bg: "bg-blue-50 border-blue-100" },
    { label: "Diagnosis Records", value: records.length, icon: <FileText size={22} className="text-teal-600" />, bg: "bg-teal-50 border-teal-100" },
    { label: "Booster Reminders", value: dynamicReminders.length, icon: <Bell size={22} className="text-orange-600" />, bg: "bg-orange-50 border-orange-100" }
  ];

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (user && user.role === "vet" && !user.isApprovedVet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-teal-50 flex items-center justify-center p-6 pt-28">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-purple-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500"></div>
          
          <div className="mx-auto w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 border border-purple-100 shadow-inner">
            <Stethoscope className="w-10 h-10 text-purple-600 animate-pulse" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3">Verification Pending</h2>
          
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Welcome, <strong className="text-gray-800">{user.name}</strong>! Your veterinarian account is currently under review by our administration team.
          </p>

          <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100/50 text-left text-xs mb-8 space-y-2.5">
            <p className="text-gray-500"><strong className="text-gray-700">License ID:</strong> {user.licenseNumber || "N/A"}</p>
            <p className="text-gray-500"><strong className="text-gray-700">Specialization:</strong> {user.specialization || "N/A"}</p>
            <p className="text-gray-500"><strong className="text-gray-700">Clinic Name:</strong> {user.clinicName || "N/A"}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition shadow-md cursor-pointer"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/signin");
              }}
              className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-100 font-bold py-3 px-6 rounded-xl text-sm transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-teal-50 py-10 px-4 sm:px-6 lg:px-8 pt-28">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white p-8 sm:p-12 shadow-2xl mb-8">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-8 translate-x-8">
            <Stethoscope className="w-80 h-80" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                👨‍⚕️ Veterinary Portal
              </span>
              <h1 className="text-4xl sm:text-5xl font-black mt-4 leading-tight">
                Clinician Workspace
              </h1>
              <p className="text-lg text-blue-100 mt-2 leading-relaxed">
                Add medical records, track scheduled appointments, and manage booster schedules for all registered pets.
              </p>
            </div>
            
            <button
              onClick={() => {
                setSelectedPetForRecord(null);
                setRecordForm({ petId: "", details: "", vaccinations: [] });
                setShowAddRecordModal(true);
              }}
              className="flex items-center gap-2 bg-white text-blue-700 px-6 py-3.5 rounded-2xl font-black text-sm hover:scale-105 transition shadow-lg hover:bg-blue-50 cursor-pointer"
            >
              <PlusCircle size={18} /> New Medical Record
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className={`bg-white/80 backdrop-blur-md p-5 rounded-2xl border ${stat.bg} shadow-lg flex items-center gap-4`}>
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">{stat.icon}</div>
              <div>
                <h3 className="text-3xl font-black text-gray-800">{stat.value}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl shadow-md w-fit gap-2">
          {["Patients", "Appointments", "Medical Records", "Reminders"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 px-5 rounded-xl font-bold transition-all text-sm ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-3xl border border-purple-50 shadow-xl p-6 sm:p-8">
          
          {/* Patients Tab */}
          {activeTab === "Patients" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Users className="text-blue-500" /> Patient Directory
                </h2>
                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Search by pet name, breed, owner..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="animate-spin text-blue-600 mx-auto mb-3" size={24} />
                  <p className="text-gray-500 font-bold">Syncing patient profiles...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No patient files match your search filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPatients.map((p) => (
                    <div
                      key={p._id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={
                            p.profilePhoto
                              ? `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}${p.profilePhoto}`
                              : "https://ui-avatars.com/api/?name=Pet&background=random"
                          }
                          alt={p.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-purple-50"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-lg font-black text-gray-900">{p.name}</h4>
                            <span className="text-[10px] bg-purple-100 text-purple-700 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {p.species}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-bold uppercase mt-1">{p.breed} · {p.color}</p>
                          <p className="text-xs text-gray-400 mt-2 font-medium">🎂 Age: {getAge(p.dateOfBirth)}</p>
                          
                          <div className="mt-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Pet Owner</p>
                            <p className="text-sm font-bold text-gray-700 mt-0.5">{p.ownerId?.name || "Unknown Owner"}</p>
                            {p.ownerId?.phone && (
                              <p className="text-xs text-gray-500 mt-0.5">📞 {p.ownerId.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPetForRecord(p);
                            setRecordForm({ petId: p._id, details: "", vaccinations: [] });
                            setShowAddRecordModal(true);
                          }}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs py-2.5 rounded-xl font-black transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus size={14} /> Add Diagnosis
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === "Appointments" && (
            <div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-6 pb-6 border-b border-gray-100">
                <Calendar className="text-blue-500" /> Veterinary Bookings
              </h2>

              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="animate-spin text-blue-600 mx-auto" size={24} />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-16 text-gray-500 border border-dashed rounded-2xl border-gray-300">
                  <p className="text-lg font-bold">No veterinary bookings recorded.</p>
                  <p className="text-sm text-gray-400 mt-1">Bookings scheduled at vet clinics will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((a) => (
                    <div
                      key={a._id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-lg font-black text-gray-900">{a.petName} ({a.petType})</h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              a.status === "confirmed"
                                ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                                : a.status === "done"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-bold uppercase flex items-center gap-1">
                          <User size={13} className="text-gray-400" /> Owner: {a.name}
                        </p>
                        {a.phone && (
                          <p className="text-xs text-gray-500">📞 Contact: {a.phone}</p>
                        )}
                        {a.services && a.services.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {a.services.map((item, i) => (
                              <span key={i} className="bg-purple-50 text-purple-700 border border-purple-100 text-[10px] px-2 py-0.5 rounded-md font-bold">
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                        {a.notes && (
                          <p className="text-xs italic text-gray-400 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            Notes: "{a.notes}"
                          </p>
                        )}
                      </div>

                      {/* Right Panel: Actions */}
                      <div className="flex flex-col sm:items-end justify-center gap-2.5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                        <p className="text-xs text-gray-400 text-right">
                          Booked on: <span className="font-bold text-gray-700">{new Date(a.createdAt).toLocaleDateString()}</span>
                        </p>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          {a.status === "pending" && (
                            <button
                              onClick={() => handleUpdateStatus(a._id, "confirmed")}
                              className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-xl font-bold transition cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {a.status !== "done" && (
                            <button
                              onClick={() => handleUpdateStatus(a._id, "done")}
                              className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-xl font-bold transition cursor-pointer"
                            >
                              Mark Done
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Medical Records Tab */}
          {activeTab === "Medical Records" && (
            <div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-6 pb-6 border-b border-gray-100">
                <FileText className="text-blue-500" /> Diagnosis History
              </h2>

              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="animate-spin text-blue-600 mx-auto" size={24} />
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No medical diagnoses recorded yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {records.map((r) => (
                    <div
                      key={r._id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              r.petId?.profilePhoto
                                ? `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}${r.petId.profilePhoto}`
                                : "https://ui-avatars.com/api/?name=Pet&background=random"
                            }
                            alt={r.petId?.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div>
                            <h4 className="font-black text-gray-900 text-base">{r.petId?.name}</h4>
                            <p className="text-xs text-gray-500 capitalize">{r.petId?.species} · {r.petId?.breed}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                          📅 {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-3">
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Clinical Findings & Prescription</p>
                        <p className="text-sm text-gray-700 leading-relaxed white-space-pre-wrap">{r.details}</p>
                      </div>

                      {/* Vaccines in this diagnosis */}
                      {r.vaccinationRecords && r.vaccinationRecords.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Vaccines Administered</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {r.vaccinationRecords.map((v, i) => (
                              <div key={i} className="flex items-center justify-between text-xs bg-teal-50/50 border border-teal-100 text-teal-950 p-2 rounded-xl">
                                <span className="font-bold flex items-center gap-1.5">
                                  <CheckCircle size={13} className="text-teal-600" /> {v.name}
                                </span>
                                {v.nextDue && (
                                  <span className="text-[10px] text-gray-500 font-medium">
                                    Next Due: {new Date(v.nextDue).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-gray-400 text-right mt-3 font-semibold">
                        Registered by Vet: <span className="text-gray-600">{r.vetId?.name || "Unknown Vet"}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === "Reminders" && (
            <div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-6 pb-6 border-b border-gray-100">
                <Bell className="text-orange-500" /> Vaccination Booster Schedules
              </h2>

              {dynamicReminders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No upcoming vaccination booster schedules found in records.
                </div>
              ) : (
                <div className="space-y-3">
                  {dynamicReminders.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-orange-50/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {r.urgent ? (
                          <div className="bg-red-50 p-2.5 rounded-xl border border-red-200 text-red-600">
                            <AlertCircle size={20} />
                          </div>
                        ) : (
                          <div className="bg-green-50 p-2.5 rounded-xl border border-green-200 text-green-600">
                            <CheckCircle size={20} />
                          </div>
                        )}
                        <div>
                          <h4 className="font-black text-gray-800 text-base">
                            {r.petName}{" "}
                            <span className="text-xs text-gray-400 font-normal capitalize">
                              ({r.petBreed})
                            </span>
                          </h4>
                          <p className="text-sm text-gray-500">
                            Booster Vaccine: <span className="font-bold text-gray-700">{r.vaccineName}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5">
                        {r.urgent && (
                          <span className="text-[10px] bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full font-black uppercase">
                            Urgent
                          </span>
                        )}
                        <p className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                          <Clock size={13} className="text-gray-400" /> Due: {new Date(r.nextDue).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Add Record Modal */}
      {showAddRecordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <Stethoscope className="text-blue-600" /> New Medical Diagnosis File
              </h3>
              <button
                onClick={() => {
                  setShowAddRecordModal(false);
                  setSelectedPetForRecord(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveRecord} className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Pet Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Patient Pet *</label>
                {selectedPetForRecord ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          selectedPetForRecord.profilePhoto
                            ? `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}${selectedPetForRecord.profilePhoto}`
                            : "https://ui-avatars.com/api/?name=Pet&background=random"
                        }
                        alt={selectedPetForRecord.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-blue-900">{selectedPetForRecord.name}</p>
                        <p className="text-xs text-blue-600 capitalize">{selectedPetForRecord.species} · {selectedPetForRecord.breed}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPetForRecord(null)}
                      className="text-xs text-red-500 hover:underline font-bold"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <select
                    required
                    value={recordForm.petId}
                    onChange={(e) => setRecordForm({ ...recordForm, petId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium cursor-pointer"
                  >
                    <option value="">-- Select Patient Pet --</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.species} - {p.breed}) - Owner: {p.ownerId?.name || "Unknown"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Diagnosis Details */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Diagnosis & Prescription *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Record symptoms, diagnosis findings, and prescribe medicine dosages..."
                  value={recordForm.details}
                  onChange={(e) => setRecordForm({ ...recordForm, details: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 leading-relaxed"
                ></textarea>
              </div>

              {/* Vaccination Management */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-4">
                <div>
                  <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <CheckCircle size={15} className="text-teal-600" /> Administer Vaccines
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Optional - schedule upcoming booster reminders</p>
                </div>

                {/* Vaccines List */}
                {recordForm.vaccinations.length > 0 && (
                  <div className="space-y-2">
                    {recordForm.vaccinations.map((v, index) => (
                      <div key={index} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{v.name}</p>
                          <p className="text-xs text-gray-400">
                            Given: {v.date} {v.nextDue && `| Next Booster due: ${v.nextDue}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVaccine(index)}
                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Vaccine Name</label>
                    <input
                      placeholder="e.g. DHPP, Rabies"
                      value={tempVaccine.name}
                      onChange={(e) => setTempVaccine({ ...tempVaccine, name: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Date Administered</label>
                    <input
                      type="date"
                      value={tempVaccine.date}
                      onChange={(e) => setTempVaccine({ ...tempVaccine, date: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Booster Due Date</label>
                    <input
                      type="date"
                      value={tempVaccine.nextDue}
                      onChange={(e) => setTempVaccine({ ...tempVaccine, nextDue: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddVaccine}
                  className="w-full bg-white hover:bg-teal-50/50 text-teal-600 hover:text-teal-700 border border-teal-200 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle size={14} /> Add Vaccine Entry
                </button>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRecordModal(false);
                    setSelectedPetForRecord(null);
                  }}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 py-3 rounded-xl font-bold text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white py-3 rounded-xl font-black text-sm transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Save Diagnostics
                </button>
              </div>
              
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
