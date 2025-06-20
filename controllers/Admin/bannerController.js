const Banner = require("../../models/Admin/bannerModel");

// Create Banner (image only)
exports.createBanner = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    const banner = await Banner.create({
      image: req.file.filename.replace(/\\/g, "/"),
    });

    res.status(201).json({ message: "Created", banner });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Banners
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json({ count: banners.length, banners });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Single Banner
exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Not found" });
    res.json({ banner });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Banner (image only)
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Not found" });
    if (req.file) banner.image = req.file.filename.replace(/\\/g, "/");
    const updated = await banner.save();
    res.json({ message: "Updated", banner: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}; 