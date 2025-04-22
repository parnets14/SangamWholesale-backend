const express = require("express");
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  resendOTP,
  completeRegistration,
  getProfile,
  updateProfile,
} = require("../../controllers/Driver/driverController");
const { driverProtect } = require("../../middleware/Middleware");

const createUploader = require("../../middleware/multer");
const uploadDriver = createUploader("driver");

// Public routes
router.post("/send", sendOTP);
router.post("/verify", verifyOTP);
router.post("/resendotp", resendOTP);

// Registration with documents (protected after OTP verification)
router.post("/complete-registration", completeRegistration);

// Protected routes (require valid JWT)
router.get("/profile", driverProtect, getProfile);
router.put(
  "/profile",
  driverProtect,
  uploadDriver.single("aadharFront"),
  uploadDriver.single("aadharBack"),
  uploadDriver.single("panImage"),
  uploadDriver.single("dlImage"),
  updateProfile
);

module.exports = router;
