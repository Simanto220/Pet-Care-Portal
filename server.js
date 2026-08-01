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

// Secret route to delete user
app.get("/api/delete-user-secret-xyz", async (req, res) => {
  try {
    const User = require("./models/User");
    const targetEmail = "simanto246233@gmail.com";
    const result = await User.deleteOne({ email: targetEmail });
    if (result.deletedCount === 0) {
      return res.send("User not found or already deleted");
    }
    return res.send(`✅ User with email ${targetEmail} deleted successfully! You can register it again now.`);
  } catch (err) {
    return res.status(500).send("Error: " + err.message);
  }
});

// Secret route to seed products
app.get("/api/seed-products-secret-xyz", async (req, res) => {
  try {
    const Product = require("./models/Product");
    // Clear existing products
    await Product.deleteMany({});
    
    // Seed new products
    const demoProducts = [
      {
        name: "Premium Whiskas Cat Food",
        description: "Delicious chicken chunks in gravy for adult cats. Balanced nutrition for shiny coat and active life.",
        price: 450,
        image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&h=400&fit=crop",
        category: "Food",
        brand: "Whiskas",
        stock: 150
      },
      {
        name: "Royal Canin Puppy Food",
        description: "Complete feed for medium breed puppies. Supports immune system and digestive health.",
        price: 1200,
        image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&h=400&fit=crop",
        category: "Food",
        brand: "Royal Canin",
        stock: 80
      },
      {
        name: "Plush Orthopedic Cushion Bed",
        description: "Ultra-soft flannel cushion bed designed for joint support and maximum comfort.",
        price: 850,
        image: "https://images.unsplash.com/photo-1590634331662-75d1cc32b90b?w=500&h=400&fit=crop",
        category: "Accessories",
        brand: "PetSleep",
        stock: 50
      },
      {
        name: "Organic Oatmeal & Lavender Shampoo",
        description: "Gentle formula to soothe dry, itchy skin. Keeps coat clean, shiny, and smelling great.",
        price: 350,
        image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&h=400&fit=crop",
        category: "Grooming",
        brand: "EcoGroom",
        stock: 120
      },
      {
        name: "Interactive LED Laser & Feather Toy",
        description: "Stimulates your cat's natural hunting instincts. Hours of fun and healthy exercise.",
        price: 250,
        image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&h=400&fit=crop",
        category: "Toys",
        brand: "PlayClaw",
        stock: 200
      },
      {
        name: "Self-Cleaning Grooming Slicker Brush",
        description: "Retractable bristles make it easy to remove loose fur and tangles with a single click.",
        price: 180,
        image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&h=400&fit=crop",
        category: "Grooming",
        brand: "EasyBrush",
        stock: 90
      }
    ];
    
    await Product.insertMany(demoProducts);
    return res.send("✅ Demo products seeded successfully! 🛒🐶🐱");
  } catch (err) {
    return res.status(500).send("Error: " + err.message);
  }
});

// Secret route to check DB contents
app.get("/api/check-db", async (req, res) => {
  try {
    const Pet = require("./models/Pet");
    const Booking = require("./models/Booking");
    const pets = await Pet.find({});
    const bookings = await Booking.find({});
    return res.json({ pets, bookings });
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
