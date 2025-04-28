// routes/referralRoutes.js
const express = require("express");
const router = express.Router();
const referralController = require("../../controllers/User/referralController");
const { userProtect, adminProtect } = require("../../middleware/Middleware");

// Get user's referral details
router.get("/me", userProtect, referralController.getReferralDetails);

// Process referral during signup
router.post("/process", referralController.processReferral);

// Admin route to credit earnings
router.post(
  "/credit/:transactionId",
  adminProtect,
  referralController.creditReferralEarnings
);

module.exports = router;
