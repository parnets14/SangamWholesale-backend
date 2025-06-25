const express = require("express");
const router = express.Router();
const {
  uploadKycDocument,
  getKycDocuments,
  approveKyc,
} = require("../../controllers/User/kycController");
const {
  userProtect,
  adminProtect,
} = require("../../middleware/authMiddleware");
const createUploader = require("../../middleware/multer");

// Create uploader for KYC images
const uploadKyc = createUploader("kyc");

// Upload a KYC document (one at a time)
router.post(
  "/upload",
  userProtect,
  uploadKyc.single("document"),
  uploadKycDocument
);

// Get all KYC documents for the user
router.get("/", userProtect, getKycDocuments);

// Admin: Approve or reject KYC
router.put("/approve/:userId", adminProtect, approveKyc);

module.exports = router;
