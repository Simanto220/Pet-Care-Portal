import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Phone, Mail, MapPin, Edit, Save, X,
  Camera, PawPrint, CheckCircle, AlertCircle, Heart, Stethoscope
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000");

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
  const [userProfile, setUserProfile] = useState({
    name: "", email: "", phone: "", location: "", bio: "", profileImage: "",
  });
  const [editData, setEditData] = useState({});

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSaving(true);
    const formDataToSend = new FormData();
    formDataToSend.append("profilePhoto", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/profile/updateProfile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload photo");
      
      const updatedPhoto = data.user.profilePhoto || "";
      setUserProfile((prev) => ({ ...prev, profileImage: updatedPhoto }));
      setEditData((prev) => ({ ...prev, profileImage: updatedPhoto }));
      
      // Update localStorage user
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem("user", JSON.stringify({ ...u, photoURL: updatedPhoto }));
      }
      
      showToast("success", "Profile picture updated successfully!");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/signin"); return; }
        const res = await fetch(`${API}/profile/userInfo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) { navigate("/signin"); return; }
        if (!res.ok) throw new Error("Failed to fetch user profile");
        const data = await res.json();
        const profile = {
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          bio: data.bio || "",
          profileImage: data.photoURL || "",
        };
        setUserProfile(profile);
        setEditData(profile);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUserProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/profile/updateProfile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editData.name,
          email: editData.email,
          phone: editData.phone,
          location: editData.location,
          bio: editData.bio,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setUserProfile({ ...editData });
      setEditingProfile(false);
      showToast("success", "Profile সফলভাবে update হয়েছে!");
      // Update localStorage user
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem("user", JSON.stringify({ ...u, name: editData.name, displayName: editData.name }));
      }
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...userProfile });
    setEditingProfile(false);
  };

  const avatarSrc = userProfile.profileImage
    ? `${API}${userProfile.profileImage}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-medium transition-all
          ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {toast.type === "success"
            ? <CheckCircle className="w-5 h-5" />
            : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Cover + Avatar */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="h-36 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-400 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          </div>
          <div className="flex flex-col items-center -mt-16 pb-6 px-6">
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <span className="text-4xl font-bold text-purple-500">
                    {userProfile.name?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="absolute bottom-1 right-1 bg-purple-600 rounded-full p-1.5 cursor-pointer hover:bg-purple-700 transition shadow border-none"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-3">
              {userProfile.name || "User"}
            </h1>
            <p className="text-purple-500 text-sm">@{userProfile.email?.split("@")[0] || "user"}</p>
            {userProfile.location && (
              <p className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                <MapPin className="w-3.5 h-3.5" /> {userProfile.location}
              </p>
            )}
            <div className="flex items-center gap-1 mt-2 text-xs text-pink-500 font-medium">
              <Heart className="w-3.5 h-3.5 fill-pink-500" /> PetCare Member
            </div>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500" /> Profile Information
            </h2>
            {!editingProfile ? (
              <button
                onClick={() => { setEditData({ ...userProfile }); setEditingProfile(true); }}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:scale-105 transition shadow"
              >
                <Edit className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:scale-105 transition shadow disabled:opacity-60"
                >
                  <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Name */}
            <Field label="Full Name" icon={<User className="w-4 h-4 text-gray-400" />}
              editing={editingProfile} value={editingProfile ? editData.name : userProfile.name}
              onChange={(v) => setEditData({ ...editData, name: v })} placeholder="Your name" />

            {/* Phone */}
            <Field label="Phone" icon={<Phone className="w-4 h-4 text-gray-400" />}
              editing={editingProfile} value={editingProfile ? editData.phone : userProfile.phone}
              onChange={(v) => setEditData({ ...editData, phone: v })} placeholder="Phone number" type="tel" />

            {/* Email */}
            <Field label="Email" icon={<Mail className="w-4 h-4 text-gray-400" />}
              editing={editingProfile} value={editingProfile ? editData.email : userProfile.email}
              onChange={(v) => setEditData({ ...editData, email: v })} placeholder="Email address" type="email" />

            {/* Location */}
            <Field label="Location" icon={<MapPin className="w-4 h-4 text-gray-400" />}
              editing={editingProfile} value={editingProfile ? editData.location : userProfile.location}
              onChange={(v) => setEditData({ ...editData, location: v })} placeholder="Your location" />

            {/* Bio — full width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Bio</label>
              {editingProfile ? (
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                />
              ) : (
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 min-h-[72px]">
                  {userProfile.bio || <span className="text-gray-400 italic">No bio added yet</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => navigate("/pets")}
            className="bg-white rounded-2xl shadow p-4 flex items-center gap-3 hover:shadow-md transition hover:-translate-y-0.5"
          >
            <div className="bg-purple-100 p-2 rounded-xl">
              <PawPrint className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800 text-sm">My Pets</p>
              <p className="text-xs text-gray-500">Manage your pets</p>
            </div>
          </button>
          
          {(() => {
            const stored = localStorage.getItem("user");
            let role = "user";
            try { role = stored ? JSON.parse(stored).role : "user"; } catch(e){}
            
            if (role === "vet") {
              return (
                <button
                  onClick={() => navigate("/vet")}
                  className="bg-white rounded-2xl shadow p-4 flex items-center gap-3 hover:shadow-md transition hover:-translate-y-0.5"
                >
                  <div className="bg-purple-100 p-2 rounded-xl">
                    <Stethoscope className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800 text-sm">Vet Portal</p>
                    <p className="text-xs text-gray-500">Manage patients & appointments</p>
                  </div>
                </button>
              );
            }

            return (
              <button
                onClick={() => navigate("/purchase-history")}
                className="bg-white rounded-2xl shadow p-4 flex items-center gap-3 hover:shadow-md transition hover:-translate-y-0.5"
              >
                <div className="bg-pink-100 p-2 rounded-xl">
                  <Heart className="w-5 h-5 text-pink-500" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 text-sm">Purchase History</p>
                  <p className="text-xs text-gray-500">View past orders</p>
                </div>
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

// Reusable field component
const Field = ({ label, icon, editing, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
    {editing ? (
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
      />
    ) : (
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
        {icon}
        <span>{value || <span className="text-gray-400 italic">Not provided</span>}</span>
      </div>
    )}
  </div>
);

export default Profile;
