const express = require("express");
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  createUser,
  getUser,
  updateuser,
  deleteUser,
  adminDeleteUser,
  getAllUsers,
  getUserNotifications,
  saveFcmToken,
} = require("../../controllers/User/userController");
const {
  userProtect,
  adminProtect,
} = require("../../middleware/authMiddleware");
const createUploader = require("../../middleware/multer");

// Create uploader for business images
const uploadUserImages = createUploader("profileImage");

// Auth routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Profile routes (protected)
router.post("/profile", userProtect, createUser);
router.get("/profile", userProtect, getUser);
router.put(
  "/profile",
  userProtect,
  uploadUserImages.single("profileImage"),
  updateuser
);

router.get("/all", getAllUsers);
// Delete account (protected - user deletes their own account)
router.delete("/delete", userProtect, deleteUser);
// Admin deletes a customer by id
router.delete("/admin/:id", adminProtect, adminDeleteUser);
// Notification feed
router.get("/notifications", userProtect, getUserNotifications);
// FCM device token
router.post("/fcm-token", userProtect, saveFcmToken);

module.exports = router;
