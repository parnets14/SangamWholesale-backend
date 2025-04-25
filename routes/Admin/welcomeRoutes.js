const express = require("express");
const router = express.Router();
const welcomeController = require("../../controllers/Admin/welcomeController");
const { adminProtect } = require("../../middleware/Middleware");
const createUploader = require("../../middleware/multer");

// Configure uploader for welcome images
const uploadWelcome = createUploader("welcome");

// Public routes
router.get("/", welcomeController.getAllWelcomes);

// Admin protected routes
router.post(
  "/",
  adminProtect,
  uploadWelcome.single("image"),
  welcomeController.createWelcome
);

router.put(
  "/:id",
  adminProtect,
  uploadWelcome.single("image"),
  welcomeController.updateWelcome
);

router.delete(
  "/:id", 
  adminProtect,
  welcomeController.deleteWelcome
);

module.exports = router;