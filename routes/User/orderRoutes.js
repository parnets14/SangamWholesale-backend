// routes/User/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/User/orderController");
const { userProtect } = require("../../middleware/Middleware");

// Place order - direct version
router.post("/place", userProtect, orderController.confirmOrder);

// Get user's orders
router.get("/", userProtect, orderController.getUserOrders);

// Get order details
router.get("/:orderId", userProtect, orderController.getOrderDetails);

// Update order status
router.put("/:orderId", userProtect, orderController.updateOrderStatus);

// Update item subscription status
router.put("/:orderId/items/:itemId/subscription-status", userProtect, orderController.updateItemSubscriptionStatus);

// Add this new route for canceling order items
router.put("/:orderId/items/:itemId/cancel", userProtect, orderController.cancelOrderItem);

// Add this new route for deleting order items
router.delete("/:orderId/items/:itemId", userProtect, orderController.deleteOrderItem);

module.exports = router;