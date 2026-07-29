const KYC = require("../../models/User/kycModel");

const allowedTypes = [
  "udyamAadhar",
  "gstCertificate",
  "fssaiLicense",
  "drugLicense",
  "currentAccountCheque",
  "shopLicense",
  "tradeCertificate",
  "otherShopDocument",
];

// ⏫ Upload multiple KYC documents
const uploadKycDocuments = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    // Find or create KYC record
    let kyc = await KYC.findOne({ userId });
    if (!kyc) {
      kyc = new KYC({ userId });
    }

    let updated = false;

    // Assign uploaded files to correct fields
    for (const field of allowedTypes) {
      if (req.files[field]) {
        kyc[field] = req.files[field][0].filename;
        updated = true;
      }
    }

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "No valid KYC documents provided",
      });
    }

    // Reset approval info
    kyc.approvalStatus = "pending";
    kyc.isApproved = false;
    kyc.approvedBy = null;
    kyc.approvedAt = null;
    kyc.rejectionReason = null;

    await kyc.save();

    res.status(200).json({
      success: true,
      message: "KYC documents uploaded successfully",
      kyc,
    });
  } catch (error) {
    console.error("Upload KYC Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// 📥 Get current user's KYC
const getKycDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const kyc = await KYC.findOne({ userId });
    res.status(200).json({ success: true, kyc });
  } catch (error) {
    console.error("Get KYC Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ Admin approves or rejects KYC
const approveKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { approvalStatus, rejectionReason } = req.body;
    const adminId = req.user._id;

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "approvalStatus must be 'approved' or 'rejected'",
      });
    }

    const kyc = await KYC.findOne({ userId });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC record not found for this user",
      });
    }

    kyc.approvalStatus = approvalStatus;
    kyc.isApproved = approvalStatus === "approved";
    kyc.approvedBy = adminId;
    kyc.approvedAt = new Date();
    kyc.rejectionReason =
      approvalStatus === "rejected" ? rejectionReason : null;

    await kyc.save();

    res.status(200).json({
      success: true,
      message: `KYC ${approvalStatus} successfully`,
      kyc,
    });
  } catch (error) {
    console.error("Approve KYC Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  uploadKycDocuments,
  getKycDocuments,
  approveKyc,
};
