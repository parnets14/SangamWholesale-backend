const express = require("express");
const router = express.Router();
const {
  createVacation,
  getVacation,
  updateVacation,
  deleteVacation,
} = require("../../controllers/User/vacationController");

// Routes
router.post("/", createVacation);
router.get("/:id", getVacation);
router.put("/:id", updateVacation);
router.delete("/:id", deleteVacation);

module.exports = router;
