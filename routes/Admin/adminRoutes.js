const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/Admin/adminController");
const { adminProtect } = require("../../middleware/authMiddleware");

// Public routes
router.post("/register", adminController.adminRegister);
router.post("/login", adminController.adminLogin);

// Protected routes
router.get("/:id", adminProtect, adminController.getAdminById);
router.put("/:id", adminProtect, adminController.updateAdmin);
router.delete("/:id", adminProtect, adminController.deleteAdmin);

module.exports = router;
