const express = require("express");
const router = express.Router();
const buyonceController = require("../../controllers/User/buyonceController");
const { userProtect } = require("../../middleware/Middleware");

// Get or create cart
router.get("/", userProtect, buyonceController.getOrCreateCart);

// Add item to cart
router.post("/items", userProtect, buyonceController.addItemToCart);

// Update item quantity
router.put("/items/:itemId", userProtect, buyonceController.updateCartItem);

// Remove item from cart
router.delete(
  "/items/:itemId",
  userProtect,
  buyonceController.removeItemFromCart
);

// Update shipping address
router.put("/shipping", userProtect, buyonceController.updateShippingAddress);

// Apply coupon
router.post("/coupons", userProtect, buyonceController.applyCoupon);

//remove coupon
router.delete(
  "/coupons/:couponCode",
  userProtect,
  buyonceController.removeCoupon
);

// Clear cart
router.delete("/clear", userProtect, buyonceController.clearCart);

module.exports = router;
