const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/User/orderController");
const { userProtect } = require("../../middleware/Middleware");

router.post("/", userProtect, orderController.confirmOrder);
router.get("/", userProtect, orderController.getUserOrders);

module.exports = router;
