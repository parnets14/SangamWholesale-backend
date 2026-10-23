const Category = require("../../models/Admin/categoryModel");

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, order } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await Category.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({
      name,
      description: description || "",
      image: req.file ? req.file.filename.replace(/\\/g, "/") : null,
      order:
        order !== undefined && order !== null && String(order).trim() !== ""
          ? Number(order)
          : null,
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
    const categories = await Category.find();
    // Sort by explicit order (ascending); items with no order go last,
    // and ties fall back to creation order (oldest first).
    const sorted = categories.sort((a, b) => {
      const ao = typeof a.order === "number" ? a.order : Infinity;
      const bo = typeof b.order === "number" ? b.order : Infinity;
      if (ao !== bo) return ao - bo;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    res.json({ count: sorted.length, categories: sorted });
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
    const { name, description, order } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Not found" });

    if (name && name !== category.name) {
      const exists = await Category.findOne({ name });
      if (exists) return res.status(400).json({ message: "Name already used" });
    }

    category.name = name || category.name;
    // description is optional — allow clearing it by sending an empty string
    if (description !== undefined) category.description = description;
    // order is optional — blank clears it (sorts last)
    if (order !== undefined) {
      category.order =
        order === null || String(order).trim() === "" ? null : Number(order);
    }
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
