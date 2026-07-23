const express = require("express");
const Booking = require("../models/Booking");
const { jwtVerification } = require("../middlewares/authMiddleware");
const {
  createBooking,
  getBookings,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/", jwtVerification, createBooking); // create a new booking (requires auth to link user)
router.get("/", getBookings); // list all bookings (admin view)
router.get("/my", jwtVerification, async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ userId })
      .populate("serviceId", "name category location phone servicesOffered")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Cancel/Delete a booking
router.delete("/:id", jwtVerification, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    // Verify user ownership or admin role
    if (booking.userId && booking.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized to cancel this booking" });
    }
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

module.exports = router;
