const express = require("express");
const router = express.Router();
const deliveryController = require("../../controllers/Delivery/deliveryController");
const { driverProtect } = require("../../middleware/Delivery/driverMiddleware");

// All delivery routes require a logged-in driver.
router.use(driverProtect);

// Notifications (activity feed)
router.get("/notifications", deliveryController.getNotifications);

// Order lists
router.get("/orders/available", deliveryController.getAvailableOrders);
router.get("/orders/mine", deliveryController.getMyOrders);
router.get("/orders/:id", deliveryController.getOrderById);

// Delivery lifecycle actions
router.post("/orders/:id/accept", deliveryController.acceptOrder);
router.post("/orders/:id/start", deliveryController.startDelivery);
router.post("/orders/:id/request-otp", deliveryController.requestDeliveryOtp);
router.post("/orders/:id/verify-otp", deliveryController.verifyDeliveryOtp);
router.post("/orders/:id/undelivered", deliveryController.markUndelivered);

module.exports = router;
