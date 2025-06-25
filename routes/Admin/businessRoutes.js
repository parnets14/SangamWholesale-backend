const express = require("express");
const router = express.Router();
const {
  getAllBusinesses,
  approveBusiness,
  getPendingBusinesses,
} = require("../../controllers/User/businessController");
const { adminProtect } = require("../../middleware/authMiddleware");

// Admin business routes (protected - admin only)
router.get("/all", adminProtect, getAllBusinesses);
router.get("/pending", adminProtect, getPendingBusinesses);
router.put("/approve/:businessId", adminProtect, approveBusiness);

module.exports = router; 