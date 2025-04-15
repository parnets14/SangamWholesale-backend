const express = require("express");
const router = express.Router();

const categoryController = require("../../controllers/Admin/categoryController");
const protect = require("../../middleware/authMiddleware");
const isAdmin = require("../../middleware/isAdmin");

// Public route - Anyone can view categories
router.get("/", protect, categoryController.getAllCategories);

// Admin-only routes
router.post("/", protect, isAdmin, categoryController.createCategory);
router.put("/:id", protect, isAdmin, categoryController.updateCategory);
router.delete("/:id", protect, isAdmin, categoryController.deleteCategory);

module.exports = router;
