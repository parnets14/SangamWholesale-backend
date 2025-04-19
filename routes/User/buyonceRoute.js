
const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/User/buyonceController");
const { userProtect } = require("../../middleware/Middleware");

// All routes are protected
router.use(userProtect);

// Create buyonce order
router.post("/", orderController.createOrder);

// Get user's orders
router.get("/", orderController.getUserOrders);

// Get order details
router.get("/:id", orderController.getOrderDetails);

// Cancel order
router.post("/:id/cancel", orderController.cancelOrder);

module.exports = router;
