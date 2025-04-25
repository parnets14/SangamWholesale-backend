const Diccover = require("../../models/Admin/discoverModel");
const createVideoUploader = require("../../middleware/viddeoMulter");
const videoUpload = createVideoUploader("discover-videos");
const path = require("path");
const fs = require("fs");

// Get all discover items
exports.getDiscoverItems = async (req, res) => {
  try {
    const discoverItems = await Diccover.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: discoverItems.length,
      data: discoverItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve discover items",
      error: error.message,
    });
  }
};

// Get a single discover item
exports.getDiscoverItem = async (req, res) => {
  try {
    const discoverItem = await Diccover.findById(req.params.id);

    if (!discoverItem) {
      return res.status(404).json({
        success: false,
        message: "Discover item not found",
      });
    }

    // Increment views
    discoverItem.views += 1;
    await discoverItem.save();

    res.status(200).json({
      success: true,
      data: discoverItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve discover item",
      error: error.message,
    });
  }
};

// Create a new discover item with video
exports.createDiscoverItem = async (req, res) => {
  // Handle video upload first
  videoUpload.single("video")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading video",
      });
    }

    // If no file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a video file",
      });
    }

    try {
      const { title, description } = req.body;

      const discoverItem = await Diccover.create({
        title,
        description,
        videoFile: {
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });

      res.status(201).json({
        success: true,
        data: discoverItem,
      });
    } catch (error) {
      // Delete the uploaded file if there was an error creating the record
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting file:", unlinkErr);
        });
      }

      res.status(400).json({
        success: false,
        message: "Failed to create discover item",
        error: error.message,
      });
    }
  });
};

// Update a discover item
exports.updateDiscoverItem = async (req, res) => {
  videoUpload.single("video")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading video",
      });
    }

    try {
      const { title, description } = req.body;
      const updateData = { title, description };

      // If a new video was uploaded, add it to the update data
      if (req.file) {
        updateData.videoFile = {
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
          mimetype: req.file.mimetype,
        };
      }

      // Find the existing item first to get the old video path
      const existingItem = await Diccover.findById(req.params.id);
      if (!existingItem) {
        // Delete the uploaded file if the item doesn't exist
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting file:", unlinkErr);
          });
        }

        return res.status(404).json({
          success: false,
          message: "Discover item not found",
        });
      }

      // Update the item
      const discoverItem = await Diccover.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      // If a new video was uploaded, delete the old one
      if (req.file && existingItem.videoFile && existingItem.videoFile.path) {
        fs.unlink(existingItem.videoFile.path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting old file:", unlinkErr);
        });
      }

      res.status(200).json({
        success: true,
        data: discoverItem,
      });
    } catch (error) {
      // Delete the uploaded file if there was an error updating the record
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting file:", unlinkErr);
        });
      }

      res.status(400).json({
        success: false,
        message: "Failed to update discover item",
        error: error.message,
      });
    }
  });
};

// Delete a discover item
exports.deleteDiscoverItem = async (req, res) => {
  try {
    const discoverItem = await Diccover.findById(req.params.id);

    if (!discoverItem) {
      return res.status(404).json({
        success: false,
        message: "Discover item not found",
      });
    }

    // Delete the associated video file if it exists
    if (discoverItem.videoFile && discoverItem.videoFile.path) {
      fs.unlink(discoverItem.videoFile.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting file:", unlinkErr);
      });
    }

    // Remove the document from the database
    await Diccover.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Discover item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete discover item",
      error: error.message,
    });
  }
};

// Like a discover item
exports.likeDiscoverItem = async (req, res) => {
  try {
    const discoverItem = await Diccover.findById(req.params.id);

    if (!discoverItem) {
      return res.status(404).json({
        success: false,
        message: "Discover item not found",
      });
    }

    discoverItem.likes += 1;
    await discoverItem.save();

    res.status(200).json({
      success: true,
      data: discoverItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to like discover item",
      error: error.message,
    });
  }
};
