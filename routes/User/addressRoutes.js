const express = require("express");
const router = express.Router();
const addressController = require("../../controllers/User/addressController");
const { userProtect } = require("../../middleware/Middleware");

// Create a new address
router.post("/", userProtect, addressController.createAddress);

// Get all addresses for user
router.get("/", userProtect, addressController.getUserAddresses);

// Get single address
router.get("/:id", userProtect, addressController.getAddress);

// Update address
router.put("/:id", userProtect, addressController.updateAddress);

// Delete address
router.delete("/:id", userProtect, addressController.deleteAddress);

// Set default address
router.patch(
  "/:id/set-default",
  userProtect,
  addressController.setDefaultAddress
);

module.exports = router;
