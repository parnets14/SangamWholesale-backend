const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/Admin/categoryController");
const { adminProtect } = require("../../middleware/Middleware");
const upload = require("../../middleware/multer");

// Public route - Anyone can view categories
router.get("/all", categoryController.getAllCategories);

// Admin-only routes
router.post(
  "/",
  adminProtect,
  upload.single("icon"),
  categoryController.createCategory
);

router.put(
  "/:id",
  adminProtect,
  upload.single("icon"),
  categoryController.updateCategory
);

router.delete("/:id", adminProtect, categoryController.deleteCategory);

module.exports = router;
