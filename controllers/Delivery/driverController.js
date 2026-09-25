const jwt = require("jsonwebtoken");
const Driver = require("../../models/Delivery/driverModel");

// Generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Generate JWT token for a driver. `role: 'driver'` lets the middleware tell
// driver tokens apart from customer tokens.
const generateToken = (driverId) =>
  jwt.sign({ id: driverId, role: "driver" }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "30d",
  });

/**
 * @route POST /api/driver/register
 * @desc  Register a new delivery partner (or return the existing one).
 */
const registerDriver = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    if (!name || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "name and phone are required" });
    }

    // KYC document images (optional). Multer puts uploaded files on req.files
    // keyed by field name; we store just the saved filename on the driver.
    const files = req.files || {};
    console.log(
      "[register] phone:",
      phone,
      "| received file fields:",
      Object.keys(files),
      "| body keys:",
      Object.keys(req.body)
    );
    const docPatch = {};
    for (const key of ["aadharFront", "aadharBack", "panImage", "dlImage"]) {
      if (files[key] && files[key][0]) {
        docPatch[key] = files[key][0].filename;
      }
    }

    let driver = await Driver.findOne({ phone });
    if (driver) {
      // Already registered — update basic details + any newly uploaded docs.
      driver.name = name;
      if (email) driver.email = email;
      Object.assign(driver, docPatch);
      await driver.save();
    } else {
      driver = await Driver.create({
        name,
        phone,
        email,
        driverId: "DRV" + Math.floor(1000 + Math.random() * 9000),
        ...docPatch,
      });
    }

    return res.status(200).json({ success: true, driver });
  } catch (error) {
    console.error("registerDriver error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route POST /api/driver/send-otp
 * @desc  Send login OTP to a registered driver's phone.
 */
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone is required" });
    }

    const driver = await Driver.findOne({ phone });
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "No delivery account found. Please register.",
      });
    }
    if (driver.blockstatus) {
      return res
        .status(403)
        .json({ success: false, message: "Your account is blocked" });
    }

    const otp = generateOTP();
    driver.otp = otp;
    driver.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await driver.save();

    console.log(`Driver OTP for ${phone}: ${otp}`); // Replace with SMS gateway

    // Return the OTP so the app can show it while there is no SMS gateway.
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
      phone,
    });
  } catch (error) {
    console.error("driver sendOTP error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route POST /api/driver/verify-otp
 * @desc  Verify OTP and return a JWT + driver profile.
 */
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP are required" });
    }

    const driver = await Driver.findOne({ phone });
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }
    if (driver.blockstatus) {
      return res
        .status(403)
        .json({ success: false, message: "Your account is blocked" });
    }
    if (driver.otp !== otp || !driver.otpExpiry || driver.otpExpiry < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    driver.otp = undefined;
    driver.otpExpiry = undefined;
    await driver.save();

    const token = generateToken(driver._id);

    return res.status(200).json({
      success: true,
      message: "OTP verified",
      token,
      driver: {
        _id: driver._id,
        name: driver.name,
        phone: driver.phone,
        email: driver.email,
        driverId: driver.driverId,
        blockstatus: driver.blockstatus,
        profileImage: driver.profileImage,
      },
    });
  } catch (error) {
    console.error("driver verifyOTP error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route GET /api/driver/me
 * @desc  Get the logged-in driver's profile.
 */
const getProfile = async (req, res) => {
  try {
    return res.status(200).json({ success: true, driver: req.driver });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route POST /api/driver/fcm-token
 * @desc  Save/refresh the logged-in driver's FCM device token for push.
 */
const saveFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res
        .status(400)
        .json({ success: false, message: "fcmToken is required" });
    }
    await Driver.findByIdAndUpdate(req.driver._id, { fcmToken });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("saveFcmToken error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route PUT /api/driver/me
 * @desc  Logged-in partner updates their own profile (name / email).
 *        The change is stored on the same Driver record the admin panel reads,
 *        so admin sees it too.
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const update = {};
    if (typeof name === "string" && name.trim()) update.name = name.trim();
    if (typeof email === "string") update.email = email.trim();
    if (typeof phone === "string" && /^\d{10}$/.test(phone.trim())) {
      // Check phone not already taken by another driver
      const existing = await Driver.findOne({ phone: phone.trim(), _id: { $ne: req.driver._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: "Phone number already in use" });
      }
      update.phone = phone.trim();
    }

    if (Object.keys(update).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Nothing to update" });
    }

    const driver = await Driver.findByIdAndUpdate(req.driver._id, update, {
      new: true,
    }).select("-otp -otpExpiry");

    return res.status(200).json({ success: true, driver });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Admin: manage delivery partners ─────────────────────────────────────────

/**
 * @route PUT /api/driver/me/docs
 * @desc  Update a single KYC document for the logged-in driver.
 */
const updateDocs = async (req, res) => {
  try {
    const allowed = ["aadharFront", "aadharBack", "panImage", "dlImage"];
    const update = {};
    for (const key of allowed) {
      if (req.files?.[key]?.[0]) {
        update[key] = req.files[key][0].filename;
      }
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, message: "No document uploaded" });
    }
    const driver = await Driver.findByIdAndUpdate(req.driver._id, update, {
      new: true,
    }).select("-otp -otpExpiry");
    return res.status(200).json({ success: true, driver });
  } catch (error) {
    console.error("updateDocs error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route GET /api/admin/drivers
 * @desc  List all registered delivery partners (newest first).
 */
const adminGetAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({})
      .select("-otp -otpExpiry")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, drivers });
  } catch (error) {
    console.error("adminGetAllDrivers error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route GET /api/admin/drivers/:id
 * @desc  Get one delivery partner's details.
 */
const adminGetDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).select(
      "-otp -otpExpiry"
    );
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }
    return res.status(200).json({ success: true, driver });
  } catch (error) {
    console.error("adminGetDriver error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route DELETE /api/admin/drivers/:id
 * @desc  Remove a delivery partner.
 */
const adminDeleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Delivery partner deleted" });
  } catch (error) {
    console.error("adminDeleteDriver error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route PUT /api/admin/drivers/:id/block
 * @desc  Block or unblock a delivery partner. Body: { blockstatus: boolean }
 */
const adminSetBlockStatus = async (req, res) => {
  try {
    const { blockstatus } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { blockstatus: !!blockstatus },
      { new: true }
    ).select("-otp -otpExpiry");
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }
    return res.status(200).json({ success: true, driver });
  } catch (error) {
    console.error("adminSetBlockStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  registerDriver,
  sendOTP,
  verifyOTP,
  getProfile,
  updateProfile,
  updateDocs,
  saveFcmToken,
  adminGetAllDrivers,
  adminGetDriver,
  adminDeleteDriver,
  adminSetBlockStatus,
};
