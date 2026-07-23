const express = require("express");
const router = express.Router();
const { jwtVerification } = require("../middlewares/authMiddleware");
const careController = require("../controllers/careController");

// Public routes
router.get("/services", careController.getServices);
router.get("/services/slots/available", careController.getAvailableSlots);
router.get("/services/nearby", careController.getNearbyServices);
router.get("/services/:id", careController.getServiceById);

// Protected routes
router.use(jwtVerification);

router.post("/appointments", careController.bookAppointment);
router.get("/appointments", careController.getUserAppointments);
router.put("/appointments/:id", careController.updateAppointmentStatus);

// Admin routes for seeding
router.post("/services/seed", careController.seedServices);

module.exports = router;
