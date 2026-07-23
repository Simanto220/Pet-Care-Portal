const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    services: [String], // selected options (dog walking, pet sitting, etc.)
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    petName: { type: String, required: true },
    petType: { type: String, default: "Dog" },
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    notes: String,
    status: { type: String, default: "pending" }, // pending | confirmed | done
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
