const City = require("../../models/Admin/cityModel");
const fs = require("fs");
const path = require("path");

// Get all active cities (Public)
const getAllCities = async (req, res) => {
  try {
    const cities = await City.find({ isActive: true });

    // Append full URL to icon path
    const citiesWithIcons = cities.map((city) => ({
      ...city._doc,
      icon: city.icon,
    }));

    res.status(200).json({ success: true, cities: citiesWithIcons });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ success: false, message: "Failed to fetch cities" });
  }
};

// Create city (Admin only)
const createCity = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !req.file) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Name and icon are required",
      });
    }

    // Check if city already exists
    const existingCity = await City.findOne({ name });
    if (existingCity) {
      fs.unlinkSync(req.file.path); // Delete uploaded file
      return res.status(409).json({
        success: false,
        message: "City already exists",
      });
    }

    // Create new city
    const city = await City.create({
      name,
      icon: req.file.filename,
    });

    res.status(201).json({
      success: true,
      message: "City created successfully",
      city: {
        ...city._doc,
        icon: req.file.filename,
      },
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path); // Cleanup on error
    console.error("Error creating city:", error);
    res.status(500).json({ success: false, message: "Failed to create city" });
  }
};

// Update city (Admin only)
const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const city = await City.findById(id);
    if (!city) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "City not found",
      });
    }

    // Update icon if new file uploaded
    if (req.file) {
      const oldIconPath = path.join(
        __dirname,
        `../../uploads/cities/${city.icon}`
      );
      if (fs.existsSync(oldIconPath)) fs.unlinkSync(oldIconPath);
      city.icon = req.file.filename;
    }

    if (name) city.name = name;
    await city.save();

    res.status(200).json({
      success: true,
      message: "City updated",
      city: {
        ...city._doc,
        icon: req.file ? req.file.filename : city.icon,
      },
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Error updating city:", error);
    res.status(500).json({ success: false, message: "Failed to update city" });
  }
};

// Delete city (Admin only - Soft delete)
const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "City deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting city:", error);
    res.status(500).json({ success: false, message: "Failed to delete city" });
  }
};

module.exports = {
  getAllCities,
  createCity,
  updateCity,
  deleteCity,
};
