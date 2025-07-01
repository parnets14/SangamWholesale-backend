const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/User/orderController");
const {
  userProtect,
  adminProtect,
} = require("../../middleware/authMiddleware");

// Place order
router.post("/", userProtect, orderController.createOrder);

// Get all orders for logged-in user
router.get("/", userProtect, orderController.getUserOrders);

// Get single order by ID
router.get("/:id", userProtect, orderController.getOrderById);
// admin 
router.get("/admin/all", adminProtect, orderController.getAllOrders);

module.exports = router;
