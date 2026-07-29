const express = require("express");
const router = express.Router();
const {
  createBusiness,
  getBusiness,
  updateBusiness,
  deleteBusiness,
} = require("../../controllers/User/businessController");
const { userProtect } = require("../../middleware/authMiddleware");
const createUploader = require("../../middleware/multer");

// Create uploader for business images
const uploadBusinessImages = createUploader("business");

// Business routes (protected - user only)
router.post(
  "/create",
  userProtect,
  uploadBusinessImages.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),
  createBusiness
);

router.get("/get", userProtect, getBusiness);

router.put(
  "/update",
  userProtect,
  uploadBusinessImages.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
  ]),
  updateBusiness
);

router.delete("/delete", userProtect, deleteBusiness);

module.exports = router;
