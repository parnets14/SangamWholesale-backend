const Subcategory = require("../../models/Admin/subcategoryModel");
const Category = require("../../models/Admin/categoryModel");

// Create Subcategory
exports.createSubcategory = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if subcategory already exists
    const existingSubcategory = await Subcategory.findOne({ name });
    if (existingSubcategory) {
      return res.status(400).json({
        success: false,
        message: "Subcategory with this name already exists",
      });
    }

    // Check if image is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Subcategory image is required",
      });
    }

    // Create new subcategory
    const subcategory = await Subcategory.create({
      name,
      description,
      image: req.file.filename.replace(/\\/g, "/"),
      category: categoryId,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      subcategory,
    });
  } catch (error) {
    console.error("Create Subcategory Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating subcategory",
      error: error.message,
    });
  }
};

// Get All Subcategories
exports.getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find()
      .populate("category", "name")
      .populate("createdBy", "adminName adminEmail")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subcategories.length,
      subcategories,
    });
  } catch (error) {
    console.error("Get Subcategories Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subcategories",
      error: error.message,
    });
  }
};

// Get Subcategories by Category
exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ category: req.params.categoryId })
      .populate("category", "name")
      .populate("createdBy", "adminName adminEmail")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subcategories.length,
      subcategories,
    });
  } catch (error) {
    console.error("Get Subcategories by Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subcategories",
      error: error.message,
    });
  }
};

// Get Single Subcategory
exports.getSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id)
      .populate("category", "name")
      .populate("createdBy", "adminName adminEmail");

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    res.status(200).json({
      success: true,
      subcategory,
    });
  } catch (error) {
    console.error("Get Subcategory Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subcategory",
      error: error.message,
    });
  }
};

// Update Subcategory
exports.updateSubcategory = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;

    // Check if subcategory exists
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    // If category is being updated, check if it exists
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    // If name is being updated, check for duplicates
    if (name && name !== subcategory.name) {
      const existingSubcategory = await Subcategory.findOne({ name });
      if (existingSubcategory) {
        return res.status(400).json({
          success: false,
          message: "Subcategory with this name already exists",
        });
      }
    }

    // Prepare update data
    const updateData = {
      name: name || subcategory.name,
      description: description || subcategory.description,
      category: categoryId || subcategory.category,
    };

    // If new image is uploaded, update image path
    if (req.file) {
      updateData.image = req.file.filename.replace(/\\/g, "/");
    }

    // Update subcategory
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("category", "name")
      .populate("createdBy", "adminName adminEmail");

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      subcategory: updatedSubcategory,
    });
  } catch (error) {
    console.error("Update Subcategory Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating subcategory",
      error: error.message,
    });
  }
};

// Delete Subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    await subcategory.deleteOne();

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    console.error("Delete Subcategory Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting subcategory",
      error: error.message,
    });
  }
}; 