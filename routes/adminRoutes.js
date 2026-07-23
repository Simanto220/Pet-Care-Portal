const express = require("express");
const router = express.Router();
const { jwtVerification } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const Pet = require("../models/Pet");
const Order = require("../models/Order");
const Booking = require("../models/Booking");

// Admin Verification Middleware
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admin authorization required." });
  }
};

// Apply jwtVerification and verifyAdmin to all routes in this router
router.use(jwtVerification, verifyAdmin);

// 1. Get Platform Statistics
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPets = await Pet.countDocuments();
    
    // Count shop orders
    const totalOrders = await Order.countDocuments();
    
    // Count successful adoptions
    const totalAdoptions = await Pet.countDocuments({ status: "Adopted" });

    // Calculate revenue metrics from paid orders
    const paidOrders = await Order.find({ status: "paid" });
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    res.json({
      stats: {
        totalUsers,
        totalPets,
        totalOrders,
        totalAdoptions,
        totalRevenue,
        avgOrderValue
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch platform statistics" });
  }
});

// 2. Get Users List
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-password");

    // Fetch pet counts per user in a single query
    const pets = await Pet.find({}).select("ownerId").lean();
    const petCountMap = {};
    pets.forEach((p) => {
      if (p.ownerId) {
        const ownerKey = p.ownerId.toString();
        petCountMap[ownerKey] = (petCountMap[ownerKey] || 0) + 1;
      }
    });

    const formattedUsers = users.map((u) => ({
      _id: u._id,
      name: u.name,
      username: u.username,
      email: u.email,
      phone: u.phone,
      role: u.role || "user",
      status: u.status || "Active",
      joined: u.createdAt,
      pets: petCountMap[u._id.toString()] || 0
    }));

    res.json({ users: formattedUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users list" });
  }
});

// 3. Toggle User Status (Active/Inactive)
router.patch("/users/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status provided. Must be Active or Inactive." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Prevent deactivating own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot deactivate your own administrator account." });
    }

    user.status = status;
    await user.save();

    res.json({ message: `User status updated to ${status} successfully`, user: { _id: user._id, status: user.status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// 4. Change User Role (user / vet / admin)
router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !["user", "vet", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be user, vet, or admin." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Prevent changing own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot modify your own administrator role." });
    }

    user.role = role;
    await user.save();

    res.json({ message: `User role updated to ${role} successfully`, user: { _id: user._id, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

// 5. Get Recent Platform Activities
router.get("/activity", async (req, res) => {
  try {
    const activities = [];

    // Recent user registrations
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).lean();
    recentUsers.forEach((u) => {
      activities.push({
        type: "signup",
        message: `New user registered: ${u.name}`,
        time: u.createdAt
      });
    });

    // Recent adoptions
    const recentAdoptions = await Pet.find({ status: "Adopted" }).sort({ updatedAt: -1, createdAt: -1 }).limit(5).lean();
    recentAdoptions.forEach((p) => {
      activities.push({
        type: "adoption",
        message: `Pet adopted: ${p.name}`,
        time: p.updatedAt || p.createdAt
      });
    });

    // Recent orders
    const recentOrders = await Order.find().populate("user", "name").sort({ createdAt: -1 }).limit(5).lean();
    recentOrders.forEach((o) => {
      activities.push({
        type: "order",
        message: `New shop order from ${o.user?.name || "Customer"}`,
        time: o.createdAt
      });
    });

    // Recent bookings
    const recentBookings = await Booking.find().populate("serviceId").sort({ createdAt: -1 }).limit(5).lean();
    recentBookings.forEach((b) => {
      activities.push({
        type: "booking",
        message: `New service booked: ${b.serviceId?.name || "Service"}`,
        time: b.createdAt
      });
    });

    // Sort combined activities by timestamp descending
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Limit to top 8
    res.json({ activities: activities.slice(0, 8) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch activities feed" });
  }
});

// 6. Get pending vet approvals
router.get("/vets/pending", async (req, res) => {
  try {
    const pendingVets = await User.find({ role: "vet", isApprovedVet: false })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ vets: pendingVets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending veterinarians" });
  }
});

// 7. Approve veterinarian & automatically publish their clinic/service
router.patch("/vets/:id/approve", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "vet") return res.status(400).json({ error: "User is not a veterinarian" });

    user.isApprovedVet = true;
    await user.save();

    // Automatically register/create a Care Service center for the approved doctor
    const Service = require("../models/Service");
    const serviceName = user.clinicName || `${user.name}'s Pet Clinic`;
    
    let existingService = await Service.findOne({ name: serviceName });
    if (!existingService) {
      existingService = new Service({
        name: serviceName,
        category: "vet",
        phone: user.phone || "01700-000000",
        vetName: user.name,
        vetSpecialization: user.specialization || "General Veterinarian",
        location: {
          type: "Point",
          coordinates: [90.4125, 23.8103], // Dhaka coordinates
          address: user.location || "Dhaka, Bangladesh"
        },
        servicesOffered: ["Veterinary Consultation", "Health Checkup", "Pet Treatment"]
      });
      await existingService.save();
    } else {
      existingService.vetName = user.name;
      if (user.specialization) existingService.vetSpecialization = user.specialization;
      await existingService.save();
    }

    res.json({ message: "Veterinarian approved & clinic listed successfully", user: { _id: user._id, isApprovedVet: true } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve veterinarian" });
  }
});

// 8. Reject/Remove veterinarian registration
router.delete("/vets/:id/reject", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Delete the pending account to clean up
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Veterinarian registration rejected and removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject veterinarian" });
  }
});

// 9. Get Platform Adoption History
router.get("/adoptions", async (req, res) => {
  try {
    const AdoptionRequest = require("../models/AdoptionRequest");
    const PetAdoption = require("../models/PetAdoption");

    const requests = await AdoptionRequest.find()
      .populate("requesterId", "name email phone username")
      .populate("originalOwnerId", "name email phone username")
      .populate({
        path: "adoptionId",
        populate: {
          path: "PetID",
          model: "Pet",
          populate: {
            path: "ownerId",
            model: "User",
            select: "name email phone username"
          }
        }
      })
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch adoption details" });
  }
});

// 10. Get All Pets List for Admin
router.get("/pets", async (req, res) => {
  try {
    const pets = await Pet.find().populate("ownerId", "name email phone username").sort({ createdAt: -1 });
    res.json({ pets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pets list" });
  }
});

// 11. Get All Shop Orders for Admin
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email phone username").sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders list" });
  }
});

// 12. Get All Petcare Service Bookings for Admin
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email phone username")
      .populate("serviceId", "name category phone vetName vetSpecialization location")
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch service bookings list" });
  }
});

module.exports = router;
