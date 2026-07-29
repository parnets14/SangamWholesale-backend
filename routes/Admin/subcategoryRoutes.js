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
  adminProtect,
  (req, res, next) => {
    uploadSubcategoryImage.single("image")(req, res, (err) => {
      if (err) {
        // Handle multer errors (file filter, size limit, etc.)
        if (err.message && err.message.includes("Only image files")) {
          return res.status(400).json({ message: err.message });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File size too large. Maximum size is 5MB." });
        }
        return res.status(400).json({ message: err.message || "File upload error" });
      }
      next();
    });
  },
  subcategoryController.createSubcategory
);

router.get("/", subcategoryController.getAllSubcategories);
router.get("/category/:categoryId", subcategoryController.getSubcategoriesByCategory);
router.get("/:id", subcategoryController.getSubcategory);

router.put(
  "/:id",
  adminProtect,
  (req, res, next) => {
    uploadSubcategoryImage.single("image")(req, res, (err) => {
      if (err) {
        // Handle multer errors
        if (err.message && err.message.includes("Only image files")) {
          return res.status(400).json({ message: err.message });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File size too large. Maximum size is 5MB." });
        }
        return res.status(400).json({ message: err.message || "File upload error" });
      }
      next();
    });
  },
  subcategoryController.updateSubcategory
);

router.delete("/:id", adminProtect, subcategoryController.deleteSubcategory);

module.exports = router; 