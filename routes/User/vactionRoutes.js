const express = require("express");
const router = express.Router();
const vacationController = require("../../controllers/User/vacationController");

// Create a vacation
router.post("/", vacationController.createVacation);

// Get all vacations
router.get("/", vacationController.getAllVacations);

// Get single vacation
router.get("/:id", vacationController.getVacation);

// Update vacation
router.put("/:id", vacationController.updateVacation);

// Delete vacation
router.delete("/:id", vacationController.deleteVacation);

module.exports = router;
