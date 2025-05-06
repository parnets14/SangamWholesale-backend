const express = require("express");
const router = express.Router();
const {
  createSubscription,
  getUserSubscriptions,
  getSubscriptionById,
  deleteSubscription,
  getActiveSubscriptions,
  updateSubscription,
  updateSubscriptionItemStatus,
  getAllSubscriptions,
} = require("../../controllers/User/subscriptionController");
const { userProtect, adminProtect } = require("../../middleware/Middleware");

// User routes
router.post("/", userProtect, createSubscription);
router.get("/", userProtect, getUserSubscriptions);
router.get("/user/:userId", userProtect, getUserSubscriptions);
router.get("/active/:userId", userProtect, getActiveSubscriptions);

// Single subscription operations
router
  .route("/:subscriptionId")
  .get(userProtect, getSubscriptionById)
  .put(userProtect, updateSubscription)
  .delete(userProtect, deleteSubscription);

// Subscription item status update
router.patch(
  "/:subscriptionId/items/:itemId/status",
  userProtect,
  updateSubscriptionItemStatus
);

// Admin routes
router.get("/admin/all", adminProtect, getAllSubscriptions);

module.exports = router;
