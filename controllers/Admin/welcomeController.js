const Welcome = require("../../models/Admin/welcomeModel");
const fs = require("fs/promises");
const path = require("path");

// Helper function to delete file safely
const safeDelete = async (filePath) => {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Error deleting file:", err);
    }
  }
};

// Get all welcome messages
exports.getAllWelcomes = async (req, res) => {
  try {
    const welcomes = await Welcome.find().sort({ createdAt: -1 });

    // Add full URLs to each welcome
    const welcomesWithUrls = welcomes.map((welcome) => ({
      ...welcome.toObject(),
      image: welcome.image,
    }));

    res.status(200).json({
      success: true,
      count: welcomes.length,
      data: welcomesWithUrls,
    });
  } catch (error) {
    console.error("getAllWelcomes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching welcome messages",
    });
  }
};

// Create new welcome message
exports.createWelcome = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validation
    if (!title || !description || !req.file) {
      await safeDelete(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Title, description, and image are required",
      });
    }

    // Check for existing welcome with same title
    const existingWelcome = await Welcome.findOne({ title });
    if (existingWelcome) {
      await safeDelete(req.file.path);
      return res.status(409).json({
        success: false,
        message: "Welcome with this title already exists",
      });
    }

    // Create the welcome
    const welcome = await Welcome.create({
      title,
      description,
      image: req.file.filename,
    });

    res.status(201).json({
      success: true,
      message: "Welcome created successfully",
      data: {
        ...welcome.toObject(),
        image: req.file.filename,
      },
    });
  } catch (error) {
    await safeDelete(req.file?.path);
    console.error("createWelcome error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating welcome",
    });
  }
};

// Update welcome message
exports.updateWelcome = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // Find the existing welcome
    const welcome = await Welcome.findById(id);
    if (!welcome) {
      await safeDelete(req.file?.path);
      return res.status(404).json({
        success: false,
        message: "Welcome not found",
      });
    }

    // Check for title conflict
    if (title && title !== welcome.title) {
      const existingWelcome = await Welcome.findOne({ title });
      if (existingWelcome) {
        await safeDelete(req.file?.path);
        return res.status(409).json({
          success: false,
          message: "Welcome with this title already exists",
        });
      }
    }

    // Handle image update
    let oldImagePath;
    if (req.file) {
      oldImagePath = path.join(
        __dirname,
        "../../public/uploads/welcome/",
        welcome.image
      );
      welcome.image = req.file.filename;
    }

    // Update fields
    if (title) welcome.title = title;
    if (description) welcome.description = description;

    const updatedWelcome = await welcome.save();

    // Delete old image after successful update
    if (req.file && oldImagePath) {
      await safeDelete(oldImagePath);
    }

    res.status(200).json({
      success: true,
      message: "Welcome updated successfully",
      data: {
        ...updatedWelcome.toObject(),
        image: updatedWelcome.image,
      },
    });
  } catch (error) {
    await safeDelete(req.file?.path);
    console.error("updateWelcome error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid welcome ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating welcome",
    });
  }
};

// Delete welcome message
exports.deleteWelcome = async (req, res) => {
  try {
    const { id } = req.params;

    const welcome = await Welcome.findByIdAndDelete(id);
    if (!welcome) {
      return res.status(404).json({
        success: false,
        message: "Welcome not found",
      });
    }

    // Delete associated image
    const imagePath = path.join(
      __dirname,
      "../../public/uploads/welcome/",
      welcome.image
    );
    await safeDelete(imagePath);

    res.status(200).json({
      success: true,
      message: "Welcome deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("deleteWelcome error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid welcome ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while deleting welcome",
    });
  }
};
