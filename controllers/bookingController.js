const Booking = require("../models/Booking");

exports.createBooking = async (req, res) => {
  try {
    const bookingData = { ...req.body };
    if (req.user) {
      bookingData.userId = req.user._id;
    }
    const booking = new Booking(bookingData);
    await booking.save();
    res.json({ message: "Booking created successfully!", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("serviceId");
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};
