const Banner = require("../../models/Admin/bannerModel");

// Create Banner
exports.createBanner = async (req, res) => {
  try {
    const { title = "", description = "" } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    // Process all uploaded images
    const images = req.files.map((file) => 
      `banners/${file.filename.replace(/\\/g, "/")}`
    );

    const banner = await Banner.create({
      title: title || "",
      description: description || "",
      images,
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

// Update Banner
exports.updateBanner = async (req, res) => {
  try {
    const { title, description } = req.body;
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) return res.status(404).json({ message: "Not found" });

    // Update title and description if provided (can be empty string to clear)
    if (title !== undefined) banner.title = title || "";
    if (description !== undefined) banner.description = description || "";

    // Update images if new files are uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => 
        `banners/${file.filename.replace(/\\/g, "/")}`
      );
      banner.images = newImages;
    }

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