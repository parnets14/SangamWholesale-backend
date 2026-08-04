const express = require("express");
const router = express.Router();
const returnOrderController = require("../../controllers/User/returnOrderController");
const {
  userProtect,
  adminProtect,
} = require("../../middleware/authMiddleware");

// Create a return order
router.post("/", userProtect, returnOrderController.createReturnOrder);

// Get all return orders for the logged-in user
router.get("/", userProtect, returnOrderController.getUserReturnOrders);

// Admin: Get all return orders  ← must be before /:id
router.get("/admin/all", adminProtect, returnOrderController.getAllReturnOrders);

// Admin: Update return order status  ← must be before /:id
router.put("/admin/:id/status", adminProtect, returnOrderController.updateReturnOrderStatus);

// Get a single return order by ID  ← keep last so it doesn't swallow admin routes
router.get("/:id", userProtect, returnOrderController.getReturnOrderById);

module.exports = router;
