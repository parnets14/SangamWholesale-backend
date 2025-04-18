// const express = require("express");
// const router = express.Router();
// const subscriptionController = require("../../controllers/User/subscriptionController");
// const { userProtect } = require("../../middleware/Middleware");

// // Create new subscription
// router.post("/", userProtect, subscriptionController.createSubscription);

// // Get all user subscriptions
// router.get("/all", userProtect, subscriptionController.getUserSubscriptions);

// // Get single subscription
// router.get("/:id", userProtect, subscriptionController.getSubscription);

// // Update subscription
// router.put("/:id", userProtect, subscriptionController.updateSubscription);

// // Pause subscription
// router.put("/:id/pause", subscriptionController.pauseSubscription);

// // Resume subscription
// router.put(
//   "/:id/resume",
//   userProtect,
//   subscriptionController.resumeSubscription
// );

// // Cancel subscription
// router.put(
//   "/:id/cancel",
//   userProtect,
//   subscriptionController.cancelSubscription
// );

// // Get upcoming deliveries
// router.get(
//   "/upcoming",
//   userProtect,
//   subscriptionController.getUpcomingDeliveries
// );

// module.exports = router;

// routes/subscriptionRoutes.js
const express = require("express");
const router = express.Router();
const {
  createSubscription,
  getUserSubscriptions,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  // cancelVacationMode,
  // setVacationMode,
} = require("../../controllers/User/subscriptionController");
const { userProtect } = require("../../middleware/Middleware");

// All routes are protected
// router.use(userProtect);

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
// router.post("/:id/vacation", userProtect, setVacationMode);

// Cancel vacation mode
// router.post("/:id/cancel-vacation", userProtect, cancelVacationMode);

module.exports = router;
