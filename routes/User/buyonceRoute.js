const express = require("express");
const router = express.Router();
const buyonceController = require("../../controllers/User/buyonceController");
const { userProtect, adminProtect } = require("../../middleware/Middleware");

// User routes
router
  .route("/")
  .post(userProtect, buyonceController.createBuyonceOrder)
  .get(userProtect, buyonceController.getUserBuyonceOrders);

router
  .route("/upcoming")
  .get(userProtect, buyonceController.getUpcomingBuyonceOrders);

router
  .route("/:orderId")
  .get(userProtect, buyonceController.getBuyonceOrderById)
  .put(userProtect, buyonceController.updateBuyonceOrder)
  .delete(userProtect, buyonceController.deleteBuyonceOrder);

router
  .route("/:orderId/items/:itemId/status")
  .patch(userProtect, buyonceController.updateOrderItemStatus);

// Admin routes
router
  .route("/admin/all")
  .get(adminProtect, buyonceController.getAllBuyonceOrders);

module.exports = router;
