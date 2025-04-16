const express = require("express");
const router = express.Router();
const cityController = require("../../controllers/Admin/cityController");
const { adminProtect } = require("../../middleware/Middleware");
const upload = require("../../middleware/multer");

// Public routes
router.get("/all", cityController.getAllCities);

// Admin-protected routes
router.post(
  "/",
  adminProtect,
  upload.single("icon"),
  cityController.createCity
);

router.put(
  "/:id",
  adminProtect,
  upload.single("icon"),
  cityController.updateCity
);

router.delete("/:id", adminProtect, cityController.deleteCity);

module.exports = router;
