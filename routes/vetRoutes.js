const express = require("express");
const router = express.Router();
const { jwtVerification } = require("../middlewares/authMiddleware");
const Pet = require("../models/Pet");
const Booking = require("../models/Booking");
const MedicalRecord = require("../models/MedicalRecord");
const User = require("../models/User");

// Middleware to verify that veterinarian has been approved by admin
const verifyApprovedVet = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user && user.role === "vet" && user.isApprovedVet) {
      next();
    } else {
      res.status(403).json({ error: "Access denied. Approved veterinarian authorization required." });
    }
  } catch (err) {
    console.error("Error in verifyApprovedVet middleware:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Protect all routes in this router
router.use(jwtVerification);
router.use(verifyApprovedVet);

// 1. Get pet patients specific to the logged-in doctor's bookings
router.get("/patients", async (req, res) => {
  try {
    const doctorName = req.user.name || "";

    const bookings = await Booking.find()
      .populate("serviceId", "vetName")
      .lean();

    // Filter bookings assigned to this doctor
    const doctorBookings = bookings.filter((b) => {
      if (!b.serviceId || !b.serviceId.vetName) return true;
      const serviceVet = b.serviceId.vetName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const loggedVet = doctorName.toLowerCase().replace(/[^a-z0-9]/g, "");
      return serviceVet.includes(loggedVet) || loggedVet.includes(serviceVet) || loggedVet.includes("admin");
    });

    const bookedPetNames = doctorBookings.map((b) => b.petName?.toLowerCase()).filter(Boolean);

    const allPets = await Pet.find()
      .populate("ownerId", "name email phone location")
      .sort({ createdAt: -1 });

    const doctorPatients = allPets.filter((p) => {
      if (doctorName.toLowerCase().includes("admin")) return true;
      return bookedPetNames.includes(p.name?.toLowerCase());
    });

    res.json({ pets: doctorPatients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pet patients" });
  }
});

// 2. Get appointments specifically assigned to the logged-in doctor
router.get("/appointments", async (req, res) => {
  try {
    const doctorName = req.user.name || "";

    const bookings = await Booking.find()
      .populate("serviceId", "name category location phone servicesOffered vetName vetSpecialization")
      .sort({ createdAt: -1 });

    // Filter bookings where the service's designated doctor matches the logged-in doctor
    const doctorBookings = bookings.filter((b) => {
      if (!b.serviceId || !b.serviceId.vetName) return true; // show if general service
      const serviceVet = b.serviceId.vetName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const loggedVet = doctorName.toLowerCase().replace(/[^a-z0-9]/g, "");
      return serviceVet.includes(loggedVet) || loggedVet.includes(serviceVet) || loggedVet.includes("admin");
    });

    res.json({ appointments: doctorBookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch vet appointments" });
  }
});

// 3. Update appointment (booking) status
router.patch("/appointments/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: "Status updated successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update appointment status" });
  }
});

// 4. Get medical records written by the logged-in doctor
router.get("/records", async (req, res) => {
  try {
    let filter = {};
    if (req.user && req.user.role !== "admin") {
      filter.vetId = req.user._id;
    }
    const records = await MedicalRecord.find(filter)
      .populate("petId", "name species breed color dateOfBirth profilePhoto")
      .populate("vetId", "name email phone specialization clinicName")
      .sort({ createdAt: -1 });
    res.json({ records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch medical records" });
  }
});

// 5. Create a new medical record
router.post("/records", async (req, res) => {
  try {
    const { petId, details, vaccinationRecords } = req.body;
    const vetId = req.user._id;

    if (!petId || !details) {
      return res.status(400).json({ error: "Pet ID and diagnosis details are required" });
    }

    const record = new MedicalRecord({
      petId,
      vetId,
      details,
      vaccinationRecords: vaccinationRecords || [],
    });

    await record.save();
    
    // Populate before sending response
    await record.populate([
      { path: "petId", select: "name species breed color dateOfBirth profilePhoto" },
      { path: "vetId", select: "name email phone" }
    ]);

    res.status(201).json({ message: "Medical record added successfully", record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create medical record" });
  }
});

module.exports = router;
