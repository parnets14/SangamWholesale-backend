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

module.exports = router;