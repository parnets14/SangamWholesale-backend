const express = require("express");
const router = express.Router();
const subscriptionController = require("../../controllers/User/subscriptionController");
const { userProtect } = require("../../middleware/Middleware");

// Create new subscription
router.post("/", userProtect, subscriptionController.createSubscription);

// Get all user subscriptions
router.get("/all", userProtect, subscriptionController.getUserSubscriptions);

// Get single subscription
router.get("/:id", userProtect, subscriptionController.getSubscription);

// Update subscription
router.put("/:id", userProtect, subscriptionController.updateSubscription);

// Pause subscription
router.put("/:id/pause", subscriptionController.pauseSubscription);

// Resume subscription
router.put(
  "/:id/resume",
  userProtect,
  subscriptionController.resumeSubscription
);

// Cancel subscription
router.put(
  "/:id/cancel",
  userProtect,
  subscriptionController.cancelSubscription
);

// Get upcoming deliveries
router.get(
  "/upcoming",
  userProtect,
  subscriptionController.getUpcomingDeliveries
);

module.exports = router;
