const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/Admin/categoryController");
const { adminProtect } = require("../../middleware/authMiddleware");
const createUploader = require("../../middleware/multer");

// Create uploader for category images
const uploadCategoryImage = createUploader("categories");

// Category CRUD routes
router.post(
  "/",
  uploadCategoryImage.single("image"),
  adminProtect,
  categoryController.createCategory
);
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategory);
router.put(
  "/:id",
  uploadCategoryImage.single("image"),
  adminProtect,
  categoryController.updateCategory
);

router.delete("/:id", adminProtect, categoryController.deleteCategory);

module.exports = router;
