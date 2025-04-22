const Vacation = require("../../models/User/vacationModel");
const { isValidObjectId } = require("mongoose");

// Create vacation
exports.createVacation = async (req, res) => {
  try {
    const { userId, orderId, startDate, endDate } = req.body;

    // Basic validation
    if (!userId || !orderId || !startDate || !endDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ error: "End date must be after start date" });
    }

    const vacation = await Vacation.create({
      userId,
      orderId,
      startDate,
      endDate
    });

    res.status(201).json(vacation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all vacations
exports.getAllVacations = async (req, res) => {
  try {
    const vacations = await Vacation.find()
      .populate("userId", "name email")
      .populate("orderId", "status");
    res.json(vacations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single vacation
exports.getVacation = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid vacation ID" });
    }

    const vacation = await Vacation.findById(id)
      .populate("userId", "name email")
      .populate("orderId", "status");

    if (!vacation) {
      return res.status(404).json({ error: "Vacation not found" });
    }

    res.json(vacation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update vacation
exports.updateVacation = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid vacation ID" });
    }

    if (endDate && startDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ error: "End date must be after start date" });
    }

    const vacation = await Vacation.findByIdAndUpdate(
      id,
      { startDate, endDate },
      { new: true, runValidators: true }
    );

    if (!vacation) {
      return res.status(404).json({ error: "Vacation not found" });
    }

    res.json(vacation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete vacation
exports.deleteVacation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid vacation ID" });
    }

    const vacation = await Vacation.findByIdAndDelete(id);

    if (!vacation) {
      return res.status(404).json({ error: "Vacation not found" });
    }

    res.json({ message: "Vacation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};