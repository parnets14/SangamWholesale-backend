const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/Admin/categoryController");
const { adminProtect } = require("../../middleware/Middleware");
// const upload = require("../../middleware/multer");
const createUploader = require("../../middleware/multer");
// Public route - Anyone can view categories
router.get("/", categoryController.getAllCategories);

// Admin-only routes
// For categories
const uploadCategory = createUploader("categories");
router.post(
  "/",
  adminProtect,
  uploadCategory.single("icon"),
  categoryController.createCategory
);

router.put(
  "/:id",
  adminProtect,
  uploadCategory.single("icon"),
  categoryController.updateCategory
);

router.delete("/:id", adminProtect, categoryController.deleteCategory);

module.exports = router;
