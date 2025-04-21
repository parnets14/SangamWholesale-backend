const express = require("express");
const router = express.Router();
const subscriptionController = require("../../controllers/User/subscriptionController");
const { userProtect, adminProtect } = require("../../middleware/Middleware");

// User routes
router.post("/", userProtect, subscriptionController.createSubscription);
router.get(
  "/user/:userId",
  userProtect,
  subscriptionController.getUserSubscriptions
);
router.get(
  "/active/:userId",
  userProtect,
  subscriptionController.getActiveSubscriptions
);

// Single subscription operations
router
  .route("/:subscriptionId")
  .get(userProtect, subscriptionController.getSubscriptionById)
  .put(userProtect, subscriptionController.updateSubscription)
  .delete(userProtect, subscriptionController.deleteSubscription);

// Subscription item status update
router.patch(
  "/:subscriptionId/items/:itemId/status",
  userProtect,
  subscriptionController.updateSubscriptionItemStatus
);

// Admin routes
router.get(
  "/admin/all",
  adminProtect,
  subscriptionController.getAllSubscriptions
);

module.exports = router;
