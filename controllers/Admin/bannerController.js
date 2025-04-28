const Banner = require("../../models/Admin/bannerModel");
const fs = require("fs");

// Public : get all banners
const getAllBanners = async (req, res) => {
  try {
    const banner = await Banner.find();
    const banners = banner.map((ban) => ({
      ...ban._doc,
      banner: ban.banner,
    }));
    res.status(200).json({ success: true, banners: banners });
  } catch (error) {
    console.log("getallbanners error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
};

// Create new banner
const createBanner = async (req, res) => {
  try {
    // Only check for file existence
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required",
      });
    }

    // Create banner with just the image filename
    const banner = await Banner.create({
      banner: req.file.filename,
    });

    res.status(201).json({
      success: true,
      banner: {
        ...banner._doc,
        banner: req.file.filename,
      },
    });
  } catch (error) {
    console.error("createBanner error:", error);
    if (req.file) {
      fs.unlinkSync(req.file.path); // Clean up on error
    }
    res.status(500).json({
      success: false,
      message: "Server error creating banner",
      error: error.message,
    });
  }
};

// Update banner
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // If new image is uploaded
    if (req.file) {
      // Delete old image file
      if (banner.banner) {
        const oldImagePath = `./uploads/${banner.banner}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      // Update with new image
      banner.banner = req.file.filename;
    }

    await banner.save();

    res.status(200).json({
      success: true,
      banner: {
        ...banner._doc,
        banner: banner.banner,
      },
    });
  } catch (error) {
    console.error("updateBanner error:", error);
    if (req.file) {
      fs.unlinkSync(req.file.path); // Clean up on error
    }
    res.status(500).json({
      success: false,
      message: "Server error updating banner",
      error: error.message,
    });
  }
};

// Delete banner
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // Delete associated image file
    if (banner.banner) {
      const imagePath = `./uploads/${banner.banner}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("deleteBanner error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting banner",
      error: error.message,
    });
  }
};

module.exports = {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
