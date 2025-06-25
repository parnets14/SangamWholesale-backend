const jwt = require("jsonwebtoken");
const User = require("../../models/User/userModel");
const Business = require("../../models/User/bussinessModel");

// Generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT token
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "30d",
  });

/**
 * @route POST /api/users/send-otp
 * @desc Send OTP to phone number
 */
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    console.log("sendOTP called with phone:", phone);
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone is required" });
    }

    let user = await User.findOne({ phone });

    // New user case
    if (!user) {
      user = new User({ phone });
      user.userDetails.isCompleted = false;
    } else {
      user.userDetails.isCompleted = true;
    }
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    // Fetch business details if any
    let businessDetails = null;
    if (user._id) {
      const business = await Business.findOne({ userId: user._id });
      if (business) {
        businessDetails = {
          _id: business._id,
          businessName: business.businessName,
          businessType: business.businessType,
          category: business.category,
          establishmentYear: business.establishmentYear,
          description: business.description,
          frontImage: business.frontImage,
          backImage: business.backImage,
          weeklyOff: business.weeklyOff,
          businessHours: business.businessHours,
          approvalStatus: business.approvalStatus,
          isApproved: business.isApproved,
          isCompleted: business.isCompleted,
          rejectionReason: business.rejectionReason,
          approvedAt: business.approvedAt,
          approvedBy: business.approvedBy,
        };
      }
    }

    console.log(`OTP for ${phone}: ${otp}`); // Replace with SMS gateway

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
      phone,
      user: user.userDetails,
      businessDetails,
    });
  } catch (error) {
    console.error("sendOTP error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route POST /api/users/verify-otp
 * @desc Verify OTP and return JWT token
 */
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP are required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Mark OTP as used
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    const token = generateToken(user._id);

    // Fetch business details if any
    let businessDetails = null;
    if (user._id) {
      const business = await Business.findOne({ userId: user._id });
      if (business) {
        businessDetails = {
          _id: business._id,
          businessName: business.businessName,
          businessType: business.businessType,
          category: business.category,
          establishmentYear: business.establishmentYear,
          description: business.description,
          frontImage: business.frontImage,
          backImage: business.backImage,
          weeklyOff: business.weeklyOff,
          businessHours: business.businessHours,
          approvalStatus: business.approvalStatus,
          isApproved: business.isApproved,
          isCompleted: business.isCompleted,
          rejectionReason: business.rejectionReason,
          approvedAt: business.approvedAt,
          approvedBy: business.approvedBy,
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified",
      token,
      user: {
        _id: user._id,
        phone: user.phone,
        userDetails: user.userDetails,
        businessDetails,
      },
    });
  } catch (error) {
    console.error("verifyOTP error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const createUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, email } = req.body;

    console.log("createUser called with fullName:", fullName, "email:", email);

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    if (!fullName) {
      return res
        .status(400)
        .json({ success: false, message: "fullName is required" });
    }

    // Find the authenticated user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update user details
    user.userDetails.fullName = fullName;
    user.userDetails.email = email;
    user.userDetails.isCompleted = true;

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Profile created successfully",
      phone: user.phone,
      user: {
        _id: user._id,
        userDetails: user.userDetails,
      },
    });
  } catch (error) {
    console.error("createUser error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ⏩ GET USER
const getUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        phone: user.phone,
        fullName: user.userDetails?.fullName || null,
        email: user.userDetails?.email || null,
        profileImage: user.userDetails?.profileImage || null,
        isCompleted: user.userDetails?.isCompleted || false,
      },
    });
  } catch (error) {
    console.error("getUser error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ⏩ UPDATE USER
const updateuser = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      fullName,
      email,
      businessName,
      businessType,
      category,
      establishmentYear,
      description,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update text fields
    if (fullName) user.userDetails.fullName = fullName;
    if (email) user.userDetails.email = email;

    // Handle uploaded file (if any)
    if (req.file) {
      const imagePath = req.file.filename;
      user.userDetails.profileImage = imagePath;
    }

    user.userDetails.isCompleted = true;
    await user.save();

    // Handle business details if provided
    let business = null;
    if (businessName && businessType && category) {
      business = await Business.findOne({ userId });
      if (business) {
        // Update existing business
        business.businessName = businessName;
        business.businessType = businessType;
        business.category = category;
        if (establishmentYear) business.establishmentYear = establishmentYear;
        if (description) business.description = description;
        // Reset approval status on update
        business.approvalStatus = "pending";
        business.isApproved = false;
        business.approvedBy = null;
        business.approvedAt = null;
        business.rejectionReason = null;
        await business.save();
      } else {
        // Create new business
        business = new Business({
          userId,
          businessName,
          businessType,
          category,
          establishmentYear,
          description,
          isCompleted: true,
        });
        await business.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        phone: user.phone,
        fullName: user.userDetails.fullName,
        email: user.userDetails.email,
        profileImage: user.userDetails.profileImage || null,
        isCompleted: user.userDetails.isCompleted,
      },
      business: business
        ? {
            _id: business._id,
            businessName: business.businessName,
            businessType: business.businessType,
            category: business.category,
            establishmentYear: business.establishmentYear,
            description: business.description,
            approvalStatus: business.approvalStatus,
            isApproved: business.isApproved,
          }
        : undefined,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ⏩ DELETE USER
const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  createUser,
  getUser,
  updateuser,
  deleteUser,
};
