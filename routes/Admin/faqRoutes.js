const express = require("express");
const router = express.Router();
const faqController = require("../../controllers/Admin/faqController");
const { adminProtect } = require("../../middleware/Middleware");
router.get("/", faqController.getAllFaqs);
router.get("/:id", adminProtect, faqController.getFaqById);
router.post("/", adminProtect, faqController.createFaq);
router.put("/:id", adminProtect, faqController.updateFaq);
router.delete("/:id", adminProtect, faqController.deleteFaq);

module.exports = router;
