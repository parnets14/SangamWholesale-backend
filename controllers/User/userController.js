const User = require("../../models/User/userModel");
const jwt = require("jsonwebtoken");

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Check if user exists
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({ phoneNumber });
    }

    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
    await user.save();

    // TODO: Integrate with SMS service to send OTP
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      isNewUser: !user.isVerified,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

// Verify OTP and Register
exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const user = await User.findOne({
      phoneNumber,
      otp,
      otpExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "30d" }
    );
    user.token = token;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        phoneNumber: user.phoneNumber,
        profile: user.profile,
        business: user.business,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in registration",
      error: error.message,
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Check if user exists
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
    await user.save();

    // TODO: Integrate with SMS service to send OTP
    console.log(`Login OTP for ${phoneNumber}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully for login",
      isVerified: user.isVerified,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in login process",
      error: error.message,
    });
  }
};

// Verify Login OTP
exports.verifyLoginOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const user = await User.findOne({
      phoneNumber,
      otp,
      otpExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Clear OTP data
    user.otp = undefined;
    user.otpExpiry = undefined;

    // Generate new JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "30d" }
    );
    user.token = token;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        phoneNumber: user.phoneNumber,
        profile: user.profile,
        business: user.business,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in login verification",
      error: error.message,
    });
  }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        phoneNumber: user.phoneNumber,
        profile: user.profile,
        business: user.business,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.profile = {
      isCompleted: true,
      fullName,
      email,
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: user.profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Update Business Profile
exports.updateBusinessProfile = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    console.log("Request Files:", req.files);
    const { businessName, businessType, category } = req.body;
    console.log("Request Body:", req.body);
    
    const userId = req.user._id;
    console.log("User ID:", userId);

    // Validate required fields
    if (!businessName || !businessType || !category) {
      return res.status(400).json({
        success: false,
        message: "Business name, type, and category are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create business object with basic info
    const businessData = {
      isCompleted: true,
      businessName,
      businessType,
      category,
    };

    // Handle file uploads
    try {
      if (req.files && req.files.frontImage && req.files.frontImage[0]) {
        businessData.frontImage = req.files.frontImage[0].path.replace(/\\/g, '/');
      }
      if (req.files && req.files.backImage && req.files.backImage[0]) {
        businessData.backImage = req.files.backImage[0].path.replace(/\\/g, '/');
      }
    } catch (fileError) {
      console.error("File processing error:", fileError);
      return res.status(400).json({
        success: false,
        message: "Error processing uploaded files",
        error: fileError.message,
      });
    }

    console.log("Business Data to Update:", businessData);

    // Update user's business profile
    user.business = businessData;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Business profile updated successfully",
      business: user.business,
    });
  } catch (error) {
    console.error("Business Profile Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating business profile",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message,
    });
  }
};
