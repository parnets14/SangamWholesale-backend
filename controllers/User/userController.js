const jwt = require("jsonwebtoken");
const User = require("../../models/User/userModel");

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

    console.log(`OTP for ${phone}: ${otp}`); // Replace with SMS gateway

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      isVerified: user.userDetails?.isCompleted || false,
      otp,
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

    return res.status(200).json({
      success: true,
      message: "OTP verified",
      token,
      user: {
        _id: user._id,
        phone: user.phone,
        fullName: user.userDetails?.fullName || null,
        email: user.userDetails?.email || null,
        profileImage: user.userDetails?.profileImage || null,
      },
    });
  } catch (error) {
    console.error("verifyOTP error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const createUser = async (req, res) => {
  const { fullName, email } = req.body;
  console.log("createUser called with fullName:", fullName, "email:", email);
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!fullName) {
    return res.status(400).json({ message: "fullName is required" });
  }

  const user = await User.findOne({ fullName });

  if (user) {
    return res.status(400).json({ message: "fullName already exists" });
  }

  const newUser = new User({ fullName, email });
  await newUser.save();

  return res.status(201).json({ message: "User created", user: newUser });
};

// ⏩ GET USER
const getUser = async (req, res) => {
  const { phone } = req.params;
  const user = await User.findOne({ phone });
  if (!user) return res.status(404).json({ message: "User not found" });

  return res.status(200).json(user);
};

// ⏩ UPDATE USER
const updateuser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, email } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update text fields
    if (fullName) user.userDetails.fullName = fullName;
    if (email) user.userDetails.email = email;

    // Handle uploaded file (if any)
    if (req.file) {
      const imagePath = `/uploads/Profiles/${req.file.filename}`;
      user.userDetails.profileImage = imagePath;
    }

    user.userDetails.isCompleted = true;
    await user.save();

    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ⏩ DELETE USER
const deleteUser = async (req, res) => {
  const { phone } = req.params;

  const user = await User.findOneAndDelete({ phone });
  if (!user) return res.status(404).json({ message: "User not found" });

  return res.status(200).json({ message: "User deleted" });
};

module.exports = {
  sendOTP,
  verifyOTP,
  createUser,
  getUser,
  updateuser,
  deleteUser,
};
