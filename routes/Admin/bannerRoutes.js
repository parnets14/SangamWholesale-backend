const express = require("express");
const router = express.Router();
const bannerController = require("../../controllers/Admin/bannerController");
const { adminProtect } = require("../../middleware/authMiddleware");
const createUploader = require("../../middleware/multer");

// Create uploader for banner images
const uploadBannerImage = createUploader("banners");

// Banner CRUD routes (only add and get)
router.post(
  "/",
  uploadBannerImage.single("image"),
  adminProtect,
  bannerController.createBanner
);
router.get("/", bannerController.getAllBanners);
router.get("/:id", bannerController.getBanner);
router.put(
  "/:id",
  uploadBannerImage.single("image"),
  adminProtect,
  bannerController.updateBanner
);
router.delete("/:id", adminProtect, bannerController.deleteBanner);

module.exports = router; 