const Discover = require("../../models/Admin/discoverModel");
const createVideoUploader = require("../../middleware/viddeoMulter");
const videoUpload = createVideoUploader("discover-videos");
const path = require("path");
const fs = require("fs");

// Get all discover items
exports.getDiscoverItems = async (req, res) => {
  try {
    const discoverItems = await Discover.find().sort({ createdAt: -1 });

    // Modify response to include full video URL
    const itemsWithVideoUrl = discoverItems.map((item) => ({
      ...item.toObject(),
      videoUrl: item.videoFile ? `${item.videoFile.filename}` : null,
    }));

    res.status(200).json({
      success: true,
      count: discoverItems.length,
      data: itemsWithVideoUrl,
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
    const discoverItem = await Discover.findById(req.params.id);

    if (!discoverItem) {
      return res.status(404).json({
        success: false,
        message: "Discover item not found",
      });
    }

    // Increment views
    discoverItem.views += 1;
    await discoverItem.save();

    // Add video URL to response
    const responseItem = {
      ...discoverItem.toObject(),
      videoUrl: discoverItem.videoFile
        ? `${discoverItem.videoFile.filename}`
        : null,
    };

    res.status(200).json({
      success: true,
      data: responseItem,
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
  videoUpload.single("video")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading video",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a video file",
      });
    }

    try {
      const { title, description } = req.body;

      const discoverItem = await Discover.create({
        title,
        description,
        videoFile: {
          filename: req.file.filename,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          ...discoverItem.toObject(),
          videoUrl: `${req.file.filename}`,
        },
      });
    } catch (error) {
      if (req.file?.path) {
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

      if (req.file) {
        updateData.videoFile = {
          filename: req.file.filename,
        };
      }

      const existingItem = await Discover.findById(req.params.id);
      if (!existingItem) {
        if (req.file?.path) {
          fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting file:", unlinkErr);
          });
        }
        return res.status(404).json({
          success: false,
          message: "Discover item not found",
        });
      }

      const discoverItem = await Discover.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (req.file && existingItem.videoFile?.path) {
        fs.unlink(existingItem.videoFile.path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting old file:", unlinkErr);
        });
      }

      res.status(200).json({
        success: true,
        data: {
          ...discoverItem.toObject(),
          videoUrl: discoverItem.videoFile
            ? `${discoverItem.videoFile.filename}`
            : null,
        },
      });
    } catch (error) {
      if (req.file?.path) {
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
    const discoverItem = await Discover.findById(req.params.id);

    if (!discoverItem) {
      return res.status(404).json({
        success: false,
        message: "Discover item not found",
      });
    }

    if (discoverItem.videoFile?.path) {
      fs.unlink(discoverItem.videoFile.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting file:", unlinkErr);
      });
    }

    await Discover.findByIdAndDelete(req.params.id);

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
    const discoverItem = await Discover.findById(req.params.id);

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
