

const express = require("express");
const router = express.Router();
const userController = require("../../controllers/User/userController");
const protect = require("../../middleware/authMiddleware");

// ========================
// Public Routes (No Auth)
// ========================

// Send OTP to phone number
router.post("/send-otp", userController.sendOTP);

// Verify OTP and login/register user
router.post("/verify-otp", userController.verifyOTP);

// ==========================
//  Protected Routes (Require JWT)
// ==========================

// Complete user profile (Register after OTP)
router.post("/register", protect, userController.register);

// Get current user's profile
router.get("/profile", protect, userController.getProfile);

// Update current user's profile
router.put("/profile/update", protect, userController.updateProfile);

// (Optional Admin) Get all user profiles
router.get("/allUser", protect, userController.getAllProfiles);
module.exports = router;
