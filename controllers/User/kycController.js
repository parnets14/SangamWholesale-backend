const KYC = require("../../models/User/kycModel");

// Upload or update a KYC document
const uploadKycDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const { documentType } = req.body; // e.g., "udyamAadhar", "gstCertificate", etc.

    if (!documentType || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Document type and file are required",
      });
    }

    // Find or create KYC record for user
    let kyc = await KYC.findOne({ userId });
    if (!kyc) {
      kyc = new KYC({ userId });
    }

    // Save file path to the correct field
    kyc[documentType] = req.file.filename;
    // Reset approval status to pending on new upload
    kyc.approvalStatus = "pending";
    kyc.isApproved = false;
    kyc.approvedBy = null;
    kyc.approvedAt = null;
    kyc.rejectionReason = null;
    await kyc.save();

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      kyc,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all KYC documents for user
const getKycDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const kyc = await KYC.findOne({ userId });
    res.status(200).json({ success: true, kyc });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Admin: Approve or reject KYC
const approveKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { approvalStatus, rejectionReason } = req.body;
    const adminId = req.user._id;

    if (!approvalStatus || !["approved", "rejected"].includes(approvalStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid approval status is required" });
    }

    const kyc = await KYC.findOne({ userId });
    if (!kyc) {
      return res
        .status(404)
        .json({ success: false, message: "KYC not found for user" });
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
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  uploadKycDocument,
  getKycDocuments,
  approveKyc,
};
