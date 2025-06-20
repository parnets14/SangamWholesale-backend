const Subcategory = require("../../models/Admin/subcategoryModel");
const Category = require("../../models/Admin/categoryModel");

// Create Subcategory
exports.createSubcategory = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;

    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const existing = await Subcategory.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Subcategory already exists" });

    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    const subcategory = await Subcategory.create({
      name,
      description,
      image: req.file.filename.replace(/\\/g, "/"),
      category: categoryId,
    });

    res.status(201).json({ message: "Subcategory created", subcategory });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating subcategory", error: error.message });
  }
};

// Get All Subcategories
exports.getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({ count: subcategories.length, subcategories });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching subcategories", error: error.message });
  }
};

// Get Subcategories by Category ID
exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const subcategories = await Subcategory.find({
      category: req.params.categoryId,
    })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({ count: subcategories.length, subcategories });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching subcategories", error: error.message });
  }
};

// Get Single Subcategory
exports.getSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate(
      "category",
      "name"
    );

    if (!subcategory)
      return res.status(404).json({ message: "Subcategory not found" });

    res.json({ subcategory });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching subcategory", error: error.message });
  }
};

// Update Subcategory
exports.updateSubcategory = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;

    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory)
      return res.status(404).json({ message: "Subcategory not found" });

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category)
        return res.status(404).json({ message: "Category not found" });
    }

    if (name && name !== subcategory.name) {
      const exists = await Subcategory.findOne({ name });
      if (exists) return res.status(400).json({ message: "Name already used" });
    }

    const updateData = {
      name: name || subcategory.name,
      description: description || subcategory.description,
      category: categoryId || subcategory.category,
    };

    if (req.file) {
      updateData.image = req.file.filename.replace(/\\/g, "/");
    }

    const updated = await Subcategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("category", "name");

    res.json({ message: "Subcategory updated", subcategory: updated });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating subcategory", error: error.message });
  }
};

// Delete Subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory)
      return res.status(404).json({ message: "Subcategory not found" });

    res.json({ message: "Subcategory deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting subcategory", error: error.message });
  }
};
