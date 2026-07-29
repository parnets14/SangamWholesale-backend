const Team = require("../../models/Admin/teamModel");

// Create Team Member — returns plain document so admin panel can push it directly
exports.createTeamMember = async (req, res) => {
  try {
    const { name, description = "" } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const image = req.file
      ? `team/${req.file.filename.replace(/\\/g, "/")}`
      : "";

    const member = await Team.create({ name, description, image });
    res.status(201).json(member); // plain document, no wrapper
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Team Members — plain array
exports.getAllTeamMembers = async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    const members = await Team.find().sort({ createdAt: 1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Single Team Member
exports.getTeamMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Not found" });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Team Member — returns plain updated document
exports.updateTeamMember = async (req, res) => {
  try {
    const { name, description } = req.body;
    const member = await Team.findById(req.params.id);

    if (!member) return res.status(404).json({ message: "Not found" });

    if (name !== undefined) member.name = name;
    if (description !== undefined) member.description = description;
    if (req.file) {
      member.image = `team/${req.file.filename.replace(/\\/g, "/")}`;
    }

    const updated = await member.save();
    res.json(updated); // plain document, no wrapper
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Team Member
exports.deleteTeamMember = async (req, res) => {
  try {
    const member = await Team.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
