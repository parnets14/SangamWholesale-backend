// const express = require("express");
// const router = express.Router();
// const {
//   uploadKycDocument,
//   getKycDocuments,
//   approveKyc,
// } = require("../../controllers/User/kycController");
// const {
//   userProtect,
//   adminProtect,
// } = require("../../middleware/authMiddleware");
// const createUploader = require("../../middleware/multer");

// // Create uploader for KYC images
// const uploadKyc = createUploader("kyc");

// // Upload a KYC document (one at a time)
// router.post(
//   "/upload",
//   userProtect,
//   uploadKyc.single("document"),
//   uploadKycDocument
// );

// // Get all KYC documents for the user
// router.get("/", userProtect, getKycDocuments);

// // Admin: Approve or reject KYC
// router.put("/approve/:userId", adminProtect, approveKyc);

// module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  uploadKycDocuments,
  getKycDocuments,
  approveKyc,
} = require("../../controllers/User/kycController");

const {
  userProtect,
  adminProtect,
} = require("../../middleware/authMiddleware");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/kyc/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

const kycFields = [
  "udyamAadhar",
  "gstCertificate",
  "fssaiLicense",
  "drugLicense",
  "currentAccountCheque",
  "shopLicense",
  "tradeCertificate",
  "otherShopDocument",
].map((name) => ({ name, maxCount: 1 }));

// Routes
router.post(
  "/upload",
  userProtect,
  upload.fields(kycFields),
  uploadKycDocuments
);

router.get("/me", userProtect, getKycDocuments);

router.post("/approve/:userId", adminProtect, approveKyc);

module.exports = router;
