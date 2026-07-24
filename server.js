const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const PORT = Number(process.env.PORT) || 7000;
const mongoURL = process.env.MongoDB_URL || process.env.MONGO_URL;

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const petRoutes = require("./routes/petRoutes");
const adoptionRoutes = require("./routes/adoptionRoutes");
const shopRoutes = require("./routes/shopRoutes");
const careRoutes = require("./routes/careRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const vetRoutes = require("./routes/vetRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// Database connection
mongoose
  .connect(mongoURL)
  .then(async () => {
    console.log("MongoDB connected");
    try {
      const adminExists = await User.findOne({ role: "admin" });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash("admin1234", 10);
        await User.create({
          name: "System Admin",
          username: "admin",
          email: "admin@petcare.com",
          password: hashedPassword,
          phone: "01700000001",
          location: "Dhaka",
          role: "admin",
          isApproved: true
        });
        console.log("✅ Auto Seeded System Admin User");
      }
    } catch (err) {
      console.error("Auto seeding failed:", err);
    }
  })
  .catch((error) => console.log("Database connection failed:", error));

// Frontend CORS configuration (permissive for dev)
app.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/pet", petRoutes);
app.use("/adoption", adoptionRoutes);
app.use("/shop", shopRoutes);
app.use("/api/care", careRoutes);
app.use("/notifications", notificationRoutes);
app.use("/favorite", favoriteRoutes);

app.use("/api/bookings", bookingRoutes);
app.use("/api/vet", vetRoutes);
app.use("/api/admin", adminRoutes);

// Secret route to clear database for production demo
app.get("/api/clear-db-secret-xyz", async (req, res) => {
  try {
    const User = require("./models/User");
    const Pet = require("./models/Pet");
    const Product = require("./models/Product");
    const Service = require("./models/Service");
    const PetAdoption = require("./models/PetAdoption");
    const AdoptionHome = require("./models/AdoptionHome");
    const AdoptionRequest = require("./models/AdoptionRequest");
    const Appointment = require("./models/Appointment");
    const Booking = require("./models/Booking");
    const Cart = require("./models/Cart");
    const Favorite = require("./models/Favorite");
    const MedicalRecord = require("./models/MedicalRecord");
    const Notification = require("./models/Notification");
    const Order = require("./models/Order");
    const OtpCache = require("./models/OtpCache");

    // Delete all except admin users
    await User.deleteMany({ role: { $ne: "admin" } });
    await Pet.deleteMany({});
    await Product.deleteMany({});
    await Service.deleteMany({});
    await PetAdoption.deleteMany({});
    await AdoptionHome.deleteMany({});
    await AdoptionRequest.deleteMany({});
    await Appointment.deleteMany({});
    await Booking.deleteMany({});
    await Cart.deleteMany({});
    await Favorite.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Notification.deleteMany({});
    await Order.deleteMany({});
    await OtpCache.deleteMany({});

    return res.send("✅ Live database cleared successfully! Admin users kept.");
  } catch (err) {
    return res.status(500).send("Error clearing database: " + err.message);
  }
});

// Secret route to reset user password
app.get("/api/reset-user-secret-xyz", async (req, res) => {
  try {
    const User = require("./models/User");
    const bcrypt = require("bcryptjs");
    const targetEmail = "simanto246233@gmail.com";
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const newPass = "12345678";
    user.password = await bcrypt.hash(newPass, 10);
    await user.save();
    return res.send(`✅ Username is: ${user.username} | Password reset to: ${newPass}`);
  } catch (err) {
    return res.status(500).send("Error: " + err.message);
  }
});

// Global Error Handler for JSON responses
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 400).json({ message: err.message || "Server Error" });
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
