const express = require("express");
const router = express.Router();
const founderController = require("../../controllers/Admin/founderController");
const { adminProtect } = require("../../middleware/authMiddleware");
const createUploader = require("../../middleware/multer");

const uploadFounderImage = createUploader("founders");

router.post("/", adminProtect, uploadFounderImage.single("image"), founderController.createFounder);
router.get("/", founderController.getAllFounders);
router.get("/:id", founderController.getFounder);
router.put("/:id", adminProtect, uploadFounderImage.single("image"), founderController.updateFounder);
router.delete("/:id", adminProtect, founderController.deleteFounder);

module.exports = router;
