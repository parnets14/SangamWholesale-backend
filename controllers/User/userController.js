const User = require("../../models/User/userModel");
const jwt = require("jsonwebtoken");

// Generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT token
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "30d",
  });

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    let user = await User.findOne({ phone });

    if (!user) {
      // New phone number
      user = new User({ phone });
      user.isVerified = false; // Not verified yet
    } else {
      // Existing user - already verified before
      user.isVerified = true;
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    console.log(`OTP for ${phone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      isVerified: user.isVerified,
      otp: otp,
    });
  } catch (error) {
    console.error("sendOTP error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during OTP sending" });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    let user = await User.findOne({ phone });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error("verifyOTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during OTP verification",
    });
  }
};

// Register (Complete profile)
const register = async (req, res) => {
  try {
    const { name, email } = req.body;

    let user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.name = name;
    user.email = email;
    user.isProfileComplete = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error("register error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-otp -otpExpiry");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("getProfile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching profile" });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select("-otp -otpExpiry");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while updating profile" });
  }
};

// Get all users (admin only)
const getAllProfiles = async (req, res) => {
  try {
    const users = await User.find().select("-otp -otpExpiry");
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error("getAllProfiles error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching users" });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  register,
  getProfile,
  updateProfile,
  getAllProfiles,
};
