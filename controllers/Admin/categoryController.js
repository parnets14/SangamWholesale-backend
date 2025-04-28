const Category = require("../../models/Admin/categoryModel");
const fs = require("fs");
const path = require("path");

// Public: Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    // Map categories to include full image URL
    const categoriesWithImages = categories.map((category) => ({
      ...category._doc,
      icon: category.icon,
    }));
    res.status(200).json({ success: true, categories: categoriesWithImages });
  } catch (error) {
    console.error("getAllCategories error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
};

// Admin only: Create new category
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Name and icon image are required",
      });
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      // Delete the uploaded file if category already exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      icon: req.file.filename,
    });

    res.status(201).json({
      success: true,
      message: "Category created",
      category: {
        ...category._doc,
        icon: req.file.filename,
      },
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error("createCategory error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create category" });
  }
};

// Admin only: Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Delete old image if new one is uploaded
    if (req.file) {
      const oldImagePath = path.join(
        __dirname,
        `../../uploads/categories/${category.icon}`
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      category.icon = req.file.filename;
    }

    if (name) category.name = name;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated",
      category: {
        ...category._doc,
        icon: req.file ? req.file.filename : category.icon,
      },
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("updateCategory error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update category" });
  }
};

// Admin only: Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Delete associated image
    const imagePath = path.join(
      __dirname,
      `../../uploads/categories/${category.icon}`
    );
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.status(200).json({
      success: true,
      message: "Category deleted",
    });
  } catch (error) {
    console.error("deleteCategory error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
