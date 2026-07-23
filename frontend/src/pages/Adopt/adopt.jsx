import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Heart,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  Info,
  User,
  Check,
  X,
  PlusCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  PawPrint
} from "lucide-react";

export default function AdoptHub({ defaultTab = "browse" }) {
  const [activeTab, setActiveTab] = useState(defaultTab); // "browse" | "requests"

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  const [pets, setPets] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [submittingRequest, setSubmittingRequest] = useState(null); // id of pet being requested
  const [cancellingRequest, setCancellingRequest] = useState(null); // id of request being cancelled

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("All");
  const [selectedType, setSelectedType] = useState("All"); // "All" | "permanent" | "temporary"
  const [selectedPet, setSelectedPet] = useState(null); // For pet detail modal

  // Carousel index for detail modal
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  let currentUser = null;
  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
  }
  const currentUserId = currentUser?._id || localStorage.getItem("userId");

  // Fetch available pets
  const fetchPets = async () => {
    try {
      setLoadingPets(true);
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/adoption/pets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch available pets");
      const data = await res.json();
      setPets(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pets: " + err.message);
    } finally {
      setLoadingPets(false);
    }
  };

  // Fetch my requests
  const fetchMyRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/adoption/myRequests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      setMyRequests(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your requests: " + err.message);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.warning("Please sign in to access the Adoption Hub");
      navigate("/signin");
      return;
    }
    fetchPets();
    fetchMyRequests();
  }, [token]);

  // Request adoption
  const handleRequestAdoption = async (e, adoptionId) => {
    e.stopPropagation();
    if (!adoptionId) {
      toast.error("Cannot request adoption: Missing adoption information.");
      return;
    }

    try {
      setSubmittingRequest(adoptionId);
      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/adoption/${adoptionId}/request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Adoption request sent successfully!");
        // Refresh requests and pets list
        fetchPets();
        fetchMyRequests();
        if (selectedPet) setSelectedPet(null);
      } else {
        toast.error(data.message || "Failed to send request.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmittingRequest(null);
    }
  };

  // Cancel adoption request
  const handleCancelRequest = async (e, requestId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to withdraw your adoption request?")) return;

    try {
      setCancellingRequest(requestId);
      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/adoption/request/${requestId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Adoption request withdrawn successfully.");
        fetchMyRequests();
        fetchPets();
      } else {
        toast.error(data.message || "Failed to withdraw request.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setCancellingRequest(null);
    }
  };

  // Check if current user already requested a pet
  const isAlreadyRequested = (petAdoptionId) => {
    return myRequests.some((req) => req.pet?._id === petAdoptionId || req.adoptionId === petAdoptionId || (req.pet && req.pet.status === "Available" && pets.find(p => p._id === req.pet._id)?.adoptionId === petAdoptionId));
  };

  // Helper: check if already requested by checking petId
  const getRequestForPet = (petId) => {
    return myRequests.find((req) => req.pet?._id === petId);
  };

  // Species options based on pets or static
  const speciesList = ["All", "Dog", "Cat", "Bird", "Rabbit", "Other"];

  // Filtered pets list
  const filteredPets = pets.filter((pet) => {
    const matchesSearch = pet.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pet.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pet.adoptionDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecies = selectedSpecies === "All" || pet.species?.toLowerCase() === selectedSpecies.toLowerCase();
    const matchesType = selectedType === "All" || pet.adoptionType?.toLowerCase() === selectedType.toLowerCase();
    
    // Do not show user's own pets for adoption (since they manage requests on `/adopt/post`)
    const isNotOwnPet = pet.postedBy?.id !== currentUserId;

    return matchesSearch && matchesSpecies && matchesType && isNotOwnPet;
  });

  const getAge = (dob) => {
    if (!dob) return "Unknown age";
    const birth = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    if (years === 0) {
      return `${months} month${months !== 1 ? "s" : ""}`;
    }
    return `${years} year${years !== 1 ? "s" : ""}`;
  };

  // Render detail modal photos
  const getAllPhotos = (pet) => {
    const photos = [];
    if (pet.profilePhoto) photos.push(pet.profilePhoto);
    if (pet.photos && pet.photos.length > 0) {
      photos.push(...pet.photos);
    }
    return photos;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Banner Header */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white p-8 sm:p-12 shadow-2xl mb-8">
          <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-y-8 translate-x-8">
            <PawPrint className="w-80 h-80" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              🐾 Find Your Perfect Companion
            </span>
            <h1 className="text-4xl sm:text-5xl font-black mt-4 leading-tight">
              Welcome to the Pet Adoption Hub
            </h1>
            <p className="text-lg text-purple-100 mt-4 leading-relaxed">
              Adopt, foster, or give temporary shelter. Connect with pets who need a loving home, and track all your adoption requests in real-time.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/create-post"
                className="flex items-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-full font-bold hover:scale-105 transition shadow-lg hover:bg-purple-50"
              >
                <PlusCircle size={18} /> List a Pet for Adoption
              </Link>
              <Link
                to="/adopt/post"
                className="flex items-center gap-2 bg-purple-700/50 backdrop-blur-md border border-purple-400 text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition shadow-lg hover:bg-purple-700"
              >
                Manage Received Requests <ExternalLink size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-purple-100 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Available Pets</p>
              <h3 className="text-3xl font-black text-purple-700 mt-1">{pets.length}</h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <PawPrint size={24} />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-pink-100 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">My Active Requests</p>
              <h3 className="text-3xl font-black text-pink-600 mt-1">
                {myRequests.filter(r => r.status !== "adopted").length}
              </h3>
            </div>
            <div className="p-3 bg-pink-100 text-pink-600 rounded-xl">
              <Heart size={24} />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-indigo-100 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Scheduled Meetings</p>
              <h3 className="text-3xl font-black text-indigo-600 mt-1">
                {myRequests.filter(r => r.status === "meet scheduled").length}
              </h3>
            </div>
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Calendar size={24} />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl shadow-md max-w-md">
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex-1 py-3 px-4 text-center rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "browse"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
            }`}
          >
            <Search size={18} /> Browse Pets
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3 px-4 text-center rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "requests"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
            }`}
          >
            <Heart size={18} /> My Requests
            {myRequests.length > 0 && (
              <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-black ml-1">
                {myRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "browse" ? (
          <div>
            {/* Filters Bar */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search pet by name, breed, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Species Dropdown / Selection */}
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                  {speciesList.map((species) => (
                    <button
                      key={species}
                      onClick={() => setSelectedSpecies(species)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        selectedSpecies === species
                          ? "bg-white text-purple-700 shadow-sm"
                          : "text-gray-600 hover:text-purple-600"
                      }`}
                    >
                      {species}
                    </button>
                  ))}
                </div>

                {/* Adoption Type filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="permanent">Permanent</option>
                  <option value="temporary">Temporary</option>
                </select>

                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSpecies("All");
                    setSelectedType("All");
                  }}
                  className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-purple-50 transition"
                >
                  <RefreshCw size={14} /> Reset Filters
                </button>
              </div>
            </div>

            {/* Pets Grid */}
            {loadingPets ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Finding available pets...</p>
              </div>
            ) : filteredPets.length === 0 ? (
              <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-2xl border border-dashed border-gray-300">
                <div className="text-6xl mb-4">😿</div>
                <h3 className="text-xl font-bold text-gray-700">No pets found</h3>
                <p className="text-gray-500 mt-1 max-w-md mx-auto">
                  We couldn't find any available pets matching your criteria. Try adjusting your search query or filters!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPets.map((pet) => {
                  const alreadyReq = isAlreadyRequested(pet.adoptionId);
                  return (
                    <div
                      key={pet._id}
                      onClick={() => {
                        setSelectedPet(pet);
                        setCurrentPhotoIndex(0);
                      }}
                      className="group bg-white rounded-3xl overflow-hidden border border-purple-50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col cursor-pointer"
                    >
                      {/* Photo Header */}
                      <div className="relative h-64 overflow-hidden bg-gray-100">
                        <img
                          src={
                            pet.photos && pet.photos.length > 0
                              ? `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}${pet.photos[0]}`
                              : pet.profilePhoto
                              ? `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}${pet.profilePhoto}`
                              : "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop"
                          }
                          alt={pet.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        />
                        {/* Species Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <span className="bg-white/90 backdrop-blur-sm text-purple-700 px-3 py-1 rounded-full text-xs font-black shadow-md capitalize">
                            {pet.species}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-black shadow-md text-white ${
                            pet.adoptionType === "temporary" ? "bg-pink-500" : "bg-indigo-600"
                          }`}>
                            {pet.adoptionType === "temporary" ? "Temporary" : "Permanent"}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-2xl font-black text-gray-900 group-hover:text-purple-600 transition">
                            {pet.name}
                          </h3>
                          <span className="text-sm bg-purple-50 text-purple-600 px-2.5 py-1 rounded-lg font-bold">
                            {pet.breed}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 font-medium mb-3">
                          🎂 Age: {getAge(pet.dateOfBirth)}
                        </p>

                        <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                          {pet.adoptionDescription || pet.description || "Looking for a warm home and a loving family..."}
                        </p>

                        {/* Traits badges */}
                        {pet.traits && pet.traits.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {pet.traits.slice(0, 3).map((trait, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                {trait}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Card Actions */}
                        <div className="flex items-center gap-3 mt-auto">
                          {alreadyReq ? (
                            <button
                              disabled
                              className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2 border border-gray-200"
                            >
                              <Check size={16} /> Requested
                            </button>
                          ) : (
                            <button
                              disabled={submittingRequest === pet.adoptionId}
                              onClick={(e) => handleRequestAdoption(e, pet.adoptionId)}
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-3 rounded-xl font-black text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                              {submittingRequest === pet.adoptionId ? (
                                <>
                                  <RefreshCw size={16} className="animate-spin" /> Requesting...
                                </>
                              ) : (
                                <>Adopt Me</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* My Requests Tab */
          <div>
            {loadingRequests ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading your adoption requests...</p>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-2xl border border-dashed border-gray-300">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-700">No requests sent yet</h3>
                <p className="text-gray-500 mt-1 max-w-md mx-auto mb-6">
                  You haven't requested any pets for adoption yet. Switch over to the "Browse Pets" tab to find your new best friend!
                </p>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="bg-purple-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-purple-700 transition shadow-md"
                >
                  Browse Pets
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {myRequests.map((request) => {
                  const pet = request.pet;
                  const owner = request.owner;
                  
                  if (!pet) return null;

                  return (
                    <div
                      key={request._id}
                      className="bg-white rounded-3xl border border-gray-100 p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row gap-6 items-start lg:items-center"
                    >
                      {/* Left: Pet Info */}
                      <div className="flex items-center gap-4 min-w-[280px]">
                        <img
                          src={
                            pet.profilePhoto
                              ? `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}${pet.profilePhoto}`
                              : "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=150&h=150&fit=crop"
                          }
                          alt={pet.name}
                          className="w-20 h-20 rounded-2xl object-cover shadow-inner border border-purple-50"
                        />
                        <div>
                          <h4 className="text-xl font-black text-gray-900">{pet.name}</h4>
                          <p className="text-sm bg-purple-50 text-purple-700 inline-block px-2.5 py-0.5 rounded-md font-bold mt-1 uppercase text-xs">
                            {pet.breed}
                          </p>
                          <p className="text-xs text-gray-400 mt-1.5">
                            Requested: {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Middle: Owner Details */}
                      <div className="flex-1 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pet Owner</p>
                          <p className="font-bold text-gray-800 mt-1 flex items-center gap-1.5">
                            <User size={14} className="text-purple-600" /> {owner?.name || "Unknown"}
                          </p>
                          {owner?.location && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                              <MapPin size={14} className="text-gray-400" /> {owner.location}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Contact Info</p>
                          {owner?.phone && (
                            <p className="text-sm text-gray-700 mt-1 flex items-center gap-1.5">
                              <Phone size={14} className="text-purple-600" /> {owner.phone}
                            </p>
                          )}
                          {owner?.email && (
                            <p className="text-sm text-gray-700 mt-1 flex items-center gap-1.5">
                              <Mail size={14} className="text-pink-500" /> {owner.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Status and Details */}
                      <div className="border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 min-w-[260px] flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400 font-bold uppercase">Status</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black capitalize ${
                              request.status === "meet scheduled"
                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                : request.status === "adopted" || request.status === "adopted"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : request.status === "rejected"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            }`}
                          >
                            {request.status === "meet scheduled" ? "Meeting Scheduled" : request.status}
                          </span>
                        </div>

                        {/* Meeting Schedule Details */}
                        {request.status === "meet scheduled" && request.meetingDate && (
                          <div className="bg-purple-50/55 rounded-2xl p-3.5 border border-purple-100 text-xs text-purple-950">
                            <p className="font-extrabold flex items-center gap-1 mb-1">
                              <Calendar size={13} className="text-purple-700" /> Meeting Date:
                            </p>
                            <p className="font-semibold text-gray-700">
                              {new Date(request.meetingDate).toLocaleString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                            {request.notes && (
                              <p className="mt-2 italic text-gray-600 bg-white/60 p-1.5 rounded-lg border border-purple-100">
                                "{request.notes}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Cancel Button */}
                        {request.status !== "adopted" && (
                          <button
                            disabled={cancellingRequest === request._id}
                            onClick={(e) => handleCancelRequest(e, request._id)}
                            className="w-full bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 py-2 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
                          >
                            {cancellingRequest === request._id ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" /> Withdrawing...
                              </>
                            ) : (
                              <>Withdraw Request</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pet Detail Modal */}
      {selectedPet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
            <button
              onClick={() => setSelectedPet(null)}
              className="absolute top-4 right-4 bg-white/95 text-gray-600 hover:text-gray-900 p-2 rounded-full shadow-lg z-10 hover:scale-105 transition"
            >
              <X size={20} />
            </button>

            {/* Left/Top: Photos Section */}
            <div className="w-full md:w-1/2 relative bg-gray-900 h-64 md:h-auto min-h-[300px]">
              {getAllPhotos(selectedPet).length > 0 ? (
                <>
                  <img
                    src={`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}${getAllPhotos(selectedPet)[currentPhotoIndex]}`}
                    alt={selectedPet.name}
                    className="w-full h-full object-cover"
                  />
                  {getAllPhotos(selectedPet).length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentPhotoIndex((prev) =>
                            prev === 0 ? getAllPhotos(selectedPet).length - 1 : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPhotoIndex((prev) =>
                            prev === getAllPhotos(selectedPet).length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full"
                      >
                        <ChevronRight size={20} />
                      </button>
                      {/* Dots indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {getAllPhotos(selectedPet).map((_, index) => (
                          <span
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              currentPhotoIndex === index ? "bg-white" : "bg-white/40"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No Image Available
                </div>
              )}
            </div>

            {/* Right/Bottom: Pet Detail Content */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto max-h-[90vh] md:max-h-[600px] flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  {selectedPet.species}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider text-white ${
                  selectedPet.adoptionType === "temporary" ? "bg-pink-500" : "bg-indigo-600"
                }`}>
                  {selectedPet.adoptionType === "temporary" ? "Temporary" : "Permanent"}
                </span>
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-1">{selectedPet.name}</h2>
              <p className="text-sm text-purple-600 font-bold mb-4">{selectedPet.breed}</p>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl mb-6">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Age</p>
                  <p className="font-bold text-gray-800 text-sm">{getAge(selectedPet.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Color</p>
                  <p className="font-bold text-gray-800 text-sm">{selectedPet.color || "N/A"}</p>
                </div>
              </div>

              <div className="mb-6 flex-1">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {selectedPet.adoptionDescription || selectedPet.description || "No description provided."}
                </p>
              </div>

              {selectedPet.traits && selectedPet.traits.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Traits</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPet.traits.map((trait, i) => (
                      <span key={i} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-bold">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPet.healthRecords && selectedPet.healthRecords.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Health & Safety</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                    {selectedPet.healthRecords.map((record, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check size={14} className="text-green-500" /> {record}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Owner card */}
              <div className="border-t border-gray-100 pt-6 mt-auto">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Owner Contact Details</p>
                <div className="flex flex-col gap-2 bg-purple-50/40 border border-purple-50 p-4 rounded-2xl mb-6">
                  <p className="font-bold text-gray-800 flex items-center gap-2">
                    <User size={14} className="text-purple-600" /> {selectedPet.postedBy?.name || "Anonymous"}
                  </p>
                  {selectedPet.postedBy?.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={14} className="text-purple-600" /> {selectedPet.postedBy.phone}
                    </p>
                  )}
                  {selectedPet.postedBy?.email && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail size={14} className="text-pink-500" /> {selectedPet.postedBy.email}
                    </p>
                  )}
                </div>

                {isAlreadyRequested(selectedPet.adoptionId) ? (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 py-3.5 rounded-2xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Adoption Request Sent
                  </button>
                ) : (
                  <button
                    disabled={submittingRequest === selectedPet.adoptionId}
                    onClick={(e) => handleRequestAdoption(e, selectedPet.adoptionId)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-3.5 rounded-2xl font-black transition shadow-lg flex items-center justify-center gap-2"
                  >
                    {submittingRequest === selectedPet.adoptionId ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" /> Submitting Request...
                      </>
                    ) : (
                      <>Send Adoption Request</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
