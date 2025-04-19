const express = require("express");
const router = express.Router();

const bannerController = require("../../controllers/Admin/bannerController");
const { adminProtect } = require("../../middleware/Middleware");
const createUploader = require("../../middleware/multer");

const uploadCategory = createUploader("banners");
// public route
router.get("/", bannerController.getAllBanners);

// Admin-only route
router.post(
  "/",
  adminProtect,
  uploadCategory.single("banner"),
  bannerController.createBanner
);

module.exports = router;
