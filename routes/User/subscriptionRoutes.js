const express = require("express");
const router = express.Router();
const {
  createSubscription,
  getUserSubscriptions,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  cancelVacationMode,
  setVacationMode,
} = require("../../controllers/User/subscriptionController");
const { userProtect } = require("../../middleware/Middleware");

// All routes are protected

// Create subscription
router.post("/", userProtect, createSubscription);

// Get user's subscriptions
router.get("/", userProtect, getUserSubscriptions);

// Update subscription
router.put("/:id", userProtect, updateSubscription);

// Pause subscription
router.post("/:id/pause", userProtect, pauseSubscription);

// Resume subscription
router.post("/:id/resume", userProtect, resumeSubscription);

// Cancel subscription
router.post("/:id/cancel", userProtect, cancelSubscription);

// Set vacation mode
router.post("/:id/vacation", userProtect, setVacationMode);

// Cancel vacation mode
router.post("/:id/cancel-vacation", userProtect, cancelVacationMode);

module.exports = router;
