const express = require("express");
const router = express.Router();
const driverController = require("../../controllers/Delivery/driverController");
const { driverProtect } = require("../../middleware/Delivery/driverMiddleware");
const createUploader = require("../../middleware/multer");

// KYC document images are saved under uploads/driverDocs (served at /driverDocs).
const uploadDocs = createUploader("driverDocs");
const kycFields = uploadDocs.fields([
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
  { name: "panImage", maxCount: 1 },
  { name: "dlImage", maxCount: 1 },
]);

// Run the multer upload but never let a file error abort registration —
// if a file is rejected (bad type/size) we log it and continue with whatever
// files did parse, so the account is still created.
const kycUpload = (req, res, next) => {
  kycFields(req, res, (err) => {
    if (err) {
      console.error("KYC upload error:", err.message);
    }
    next();
  });
};

// Strict upload for doc updates — return error if file rejected
const kycUploadStrict = (req, res, next) => {
  kycFields(req, res, (err) => {
    if (err) {
      console.error("KYC upload error:", err.message);
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Register a new delivery partner (with optional KYC document images)
router.post("/register", kycUpload, driverController.registerDriver);

// Login: send + verify OTP
router.post("/send-otp", driverController.sendOTP);
router.post("/verify-otp", driverController.verifyOTP);

// Logged-in driver profile (view + update)
router.get("/me", driverProtect, driverController.getProfile);
router.put("/me", driverProtect, driverController.updateProfile);
// Update KYC documents
router.put("/me/docs", driverProtect, kycUploadStrict, driverController.updateDocs);

// Save FCM device token for push notifications
router.post("/fcm-token", driverProtect, driverController.saveFcmToken);

module.exports = router;
