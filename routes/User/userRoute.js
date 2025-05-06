const express = require("express");
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  register,
  getProfile,
  updateProfile,
  getAllProfiles,
} = require("../../controllers/User/userController");
const { userProtect, adminProtect } = require("../../middleware/Middleware");

// ========================
// Public Routes (No Auth)
// ========================

// Send OTP to phone number
router.post("/send-otp", sendOTP);

// Verify OTP and login/register user
router.post("/verify-otp", verifyOTP);

// ==========================
//  Protected Routes (Require JWT)
// ==========================

// Complete user profile (Register after OTP)
router.post("/register", userProtect, register);

// Get current user's profile
router.get("/profile", userProtect, getProfile);

// Update current user's profile
router.put("/profile/update", userProtect, updateProfile);

// (Optional Admin) Get all user profiles
router.get("/allUser", adminProtect, getAllProfiles);
module.exports = router;
