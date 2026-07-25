import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  PawPrint,
  BarChart2,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Heart,
  Activity,
  DollarSign,
  Eye,
  Shield,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  RefreshCw,
  Clock,
  ArrowRight,
  Calendar
} from "lucide-react";

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard"); // "Dashboard" | "Users" | "Reports" | "Settings"
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [pendingVets, setPendingVets] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPets: 0,
    totalOrders: 0,
    totalAdoptions: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [updatingUserId, setUpdatingUserId] = useState(null);
  
  const [adoptionSearch, setAdoptionSearch] = useState("");
  const [adoptionStatusFilter, setAdoptionStatusFilter] = useState("All");

  const [allPets, setAllPets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [petSearch, setPetSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch admin dashboard details
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      // 1. Fetch Stats
      const statsRes = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/api/admin/stats", { headers });
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData.stats);
      }

      // 2. Fetch Users
      const usersRes = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/api/admin/users", { headers });
      const usersData = await usersRes.json();
      if (usersRes.ok) {
        setUsers(usersData.users || []);
      }

      // 3. Fetch Activities
      const actRes = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/api/admin/activity", { headers });
      const actData = await actRes.json();
      if (actRes.ok) {
        setActivities(actData.activities || []);
      }

      // 4. Fetch Pending Vets
      const pendingRes = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/api/admin/vets/pending", { headers });
      const pendingData = await pendingRes.json();
      if (pendingRes.ok) {
        setPendingVets(pendingData.vets || []);
      }

      // 5. Fetch Platform Adoptions
      const adoptionsRes = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/api/admin/adoptions", { headers });
      const adoptionsData = await adoptionsRes.json();
      if (adoptionsRes.ok) {
        setAdoptions(adoptionsData.requests || []);
      }

      // 6. Fetch Platform Pets
      const petsRes = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/api/admin/pets", { headers });
      const petsData = await petsRes.json();
      if (petsRes.ok) {
        setAllPets(petsData.pets || []);
      }

      // 7. Fetch Shop Orders
      const ordersRes = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/api/admin/orders", { headers });
      const ordersData = await ordersRes.json();
      if (ordersRes.ok) {
        setOrders(ordersData.orders || []);
      }

      // 8. Fetch Service Bookings
      const bookingsRes = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")) + "/api/admin/bookings", { headers });
      const bookingsData = await bookingsRes.json();
      if (bookingsRes.ok) {
        setAllBookings(bookingsData.bookings || []);
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to load platform dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.warning("Please sign in to access Admin Dashboard");
      navigate("/signin");
      return;
    }
    
    // Check if user is admin
    const storedUser = localStorage.getItem("user");
    try {
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user?.role !== "admin") {
        toast.error("Access denied. Admin account required.");
        navigate("/dashboard");
        return;
      }
    } catch (e) {
      toast.error("Invalid session.");
      navigate("/signin");
      return;
    }

    fetchDashboardData();
  }, [token]);

  // Toggle user active status
  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      setUpdatingUserId(userId);
      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      toast.success(`User status changed to ${nextStatus}!`);
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: nextStatus } : u))
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Change user role
  const handleChangeRole = async (userId, newRole) => {
    try {
      setUpdatingUserId(userId);
      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change user role");

      toast.success(`User role updated to ${newRole}!`);
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Approve veterinarian account
  const handleApproveVet = async (vetId) => {
    try {
      setUpdatingUserId(vetId);
      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/api/admin/vets/${vetId}/approve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve veterinarian");

      toast.success("Veterinarian approved successfully!");
      setPendingVets((prev) => prev.filter((v) => v._id !== vetId));
      fetchDashboardData(); // Refresh users list and stats
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Reject veterinarian registration
  const handleRejectVet = async (vetId) => {
    try {
      setUpdatingUserId(vetId);
      const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/api/admin/vets/${vetId}/reject`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject veterinarian");

      toast.success("Veterinarian registration rejected.");
      setPendingVets((prev) => prev.filter((v) => v._id !== vetId));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // User Filter logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesStatus = statusFilter === "All" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Adoption Filter logic
  const filteredAdoptions = adoptions.filter((reqItem) => {
    const pet = reqItem.adoptionId?.PetID || {};
    const originalOwner = reqItem.originalOwnerId || pet.ownerId || {};
    const adopter = reqItem.requesterId || {};

    const matchesSearch =
      pet.name?.toLowerCase().includes(adoptionSearch.toLowerCase()) ||
      pet.species?.toLowerCase().includes(adoptionSearch.toLowerCase()) ||
      originalOwner.name?.toLowerCase().includes(adoptionSearch.toLowerCase()) ||
      adopter.name?.toLowerCase().includes(adoptionSearch.toLowerCase());

    const matchesStatus =
      adoptionStatusFilter === "All" || reqItem.status === adoptionStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pets Filter logic
  const filteredPets = allPets.filter((pet) => {
    const owner = pet.ownerId || {};
    return (
      pet.name?.toLowerCase().includes(petSearch.toLowerCase()) ||
      pet.species?.toLowerCase().includes(petSearch.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(petSearch.toLowerCase()) ||
      owner.name?.toLowerCase().includes(petSearch.toLowerCase()) ||
      owner.email?.toLowerCase().includes(petSearch.toLowerCase())
    );
  });

  // Shop Orders Filter logic
  const filteredOrders = orders.filter((order) => {
    const user = order.user || {};
    const matchesItems = order.items?.some((item) =>
      item.name?.toLowerCase().includes(orderSearch.toLowerCase())
    );
    return (
      order._id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.transactionId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      user.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      matchesItems
    );
  });

  const statsList = [
    { label: "Total Users", value: stats.totalUsers, change: "+12%", icon: <Users size={22} className="text-blue-500" />, bg: "bg-blue-50/50 border-blue-100" },
    { label: "Total Pets", value: stats.totalPets, change: "+8%", icon: <PawPrint size={22} className="text-purple-500" />, bg: "bg-purple-50/50 border-purple-100" },
    { label: "Shop Orders", value: stats.totalOrders, change: "+24%", icon: <ShoppingBag size={22} className="text-teal-500" />, bg: "bg-teal-50/50 border-teal-100" },
    { label: "Adoptions", value: stats.totalAdoptions, change: "+5%", icon: <Heart size={22} className="text-pink-500" />, bg: "bg-pink-50/50 border-pink-100" },
  ];

  const roleColor = {
    user: "bg-gray-100 text-gray-700 border border-gray-200",
    vet: "bg-teal-100 text-teal-700 border border-teal-200",
    admin: "bg-purple-100 text-purple-700 border border-purple-200"
  };

  const statusColor = {
    Active: "bg-green-100 text-green-700 border border-green-200",
    Inactive: "bg-red-100 text-red-700 border border-red-200",
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "signup":
        return <Users size={14} className="text-blue-500" />;
      case "adoption":
        return <Heart size={14} className="text-pink-500" />;
      case "order":
        return <ShoppingBag size={14} className="text-teal-500" />;
      case "booking":
        return <Calendar size={14} className="text-purple-500" />;
      default:
        return <Activity size={14} className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-100 flex flex-col py-8 px-4 fixed h-full z-10">
        <div className="flex items-center gap-3 px-3 mb-10">
          <div className="bg-gradient-to-br from-purple-600 to-pink-500 p-2.5 rounded-2xl shadow-md shadow-purple-100">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-black text-gray-900 text-base leading-tight">PetCare Control</p>
            <p className="text-xs text-gray-400 font-bold tracking-wider mt-0.5">ADMIN PORTAL</p>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          {[
            { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
            { label: "Users", icon: <Users className="w-5 h-5" /> },
            { label: "Vet Approvals", icon: <UserCheck className="w-5 h-5" /> },
            { label: "Service Bookings", icon: <Calendar className="w-5 h-5" /> },
            { label: "Adoptions", icon: <Heart className="w-5 h-5" /> },
            { label: "Pets", icon: <PawPrint className="w-5 h-5" /> },
            { label: "Shop Orders", icon: <ShoppingBag className="w-5 h-5" /> },
            { label: "Reports", icon: <BarChart2 className="w-5 h-5" /> },
            { label: "Settings", icon: <Settings className="w-5 h-5" /> }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeNav === item.label
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-100"
                  : "text-gray-600 hover:bg-purple-50/50 hover:text-purple-600"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100 shadow-inner">
            <p className="text-xs font-black text-purple-700 uppercase tracking-wider">Super Administrator</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">Full privileges to configure models and update roles.</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 p-8 lg:p-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">{activeNav}</h1>
            <p className="text-gray-500 text-sm mt-1">Platform management, stats aggregation, and user profiles database.</p>
          </div>
          
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center justify-center gap-2 border border-purple-200 hover:bg-purple-50 text-purple-700 bg-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Dashboard
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <RefreshCw className="animate-spin text-purple-600 mb-4" size={36} />
            <p className="text-gray-500 font-bold">Synchronizing database indices...</p>
          </div>
        ) : (
          <>
            {/* Stats Summary Panel */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsList.map((s, idx) => (
                <div key={idx} className={`bg-white rounded-2xl p-5 shadow-md border ${s.bg} flex items-center gap-4`}>
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">{s.icon}</div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-800">{s.value}</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard Navigation Views */}
            {activeNav === "Dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Recent Users Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-md border border-gray-100">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Users className="text-blue-500" /> Recent User Logins
                    </h2>
                    <button
                      onClick={() => setActiveNav("Users")}
                      className="text-xs text-purple-600 hover:text-purple-800 font-black flex items-center gap-1 hover:underline"
                    >
                      Manage Users <ArrowRight size={12} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {users.slice(0, 5).map((u) => (
                      <div key={u._id} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm uppercase">
                            {u.name ? u.name[0] : "?"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{u.name}</p>
                            <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${roleColor[u.role]}`}>
                            {u.role}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${statusColor[u.status]}`}>
                            {u.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Activity Feed */}
                <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
                  <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
                    <Activity className="text-teal-500" /> Real-time Activity Log
                  </h2>
                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                    {activities.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-10">No recent activities recorded.</p>
                    ) : (
                      activities.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
                          <div className="mt-0.5 bg-gray-50 p-2 rounded-xl border border-gray-100">
                            {getActivityIcon(a.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 font-semibold break-words leading-relaxed">{a.message}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-1">
                              {new Date(a.time).toLocaleTimeString()} · {new Date(a.time).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Users Tab View */}
            {activeNav === "Users" && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6">
                
                {/* Filters Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      placeholder="Search users name, email, username..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Role Filter */}
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer"
                    >
                      <option value="All">All Roles</option>
                      <option value="user">User</option>
                      <option value="vet">Vet</option>
                      <option value="admin">Admin</option>
                    </select>

                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active Only</option>
                      <option value="Inactive">Inactive Only</option>
                    </select>
                  </div>
                </div>

                {/* Users List/Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-400 font-black uppercase tracking-wider">
                        <th className="py-3 px-4">User Info</th>
                        <th className="py-3 px-4">Username / Phone</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Pets</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-10 text-center text-gray-400 font-medium">No users match your filters.</td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50/50 transition">
                            {/* User details */}
                            <td className="py-4 px-4 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-black text-xs uppercase shadow-inner">
                                {u.name ? u.name[0] : "?"}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">{u.name}</p>
                                <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                              </div>
                            </td>

                            {/* Username and Phone */}
                            <td className="py-4 px-4">
                              <p className="font-semibold text-gray-700">@{u.username}</p>
                              {u.phone && <p className="text-xs text-gray-400 mt-0.5">{u.phone}</p>}
                            </td>

                            {/* User Role selector */}
                            <td className="py-4 px-4">
                              <select
                                disabled={updatingUserId === u._id}
                                value={u.role}
                                onChange={(e) => handleChangeRole(u._id, e.target.value)}
                                className={`text-[10px] px-2.5 py-1 rounded font-black uppercase tracking-wider focus:outline-none cursor-pointer ${roleColor[u.role]}`}
                              >
                                <option value="user">User</option>
                                <option value="vet">Vet</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>

                            {/* User status */}
                            <td className="py-4 px-4">
                              <span className={`text-[10px] px-2.5 py-1.5 rounded-full font-black uppercase tracking-wider ${statusColor[u.status]}`}>
                                {u.status}
                              </span>
                            </td>

                            {/* Pets Count */}
                            <td className="py-4 px-4 font-black text-purple-600">{u.pets}</td>

                            {/* Actions toggling status */}
                            <td className="py-4 px-4 text-right">
                              <button
                                disabled={updatingUserId === u._id}
                                onClick={() => handleToggleStatus(u._id, u.status)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 justify-end ml-auto cursor-pointer border ${
                                  u.status === "Active"
                                    ? "bg-white hover:bg-red-50 text-red-600 border-red-200"
                                    : "bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                                }`}
                              >
                                {updatingUserId === u._id ? (
                                  <RefreshCw size={12} className="animate-spin" />
                                ) : u.status === "Active" ? (
                                  <>Deactivate</>
                                ) : (
                                  <>Activate</>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* Vet Approvals Tab View */}
            {activeNav === "Vet Approvals" && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6">
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <UserCheck className="text-purple-600" /> Pending Veterinarian Verifications
                  </h2>
                  <p className="text-gray-500 text-xs mt-1">Review credentials and license numbers to authorize doctor access.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-400 font-black uppercase tracking-wider">
                        <th className="py-3 px-4">Doctor Info</th>
                        <th className="py-3 px-4">License Number</th>
                        <th className="py-3 px-4">Specialization</th>
                        <th className="py-3 px-4">Clinic Name</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {pendingVets.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">No pending veterinarian registrations.</td>
                        </tr>
                      ) : (
                        pendingVets.map((v) => (
                          <tr key={v._id} className="hover:bg-gray-50/50 transition">
                            <td className="py-4 px-4 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-blue-400 flex items-center justify-center text-white font-black text-xs uppercase shadow-inner">
                                {v.name ? v.name[0] : "?"}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">{v.name}</p>
                                <p className="text-xs text-gray-400 font-medium">{v.email}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 rounded px-2.5 py-1">
                                {v.licenseNumber}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-semibold text-gray-700">
                              {v.specialization}
                            </td>
                            <td className="py-4 px-4 text-gray-500 max-w-[200px] truncate font-medium">
                              {v.clinicName}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  disabled={updatingUserId === v._id}
                                  onClick={() => handleApproveVet(v._id)}
                                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  disabled={updatingUserId === v._id}
                                  onClick={() => handleRejectVet(v._id)}
                                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Adoptions Tab View */}
            {activeNav === "Adoptions" && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6">
                <div className="mb-6 pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                      <Heart className="text-pink-500 fill-pink-500" /> Platform Adoption History
                    </h2>
                    <p className="text-gray-500 text-xs mt-1">Audit active requests, scheduled meetings, and successful owner transfers.</p>
                  </div>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                    <input
                      type="text"
                      placeholder="Search by pet name, owner, or adopter..."
                      value={adoptionSearch}
                      onChange={(e) => setAdoptionSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm font-medium transition"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status:</span>
                    <select
                      value={adoptionStatusFilter}
                      onChange={(e) => setAdoptionStatusFilter(e.target.value)}
                      className="border border-gray-200 bg-white rounded-xl px-4 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="under review">Under Review</option>
                      <option value="meet scheduled">Meet Scheduled</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-400 font-black uppercase tracking-wider">
                        <th className="py-3 px-4">Pet Info</th>
                        <th className="py-3 px-4">Old Owner</th>
                        <th className="py-3 px-4">New Owner (Adopter)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Meeting Date / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {filteredAdoptions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">No adoptions history matches your filter.</td>
                        </tr>
                      ) : (
                        filteredAdoptions.map((reqItem) => {
                          const pet = reqItem.adoptionId?.PetID || {};
                          const originalOwner = reqItem.originalOwnerId || pet.ownerId || {};
                          const adopter = reqItem.requesterId || {};
                          
                          const statusColors = {
                            "under review": "bg-yellow-100 text-yellow-800 border-yellow-200",
                            "meet scheduled": "bg-blue-100 text-blue-800 border-blue-200",
                            "approved": "bg-green-100 text-green-800 border-green-200",
                            "rejected": "bg-red-100 text-red-800 border-red-200"
                          };

                          return (
                            <tr key={reqItem._id} className="hover:bg-gray-50/50 transition">
                              {/* Pet Info */}
                              <td className="py-4 px-4 flex items-center gap-3">
                                 {pet.profilePhoto ? (
                                  <img 
                                    src={
                                      pet.profilePhoto.startsWith("http")
                                        ? pet.profilePhoto
                                        : `${import.meta.env.VITE_API_URL || "http://localhost:7000"}${pet.profilePhoto.replace(/\\/g, "/")}`
                                    } 
                                    alt={pet.name} 
                                    className="w-10 h-10 rounded-xl object-cover shadow-sm" 
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                                    {pet.name ? pet.name[0] : "?"}
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-gray-800">{pet.name || "Unknown Pet"}</p>
                                  <p className="text-xs text-gray-400 font-medium">{pet.species || "Unknown Species"}</p>
                                </div>
                              </td>

                              {/* Old Owner */}
                              <td className="py-4 px-4">
                                <p className="font-bold text-gray-800">{originalOwner.name || "System"}</p>
                                {originalOwner.phone && <p className="text-xs text-purple-700 font-bold mt-0.5">📞 {originalOwner.phone}</p>}
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{originalOwner.email || ""}</p>
                              </td>

                              {/* New Owner (Adopter) */}
                              <td className="py-4 px-4">
                                <p className="font-bold text-gray-800">{adopter.name || "Anonymous"}</p>
                                {adopter.phone && <p className="text-xs text-purple-700 font-bold mt-0.5">📞 {adopter.phone}</p>}
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{adopter.email || ""}</p>
                              </td>

                              {/* Status */}
                              <td className="py-4 px-4">
                                <span className={`text-[10px] px-2.5 py-1.5 rounded-full font-black uppercase tracking-wider border ${
                                  statusColors[reqItem.status] || "bg-gray-100 text-gray-800"
                                }`}>
                                  {reqItem.status}
                                </span>
                              </td>

                              {/* Meeting Details / Notes */}
                              <td className="py-4 px-4 font-medium text-xs text-gray-600 max-w-[250px] truncate">
                                {reqItem.meetingDate ? (
                                  <div>
                                    <p className="font-bold text-purple-700">📅 {new Date(reqItem.meetingDate).toLocaleDateString()}</p>
                                    <p className="text-gray-500 mt-0.5 truncate">{reqItem.notes}</p>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">No meeting scheduled</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pets Tab View */}
            {activeNav === "Pets" && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6">
                <div className="mb-6 pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                      <PawPrint className="text-purple-600 fill-purple-100" /> Registered Pets
                    </h2>
                    <p className="text-gray-500 text-xs mt-1">Monitor all registered pets, owners, and their current adoption statuses.</p>
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative mb-6">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                  <input
                    type="text"
                    placeholder="Search pets by name, breed, species, or owner..."
                    value={petSearch}
                    onChange={(e) => setPetSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm font-medium transition"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-400 font-black uppercase tracking-wider">
                        <th className="py-3 px-4">Pet Info</th>
                        <th className="py-3 px-4">Owner Info</th>
                        <th className="py-3 px-4">Age / Color</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {filteredPets.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-12 text-center text-gray-400 font-medium">No pets matches your search.</td>
                        </tr>
                      ) : (
                        filteredPets.map((pet) => {
                          const owner = pet.ownerId || {};
                          return (
                            <tr key={pet._id} className="hover:bg-gray-50/50 transition">
                              {/* Pet Info */}
                              <td className="py-4 px-4 flex items-center gap-3">
                                {pet.profilePhoto ? (
                                  <img 
                                    src={
                                      pet.profilePhoto.startsWith("http")
                                        ? pet.profilePhoto
                                        : `${import.meta.env.VITE_API_URL || "http://localhost:7000"}${pet.profilePhoto.replace(/\\/g, "/")}`
                                    } 
                                    alt={pet.name} 
                                    className="w-10 h-10 rounded-xl object-cover shadow-sm" 
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                                    {pet.name ? pet.name[0] : "?"}
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-gray-800">{pet.name || "Unnamed Pet"}</p>
                                  <p className="text-xs text-gray-400 font-semibold">{pet.breed || "Unknown Breed"} ({pet.species || "Unknown"})</p>
                                </div>
                              </td>

                              {/* Owner Info */}
                              <td className="py-4 px-4">
                                <p className="font-bold text-gray-800">{owner.name || "System"}</p>
                                {owner.phone && <p className="text-xs text-purple-700 font-bold mt-0.5">📞 {owner.phone}</p>}
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{owner.email || ""}</p>
                              </td>

                              {/* Age / Color */}
                              <td className="py-4 px-4">
                                <p className="font-bold text-gray-800">
                                  {pet.dateOfBirth ? `${Math.floor((new Date() - new Date(pet.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25))} Years Old` : "N/A"}
                                </p>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">Color: {pet.color || "N/A"}</p>
                              </td>

                              {/* Status */}
                              <td className="py-4 px-4">
                                <span className={`text-[10px] px-2.5 py-1.5 rounded-full font-black uppercase tracking-wider border ${
                                  pet.status === "Adopted" 
                                    ? "bg-green-100 text-green-800 border-green-200" 
                                    : "bg-blue-100 text-blue-800 border-blue-200"
                                }`}>
                                  {pet.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Shop Orders Tab View */}
            {activeNav === "Shop Orders" && (
              <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6">
                <div className="mb-6 pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                      <ShoppingBag className="text-teal-600 fill-teal-50" /> Pet Shop Orders
                    </h2>
                    <p className="text-gray-500 text-xs mt-1">Audit platform merchandise checkout transactions and shipment statuses.</p>
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative mb-6">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                  <input
                    type="text"
                    placeholder="Search orders by customer name, order ID, product name, or txn ID..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm font-medium transition"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-400 font-black uppercase tracking-wider">
                        <th className="py-3 px-4">Order ID & Date</th>
                        <th className="py-3 px-4">Customer Details</th>
                        <th className="py-3 px-4">Items Summary</th>
                        <th className="py-3 px-4">Payment Details</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">No shop orders matches your search.</td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => {
                          const user = order.user || {};
                          const statusColors = {
                            pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
                            paid: "bg-green-100 text-green-800 border-green-200",
                            failed: "bg-red-100 text-red-800 border-red-200",
                            cancelled: "bg-gray-100 text-gray-800 border-gray-200"
                          };

                          return (
                            <tr key={order._id} className="hover:bg-gray-50/50 transition">
                              {/* Order ID & Date */}
                              <td className="py-4 px-4">
                                <p className="font-bold text-gray-800 text-xs uppercase tracking-wider">ID: {order._id.substring(order._id.length - 8)}</p>
                                <p className="text-[11px] text-gray-400 font-bold mt-1">📅 {new Date(order.createdAt).toLocaleString()}</p>
                              </td>

                              {/* Customer Details */}
                              <td className="py-4 px-4">
                                <p className="font-bold text-gray-800">{user.name || "Anonymous Customer"}</p>
                                {user.phone && <p className="text-xs text-purple-700 font-bold mt-0.5">📞 {user.phone}</p>}
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{user.email || ""}</p>
                              </td>

                              {/* Items Summary */}
                              <td className="py-4 px-4 max-w-[250px]">
                                <div className="space-y-1">
                                  {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs font-semibold text-gray-600">
                                      <span className="truncate mr-2">⭐ {item.name}</span>
                                      <span className="text-gray-400">x{item.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>

                              {/* Payment Details */}
                              <td className="py-4 px-4">
                                <p className="font-black text-purple-700 text-sm">৳{order.total?.toLocaleString()}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">
                                  {order.paymentGateway} {order.transactionId ? `(${order.transactionId.substring(0, 10)}...)` : ""}
                                </p>
                              </td>

                              {/* Status */}
                              <td className="py-4 px-4">
                                <span className={`text-[10px] px-2.5 py-1.5 rounded-full font-black uppercase tracking-wider border ${
                                  statusColors[order.status] || "bg-gray-100 text-gray-800"
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reports Tab View */}
            {activeNav === "Reports" && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
                  <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart2 className="text-purple-600" /> Platform Financial Indicators
                  </h2>
                  <p className="text-sm text-gray-500 max-w-xl leading-relaxed mb-6">
                    A summary of the revenue generated through online orders at the pet shop and general conversions.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-400 to-teal-400 p-6 rounded-2xl text-white shadow-md">
                      <p className="text-xs font-bold uppercase tracking-wider opacity-85">Total Revenue</p>
                      <h4 className="text-3xl font-black mt-2">৳{stats.totalRevenue.toLocaleString()}</h4>
                      <p className="text-xs opacity-75 mt-2">From paid pet store orders</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-400 to-purple-400 p-6 rounded-2xl text-white shadow-md">
                      <p className="text-xs font-bold uppercase tracking-wider opacity-85">Average Order Value</p>
                      <h4 className="text-3xl font-black mt-2">৳{stats.avgOrderValue.toLocaleString()}</h4>
                      <p className="text-xs opacity-75 mt-2">Average checkout total</p>
                    </div>

                    <div className="bg-gradient-to-br from-pink-400 to-red-400 p-6 rounded-2xl text-white shadow-md">
                      <p className="text-xs font-bold uppercase tracking-wider opacity-85">Adoption Success Rate</p>
                      <h4 className="text-3xl font-black mt-2">
                        {stats.totalPets > 0 ? Math.round((stats.totalAdoptions / stats.totalPets) * 100) : 0}%
                      </h4>
                      <p className="text-xs opacity-75 mt-2">Adoption conversions</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Service Bookings Tab View */}
            {activeNav === "Service Bookings" && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Calendar className="text-purple-600" /> Platform Care Service Bookings
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Monitor all medical checkup, grooming, and clinic appointments booked across the platform.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search pet, owner, vet, clinic..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {allBookings.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-600">No service bookings recorded yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <th className="py-3 px-4">Pet Name</th>
                            <th className="py-3 px-4">Pet Owner</th>
                            <th className="py-3 px-4">Care Center / Service</th>
                            <th className="py-3 px-4">Duty Vet</th>
                            <th className="py-3 px-4">Date & Time</th>
                            <th className="py-3 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm font-medium">
                          {allBookings
                            .filter((b) => {
                              const s = bookingSearch.toLowerCase();
                              return (
                                b.petName?.toLowerCase().includes(s) ||
                                b.userId?.name?.toLowerCase().includes(s) ||
                                b.serviceId?.name?.toLowerCase().includes(s) ||
                                b.serviceId?.vetName?.toLowerCase().includes(s) ||
                                b.status?.toLowerCase().includes(s)
                              );
                            })
                            .map((booking) => (
                              <tr key={booking._id} className="hover:bg-purple-50/30 transition">
                                <td className="py-3.5 px-4 font-bold text-gray-900">
                                  🐾 {booking.petName}
                                </td>
                                <td className="py-3.5 px-4 text-gray-700">
                                  <p className="font-bold">{booking.userId?.name || "Customer"}</p>
                                  <p className="text-xs text-gray-400">{booking.userId?.phone || booking.userId?.email}</p>
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-purple-700">
                                  {booking.serviceId?.name || "Care Center"}
                                </td>
                                <td className="py-3.5 px-4 font-medium text-gray-800">
                                  🩺 {booking.serviceId?.vetName || "Assigned Vet"}
                                </td>
                                <td className="py-3.5 px-4 text-xs text-gray-600">
                                  <p className="font-bold text-gray-800">{booking.date}</p>
                                  <p className="text-gray-400">{booking.timeSlot}</p>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                                      booking.status === "done"
                                        ? "bg-green-100 text-green-700 border-green-200"
                                        : booking.status === "confirmed"
                                        ? "bg-blue-100 text-blue-700 border-blue-200"
                                        : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                    }`}
                                  >
                                    {booking.status || "pending"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab View */}
            {activeNav === "Settings" && (
              <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 max-w-xl">
                <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="text-gray-500" /> Platform Configurations
                </h2>
                <div className="space-y-4">
                  <div className="border-b border-gray-50 pb-4">
                    <p className="font-bold text-gray-800">SMTP Server config</p>
                    <p className="text-xs text-gray-400 mt-1">Configure parameters to trigger alerts on vaccine due reminders.</p>
                  </div>
                  <div className="border-b border-gray-50 pb-4">
                    <p className="font-bold text-gray-800">SSLCommerz sandbox settings</p>
                    <p className="text-xs text-gray-400 mt-1">Secure payment gateway checkout credentials.</p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => toast.success("Configuration saved successfully!")}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-md cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}
