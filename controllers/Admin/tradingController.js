const Trading = require("../../models/Admin/tradingModel");

// Create Trading Step
exports.createTrading = async (req, res) => {
  try {
    const { title, Description = "" } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const image = req.file
      ? `trading/${req.file.filename.replace(/\\/g, "/")}`
      : "";

    const item = await Trading.create({ title, Description, image });
    res.status(201).json({ message: "Created", item });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Trading Steps — returns plain array for frontend compatibility
exports.getAllTrading = async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    const items = await Trading.find().sort({ createdAt: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Single Trading Step
exports.getTrading = async (req, res) => {
  try {
    const item = await Trading.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Trading Step
exports.updateTrading = async (req, res) => {
  try {
    const { title, Description } = req.body;
    const item = await Trading.findById(req.params.id);

    if (!item) return res.status(404).json({ message: "Not found" });

    if (title !== undefined) item.title = title;
    if (Description !== undefined) item.Description = Description;
    if (req.file) {
      item.image = `trading/${req.file.filename.replace(/\\/g, "/")}`;
    }

    const updated = await item.save();
    res.json({ message: "Updated", item: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Trading Step
exports.deleteTrading = async (req, res) => {
  try {
    const item = await Trading.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
