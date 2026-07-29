const Founder = require("../../models/Admin/founderModel");

// Create Founder — returns plain document so admin panel can push it directly
exports.createFounder = async (req, res) => {
  try {
    const { name, description = "" } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const image = req.file
      ? `founders/${req.file.filename.replace(/\\/g, "/")}`
      : "";

    const founder = await Founder.create({ name, description, image });
    res.status(201).json(founder); // plain document, no wrapper
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Founders — plain array
exports.getAllFounders = async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    const founders = await Founder.find().sort({ createdAt: 1 });
    res.json(founders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Single Founder
exports.getFounder = async (req, res) => {
  try {
    const founder = await Founder.findById(req.params.id);
    if (!founder) return res.status(404).json({ message: "Not found" });
    res.json(founder);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Founder — returns plain updated document
exports.updateFounder = async (req, res) => {
  try {
    const { name, description } = req.body;
    const founder = await Founder.findById(req.params.id);

    if (!founder) return res.status(404).json({ message: "Not found" });

    if (name !== undefined) founder.name = name;
    if (description !== undefined) founder.description = description;
    if (req.file) {
      founder.image = `founders/${req.file.filename.replace(/\\/g, "/")}`;
    }

    const updated = await founder.save();
    res.json(updated); // plain document, no wrapper
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Founder
exports.deleteFounder = async (req, res) => {
  try {
    const founder = await Founder.findByIdAndDelete(req.params.id);
    if (!founder) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
