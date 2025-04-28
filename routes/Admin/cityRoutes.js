const express = require("express");
const router = express.Router();
const cityController = require("../../controllers/Admin/cityController");
const { adminProtect } = require("../../middleware/Middleware");
// const upload = require("../../middleware/multer");
const createUploader = require("../../middleware/multer");

// For categories
const uploadCategory = createUploader("cities");

// Public routes
router.get("/", cityController.getAllCities);

// Admin-protected routes

router.post(
  "/",
  adminProtect,
  uploadCategory.single("icon"),
  cityController.createCity
);

router.put(
  "/:id",
  adminProtect,
  uploadCategory.single("icon"),
  cityController.updateCity
);

router.delete("/:id", adminProtect, cityController.deleteCity);

module.exports = router;
