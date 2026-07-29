const express = require("express");
const router = express.Router();
const tradingController = require("../../controllers/Admin/tradingController");
const { adminProtect } = require("../../middleware/authMiddleware");
const createUploader = require("../../middleware/multer");

const uploadTradingImage = createUploader("trading");

router.post("/", adminProtect, uploadTradingImage.single("image"), tradingController.createTrading);
router.get("/", tradingController.getAllTrading);
router.get("/:id", tradingController.getTrading);
router.put("/:id", adminProtect, uploadTradingImage.single("image"), tradingController.updateTrading);
router.delete("/:id", adminProtect, tradingController.deleteTrading);

module.exports = router;
