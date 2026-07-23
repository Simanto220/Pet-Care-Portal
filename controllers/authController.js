const bcrypt = require("bcryptjs");
const User = require("../models/User");
const fs = require('fs'); // Import fs
const path = require('path'); // Import path

// JWT Verification
const jwt = require("jsonwebtoken");
const { secret } = require("../config/jwtSecret");

// Helper function to handle profile photo upload for users
const handleUserProfilePhotoUpload = async (userId, file) => {
  let profilePhotoUrl = null;

  if (!file) {
    return profilePhotoUrl;
  }

  const now = new Date();
  const creationDate = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;
  const serial = String(Date.now()).slice(-5);
  const newFileName = `${userId}_profile_${creationDate}_${serial}${path.extname(file.originalname)}`;
  const oldPath = file.path;
  const userPhotoDir = path.join(__dirname, '../uploads/photos/users', userId.toString()); // User-specific directory
  const newPath = path.join(userPhotoDir, newFileName);

  // Create user-specific directory if it doesn't exist
  if (!fs.existsSync(userPhotoDir)) {
    await fs.promises.mkdir(userPhotoDir, { recursive: true });
  }

  await fs.promises.rename(oldPath, newPath);
  profilePhotoUrl = `/uploads/photos/users/${userId.toString()}/${newFileName}`; // Correct path

  return profilePhotoUrl;
};

const createNewUser = async (req, res) => {
  const { name, username, email, password, phone, location, role, licenseNumber, specialization, clinicName } = req.body; // profilePhoto will be from req.file

  if (!username || !password || !name || !email || !phone) {
    // Clean up uploaded file if validation fails
    if (req.file) {
      await fs.promises.unlink(req.file.path).catch(err => console.error("Error cleaning up temp file:", err));
    }
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  // Validate phone number format (Bangladeshi mobile only)
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  const bdRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

  if (!bdRegex.test(cleanPhone)) {
    if (req.file) {
      await fs.promises.unlink(req.file.path).catch(err => console.error("Error cleaning up temp file:", err));
    }
    return res.status(400).json({ error: "Please enter a valid Bangladeshi mobile number (e.g., 01XXXXXXXXX or +8801XXXXXXXXX)" });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Set up role and approved status
    const userRole = role === "vet" ? "vet" : "user";
    const isApprovedVet = userRole === "vet" ? false : undefined;

    const user = new User({
      username,
      name,
      email,
      password: hashedPassword,
      phone,
      location,
      role: userRole,
      licenseNumber: userRole === "vet" ? licenseNumber : undefined,
      specialization: userRole === "vet" ? specialization : undefined,
      clinicName: userRole === "vet" ? clinicName : undefined,
      isApprovedVet,
    });
    const savedUser = await user.save(); // Save user to get _id

    let profilePhotoUrl = null;
    if (req.file) {
      profilePhotoUrl = await handleUserProfilePhotoUpload(savedUser._id, req.file);
      savedUser.profilePhoto = profilePhotoUrl;
      await savedUser.save(); // Save again with profile photo URL
    }

    // Return user data without password
    const userData = {
      id: savedUser._id,
      username: savedUser.username,
      name: savedUser.name,
      email: savedUser.email,
      phone: savedUser.phone,
      location: savedUser.location,
      profilePhoto: savedUser.profilePhoto,
      phoneVerified: savedUser.phoneVerified,
      role: savedUser.role || "user",
      isApprovedVet: savedUser.isApprovedVet,
      licenseNumber: savedUser.licenseNumber,
      specialization: savedUser.specialization,
      clinicName: savedUser.clinicName,
    };

    res.status(201).json({
      message: "User created successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Error inserting user:", error);
    // Clean up uploaded file on error
    if (req.file) {
      await fs.promises.unlink(req.file.path).catch(err => console.error("Error cleaning up temp file:", err));
    }
    return res.status(500).json({ error: "Server error" });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  const { username } = req.user;
  const { name, updatedusername, email, phone, password, location, bio } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    console.log(user);
    console.log(name, updatedusername, email, phone, password);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check and update the username
    if (updatedusername && updatedusername !== user.username) {
      const usernameExists = await User.findOne({ username: updatedusername });
      if (usernameExists) {
        return res.status(400).json({ message: "Username already exists" });
      }
      user.username = updatedusername;
    }

    // Check and update the email
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
      user.email = email;
    }

    // Check and update the phone
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({ message: "Phone number already exists" });
      }
      user.phone = phone;
      user.phoneVerified = false; // Reset phone verification status
    }

    // Update other fields
    if (name) user.name = name;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (password) user.password = await bcrypt.hash(password, 10);

    // Update profile photo if a new file is uploaded
    if (req.file) {
      if (user.profilePhoto) {
        const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
        fs.promises.unlink(oldPhotoPath).catch(err => console.error("Error deleting old profile photo:", err));
      }
      const profilePhotoUrl = await handleUserProfilePhotoUpload(user._id, req.file);
      user.profilePhoto = profilePhotoUrl;
    }

    // Save the updated user
    const updatedUser = await user.save();
    console.log(updatedUser);

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        name: updatedUser.name,
        profilePhoto: updatedUser.profilePhoto,
        phoneVerified: updatedUser.phoneVerified,
        role: updatedUser.role || "user",
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

// UPDATED LOGIN FUNCTION - Now includes user data
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt with username:", username, password);
  // Validate user input
  if (!username || !password) {
    return res.status(400).json({ error: "Please provide all fields" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({ error: "Your account has been deactivated by an administrator." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role || "user",
      },
      secret,
      {
        expiresIn: "24h", // Extended to 24 hours
      }
    );

    // Prepare user data to send to frontend (excluding password)
    const userData = {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      role: user.role || "user",
      displayName: user.name, // For navbar compatibility
      photoURL: user.profilePhoto || null, // Use profilePhoto from User model
      isApprovedVet: user.isApprovedVet,
      licenseNumber: user.licenseNumber,
      specialization: user.specialization,
      clinicName: user.clinicName,
    };

    res.status(200).json({
      token,
      user: userData,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Format user data consistently
    const userData = {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location, // Include location
      bio: user.bio, // Include bio
      phoneVerified: user.phoneVerified,
      role: user.role || "user",
      displayName: user.name,
      photoURL: user.profilePhoto || null, // Use profilePhoto from User model
    };

    res.json(userData);
  } catch (error) {
    console.error("Error getting user info:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Twilio - OTP Verification
require("dotenv").config();
const twilio = require("twilio");
const OtpCache = require("../models/OtpCache");
const client = new twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOtp = async (req, res) => {
  const { phone } = req.body;

  try {
    // Check if the user exists and is already verified
    const user = await User.findOne({ phone });
    if (user && user.phoneVerified) {
      return res.status(400).send("User is already verified");
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Send OTP using Twilio
    await client.messages.create({
      body: `Your Petcare OTP is ${otp}`,
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    // Save the OTP in the cache
    await OtpCache.create({ phone, otp });

    res.status(200).send("OTP sent successfully");
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send("Server error");
  }
};

const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  const record = await OtpCache.findOne({ phone });
  if (!record || record.otp !== otp) {
    console.log(record);
    return res.status(400).send("Invalid OTP");
  }

  // OTP is valid, authenticate user
  const user = await User.findOne({ phone });
  if (!user) {
    return res.status(404).send("User not found");
  }

  user.phoneVerified = true;
  await user.save();

  await OtpCache.deleteOne({ phone });

  res.status(200).send("OTP verified successfully");
};

module.exports = {
  createNewUser,
  loginUser,
  getUserInfo,
  sendOtp,
  verifyOtp,
  updateUserProfile,
};
