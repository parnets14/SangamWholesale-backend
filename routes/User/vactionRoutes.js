const express = require("express");
const router = express.Router();
const {
  createVacation,
  getAllVacations,
  getVacation,
  updateVacation,
  deleteVacation,
} = require("../../controllers/User/vacationController");

// CRUD Routes
router.post("/", createVacation);
router.get("/", getAllVacations); // Add ?userId=123 to filter
router.get("/:id", getVacation);
router.put("/:id", updateVacation);
router.delete("/:id", deleteVacation);

module.exports = router;
