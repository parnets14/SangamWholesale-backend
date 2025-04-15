const Category = require("../../models/Category/categoryModel");

// Public: Get all categories?
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("getAllCategories error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

// Admin only: Create new category
const createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;

    if (!name || !icon) {
      return res.status(400).json({ success: false, message: "Name and icon are required" });
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({ name, icon });
    res.status(201).json({ success: true, message: "Category created", category });
  } catch (error) {
    console.error("createCategory error:", error);
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
};

// Admin only: Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, icon },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category updated", category });
  } catch (error) {
    console.error("updateCategory error:", error);
    res.status(500).json({ success: false, message: "Failed to update category" });
  }
};

// Admin only: Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("deleteCategory error:", error);
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
