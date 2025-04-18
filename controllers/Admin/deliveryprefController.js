const DeliveryPreference = require("../../models/Admin/deliveryprefModel");

// Get all preferences
exports.getAllPreferences = async (req, res) => {
  try {
    const prefs = await DeliveryPreference.find();
    res.status(200).json(prefs);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch preferences", details: err.message });
  }
};

// Create a preference
exports.createPreference = async (req, res) => {
  try {
    const { preference, instructions } = req.body;
    const newPref = new DeliveryPreference({ preference, instructions });
    const savedPref = await newPref.save();
    res.status(201).json(savedPref);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to create preference", details: err.message });
  }
};

// Get single preference by ID
exports.getPreferenceById = async (req, res) => {
  try {
    const pref = await DeliveryPreference.findById(req.params.id);
    if (!pref) return res.status(404).json({ error: "Preference not found" });
    res.status(200).json(pref);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to get preference", details: err.message });
  }
};

// Update preference
exports.updatePreference = async (req, res) => {
  try {
    const updated = await DeliveryPreference.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated)
      return res.status(404).json({ error: "Preference not found" });
    res.status(200).json(updated);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to update preference", details: err.message });
  }
};

// Delete preference
exports.deletePreference = async (req, res) => {
  try {
    const deleted = await DeliveryPreference.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: "Preference not found" });
    res.status(200).json({ message: "Preference deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete preference", details: err.message });
  }
};
