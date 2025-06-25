const Business = require("../../models/User/bussinessModel");
const User = require("../../models/User/userModel");

/**
 * @route POST /api/business/create
 * @desc Create a new business
 */
const createBusiness = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      businessName,
      businessType,
      category,
      establishmentYear,
      description,
      weeklyOff,
    } = req.body;

    // Validate required fields
    if (!businessName || !businessType || !category) {
      return res.status(400).json({
        success: false,
        message: "Business name, type, and category are required",
      });
    }

    // Check if user already has a business
    const existingBusiness = await Business.findOne({ userId });
    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: "User already has a business registered",
      });
    }

    // Handle uploaded files
    let frontImage = null;
    let backImage = null;

    if (req.files) {
      if (req.files.frontImage) {
        frontImage = req.files.frontImage[0].filename;
      }
      if (req.files.backImage) {
        backImage = req.files.backImage[0].filename;
      }
    }

    if (!frontImage || !backImage) {
      return res.status(400).json({
        success: false,
        message: "Both front and back images are required",
      });
    }

    // Create new business
    const business = new Business({
      userId,
      businessName,
      businessType,
      category,
      frontImage,
      backImage,
      establishmentYear,
      description,
      weeklyOff,
      isCompleted: true,
    });

    await business.save();

    // Update user's business status
    await User.findByIdAndUpdate(userId, {
      "userDetails.isCompleted": true,
    });

    return res.status(201).json({
      success: true,
      message: "Business created successfully",
      business: {
        _id: business._id,
        businessName: business.businessName,
        businessType: business.businessType,
        category: business.category,
        frontImage: business.frontImage,
        backImage: business.backImage,
        approvalStatus: business.approvalStatus,
        isCompleted: business.isCompleted,
      },
    });
  } catch (error) {
    console.error("createBusiness error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @route GET /api/business/profile
 * @desc Get user's business profile
 */
const getBusiness = async (req, res) => {
  try {
    const userId = req.user._id;

    const business = await Business.findOne({ userId }).populate(
      "approvedBy",
      "adminName"
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    return res.status(200).json({
      success: true,
      business,
    });
  } catch (error) {
    console.error("getBusiness error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @route PUT /api/business/update
 * @desc Update business profile
 */
const updateBusiness = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      businessName,
      businessType,
      category,
      establishmentYear,
      description,
      weeklyOff,
    } = req.body;

    const business = await Business.findOne({ userId });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Update fields if provided
    if (businessName) business.businessName = businessName;
    if (businessType) business.businessType = businessType;
    if (category) business.category = category;
    if (establishmentYear) business.establishmentYear = establishmentYear;
    if (description) business.description = description;
    if (weeklyOff) business.weeklyOff = weeklyOff;
    if (weeklyOff) business.weeklyOff = weeklyOff;

    // Handle uploaded files
    if (req.files) {
      if (req.files.frontImage) {
        business.frontImage = req.files.frontImage[0].filename;
      }
      if (req.files.backImage) {
        business.backImage = req.files.backImage[0].filename;
      }
    }

    // Reset approval status when business is updated
    business.approvalStatus = "pending";
    business.isApproved = false;
    business.approvedBy = null;
    business.approvedAt = null;
    business.rejectionReason = null;

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Business updated successfully",
      business: {
        _id: business._id,
        businessName: business.businessName,
        businessType: business.businessType,
        category: business.category,
        frontImage: business.frontImage,
        backImage: business.backImage,
        approvalStatus: business.approvalStatus,
        isCompleted: business.isCompleted,
      },
    });
  } catch (error) {
    console.error("updateBusiness error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @route DELETE /api/business/delete
 * @desc Delete business
 */
const deleteBusiness = async (req, res) => {
  try {
    const userId = req.user._id;

    const business = await Business.findOneAndDelete({ userId });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Business deleted successfully",
    });
  } catch (error) {
    console.error("deleteBusiness error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @route GET /api/business/all (Admin only)
 * @desc Get all businesses for admin approval
 */
const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find()
      .populate("userId", "phone userDetails.fullName userDetails.email")
      .populate("approvedBy", "adminName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: businesses.length,
      businesses,
    });
  } catch (error) {
    console.error("getAllBusinesses error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @route PUT /api/business/approve/:businessId (Admin only)
 * @desc Approve or reject business
 */
const approveBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { approvalStatus, rejectionReason } = req.body;
    const adminId = req.user._id;

    if (!approvalStatus || !["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Valid approval status is required",
      });
    }

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    business.approvalStatus = approvalStatus;
    business.isApproved = approvalStatus === "approved";
    business.approvedBy = adminId;
    business.approvedAt = new Date();

    if (approvalStatus === "rejected" && rejectionReason) {
      business.rejectionReason = rejectionReason;
    }

    await business.save();

    return res.status(200).json({
      success: true,
      message: `Business ${approvalStatus} successfully`,
      business: {
        _id: business._id,
        businessName: business.businessName,
        approvalStatus: business.approvalStatus,
        isApproved: business.isApproved,
        approvedBy: business.approvedBy,
        approvedAt: business.approvedAt,
        rejectionReason: business.rejectionReason,
      },
    });
  } catch (error) {
    console.error("approveBusiness error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @route GET /api/business/pending (Admin only)
 * @desc Get pending businesses for approval
 */
const getPendingBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ approvalStatus: "pending" })
      .populate("userId", "phone userDetails.fullName userDetails.email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: businesses.length,
      businesses,
    });
  } catch (error) {
    console.error("getPendingBusinesses error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createBusiness,
  getBusiness,
  updateBusiness,
  deleteBusiness,
  getAllBusinesses,
  approveBusiness,
  getPendingBusinesses,
};
