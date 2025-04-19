const Banner = require("../../models/Admin/bannerModel");
const fs = require("fs");
const path = require("path");

// Public : get all banners

const getAllBanners = async (req, res) => {
  try {
    const banner = await Banner.find();
    const banners = banner.map((ban) => ({
      ...ban._doc,
      banner: `${req.protocol}://${req.get("host")}/uploads/banners/${
        ban.banner
      }`,
    }));
    res.status(200).json({ success: true, banners: banners });
  } catch (error) {
    console.log("getallbanners error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
};

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
        banner: `${req.protocol}://${req.get("host")}/uploads/banners/${
          req.file.filename
        }`,
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

module.exports = {
  getAllBanners,
  createBanner,
};
