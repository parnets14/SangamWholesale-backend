const Vacation = require("../../models/User/vacationModel");

// 1. Create Vacation
exports.createVacation = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.body;
    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (new Date(endDate) <= new Date(startDate)) {
      return res
        .status(400)
        .json({ error: "End date must be after start date" });
    }
    const vacation = await Vacation.create({ userId, startDate, endDate });
    res.status(201).json(vacation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Get All Vacations
exports.getAllVacations = async (req, res) => {
  try {
    const vacations = await Vacation.find();
    res.json(vacations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Get Single Vacation
exports.getVacation = async (req, res) => {
  try {
    const { id } = req.params;
    const vacation = await Vacation.findById(id);
    if (!vacation) {
      return res.status(404).json({ error: "Vacation not found" });
    }
    res.json(vacation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Update Vacation
exports.updateVacation = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;
    if (endDate && startDate && new Date(endDate) <= new Date(startDate)) {
      return res
        .status(400)
        .json({ error: "End date must be after start date" });
    }
    const vacation = await Vacation.findByIdAndUpdate(
      id,
      { startDate, endDate },
      { new: true } // Return updated document
    );
    if (!vacation) {
      return res.status(404).json({ error: "Vacation not found" });
    }
    res.json(vacation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Delete Vacation
exports.deleteVacation = async (req, res) => {
  try {
    const { id } = req.params;
    const vacation = await Vacation.findByIdAndDelete(id);
    if (!vacation) {
      return res.status(404).json({ error: "Vacation not found" });
    }
    res.json({ message: "Vacation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};