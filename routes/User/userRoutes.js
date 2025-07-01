const express = require("express");
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  createUser,
  getUser,
  updateuser,
  deleteUser,
  getAllUsers,
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
// Delete account (protected)
router.delete("/delete", userProtect, deleteUser);

module.exports = router;
