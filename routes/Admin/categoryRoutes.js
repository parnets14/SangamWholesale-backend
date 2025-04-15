const express = require("express");
const router = express.Router();

const categoryController = require("../../controllers/Category/categoryController");
const protect = require("../../middleware/authMiddleware");
const isAdmin = require("../../middleware/isAdmin");

// Public route - Anyone can view categories
router.get("/categories", categoryController.getAllCategories);

// Admin-only routes
router.post("/categories", protect, isAdmin, categoryController.createCategory);
router.put("/categories/:id", protect, isAdmin, categoryController.updateCategory);
router.delete("/categories/:id", protect, isAdmin, categoryController.deleteCategory);

module.exports = router;
