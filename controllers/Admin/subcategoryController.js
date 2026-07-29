const mongoose = require("mongoose");
const Subcategory = require("../../models/Admin/subcategoryModel");
const Category = require("../../models/Admin/categoryModel");

// Create Subcategory
exports.createSubcategory = async (req, res) => {
  try {
    console.log("=== CREATE SUBCATEGORY REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Request body keys:", Object.keys(req.body || {}));
    console.log("Request file:", req.file ? { filename: req.file.filename, size: req.file.size } : "No file");
    console.log("Request headers:", req.headers.authorization ? "Token present" : "No token");
    
    const { name, description, categoryId } = req.body;
    
    console.log("Extracted values:", { name, description, categoryId });

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Subcategory name is required" });
    }
    if (!description) {
      return res.status(400).json({ message: "Subcategory description is required" });
    }
    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    // Validate categoryId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID format" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      console.log(`Category not found with ID: ${categoryId}`);
      return res.status(404).json({ message: "Category not found" });
    }

    const existing = await Subcategory.findOne({ name });
    if (existing) {
      console.log(`Subcategory already exists with name: ${name}`);
      return res.status(400).json({ message: "Subcategory already exists" });
    }

    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ message: "Image is required" });
    }

    console.log("Creating subcategory with data:", {
      name,
      description,
      image: req.file.filename,
      category: categoryId
    });

    const subcategory = await Subcategory.create({
      name: name.trim(),
      description: description.trim(),
      image: req.file.filename.replace(/\\/g, "/"),
      category: categoryId,
    });

    console.log("Subcategory created successfully:", subcategory._id);
    res.status(201).json({ message: "Subcategory created", subcategory });
  } catch (error) {
    console.error("=== ERROR CREATING SUBCATEGORY ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: errors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Subcategory with this name already exists" 
      });
    }
    
    res
      .status(500)
      .json({ 
        message: "Error creating subcategory", 
        error: error.message,
        errorName: error.name,
        errorCode: error.code
      });
  }
};

// Get All Subcategories
exports.getAllSubcategories = async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
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
