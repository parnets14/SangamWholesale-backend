const Category = require("../../models/Admin/categoryModel");

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required" });
    }

    const existing = await Category.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({
      name,
      description,
      image: req.file ? req.file.filename.replace(/\\/g, "/") : null,
    });

    res.status(201).json({ message: "Created", category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Categories
exports.getAllCategories = async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ count: categories.length, categories });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Single Category
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Not found" });

    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Not found" });

    if (name && name !== category.name) {
      const exists = await Category.findOne({ name });
      if (exists) return res.status(400).json({ message: "Name already used" });
    }

    category.name = name || category.name;
    category.description = description || category.description;
    if (req.file) category.image = req.file.filename.replace(/\\/g, "/");

    const updated = await category.save();
    res.json({ message: "Updated", category: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
