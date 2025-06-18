const express = require("express");
const router = express.Router();
const subcategoryController = require("../../controllers/Admin/subcategoryController");
const { adminProtect } = require("../../middleware/authMiddleware");
const createUploader = require("../../middleware/multer");

// Create uploader for subcategory images
const uploadSubcategoryImage = createUploader("subcategories");

// Subcategory CRUD routes
router.post(
  "/",
  uploadSubcategoryImage.single("image"),
  adminProtect,
  subcategoryController.createSubcategory
);

router.get("/", subcategoryController.getAllSubcategories);
router.get("/category/:categoryId", subcategoryController.getSubcategoriesByCategory);
router.get("/:id", subcategoryController.getSubcategory);

router.put(
  "/:id",
  uploadSubcategoryImage.single("image"),
  adminProtect,
  subcategoryController.updateSubcategory
);

router.delete("/:id", adminProtect, subcategoryController.deleteSubcategory);

module.exports = router; 