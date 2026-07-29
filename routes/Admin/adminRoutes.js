const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/Admin/adminController");
const { adminProtect } = require("../../middleware/authMiddleware");

// Create initial admin
router.get("/get", adminController.createInitialAdmin);

// Admin login
router.post("/login", adminController.adminLogin);

// Get admin profile (protected route)
router.get("/profile", adminProtect, adminController.getAdminProfile);

module.exports = router;
