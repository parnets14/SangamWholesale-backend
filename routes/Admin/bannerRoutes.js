const express = require("express");
const router = express.Router();

const bannerController = require("../../controllers/Admin/bannerController");
// const { adminProtect } = require("../../middleware/Middleware");
const createUploader = require("../../middleware/multer");

const uploadBanner = createUploader("banners");

// Public routes
router.get("/getbanner", bannerController.getAllBanner);

// Admin-only routes
router.post(
  "/addbanner",
  uploadBanner.any(),
  bannerController.createBanner
);

router.put(
  "/updatebanner/:id",
   uploadBanner.any(),
  bannerController.updateBanner
);

router.delete("/deletebanner/:id", bannerController.deleteBanner);

module.exports = router;
