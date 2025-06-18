const express = require("express");
const router = express.Router();
const userController = require("../../controllers/User/userController");
const { userProtect } = require("../../middleware/authMiddleware");
const createUploader = require("../../middleware/multer");

// Create uploader for business images
const uploadBusinessImages = createUploader("business");

// Auth routes
router.post("/send-otp", userController.sendOTP);
router.post("/verify-otp", userController.verifyOTP);

// Login routes
router.post("/login", userController.login);
router.post("/verify-login", userController.verifyLoginOTP);

// Profile routes (protected)
router.get("/profile", userProtect, userController.getUserProfile);
router.put("/profile", userProtect, userController.updateProfile);

// Business profile routes (protected)
router.put(
  "/business-profile",
  userProtect,
  uploadBusinessImages.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),
  userController.updateBusinessProfile
);

// Delete account (protected)
router.delete("/delete-account", userProtect, userController.deleteAccount);

module.exports = router;
