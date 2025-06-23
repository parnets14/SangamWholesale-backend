const express = require("express");
const router = express.Router();
const returnOrderController = require("../../controllers/User/returnOrderController");
const { userProtect } = require("../../middleware/authMiddleware");

// Create a return order
router.post("/", userProtect, returnOrderController.createReturnOrder);

// Get all return orders for the logged-in user
router.get("/", userProtect, returnOrderController.getUserReturnOrders);

// Get a single return order by ID
router.get("/:id", userProtect, returnOrderController.getReturnOrderById);

module.exports = router;
