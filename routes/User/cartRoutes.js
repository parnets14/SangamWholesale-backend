const express = require("express");
const router = express.Router();
const cartController = require("../../controllers/User/cartController");
const { userProtect } = require("../../middleware/Middleware");

// Get combined cart (orders + subscriptions)
router.get("/", userProtect, cartController.getCombinedCart);

// Update specific item
router.put("/items/:itemId", userProtect, cartController.updateCartItem);

// Remove item from orders
router.delete("/items/:itemId", userProtect, cartController.removeFromCart);

// Apply coupon to orders
router.post("/apply-coupon", userProtect, cartController.applyCoupon);

// Clear all orders (DANGEROUS - use carefully)
router.delete("/clear", userProtect, cartController.clearCart);

module.exports = router;
