const express = require("express");
const router = express.Router();

const bannerController = require("../../controllers/Admin/bannerController");
const { adminProtect } = require("../../middleware/Middleware");
const createUploader = require("../../middleware/multer");

const uploadCategory = createUploader("banners");

// Public routes
router.get("/", bannerController.getAllBanners);

// Admin-only routes
router.post(
  "/",
  adminProtect,
  uploadCategory.single("banner"),
  bannerController.createBanner
);

router.put(
  "/:id",
  adminProtect,
  uploadCategory.single("banner"),
  bannerController.updateBanner
);

router.delete("/:id", adminProtect, bannerController.deleteBanner);

module.exports = router;
