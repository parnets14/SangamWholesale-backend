// const express = require("express");
// const router = express.Router();
// const buyonceController = require("../../controllers/User/buyonceController");
// const { userProtect } = require("../../middleware/Middleware");

// // Get or create cart
// router.get("/", userProtect, buyonceController.getOrCreateCart);

// // Add item to cart
// router.post("/items", userProtect, buyonceController.addItemToCart);

// // Update item quantity
// router.put("/items/:itemId", userProtect, buyonceController.updateCartItem);

// // Remove item from cart
// router.delete(
//   "/items/:itemId",
//   userProtect,
//   buyonceController.removeItemFromCart
// );

// // Update shipping address
// router.put("/shipping", userProtect, buyonceController.updateShippingAddress);

// // Apply coupon
// router.post("/coupons", userProtect, buyonceController.applyCoupon);

// //remove coupon
// router.delete(
//   "/coupons/:couponCode",
//   userProtect,
//   buyonceController.removeCoupon
// );

// // Clear cart
// router.delete("/clear", userProtect, buyonceController.clearCart);

// module.exports = router;

// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/User/orderController");
const { userProtect } = require("../../middleware/Middleware");

// All routes are protected
router.use(userProtect);

// Create one-time order
router.post("/", orderController.createOrder);

// Get user's orders
router.get("/", orderController.getUserOrders);

// Get order details
router.get("/:id", orderController.getOrderDetails);

// Cancel order
router.post("/:id/cancel", orderController.cancelOrder);

module.exports = router;
