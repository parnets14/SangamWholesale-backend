const express = require("express");
const router = express.Router();
const driverController = require("../../controllers/Delivery/driverController");
const { adminProtect } = require("../../middleware/authMiddleware");

// All routes here are admin-only.
router.get("/", adminProtect, driverController.adminGetAllDrivers);
router.get("/:id", adminProtect, driverController.adminGetDriver);
router.delete("/:id", adminProtect, driverController.adminDeleteDriver);
router.put("/:id/block", adminProtect, driverController.adminSetBlockStatus);

module.exports = router;
