const mongoose = require("mongoose");

/**
 * Delivery partner (driver) account.
 *
 * Drivers log in with their phone + OTP (same style as the customer User
 * model) and are issued a JWT. Orders placed by customers become available to
 * all active drivers; the first to accept an order claims it.
 */
const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },

    // OTP login
    otp: String,
    otpExpiry: Date,

    // Account status
    blockstatus: { type: Boolean, default: false },
    driverId: { type: String, unique: true }, // human-friendly id e.g. DRV1234

    // Push notifications (FCM device token)
    fcmToken: { type: String, default: "" },

    // KYC / profile images (optional, filenames under /uploads)
    profileImage: { type: String, default: "" },
    aadharFront: { type: String, default: "" },
    aadharBack: { type: String, default: "" },
    panImage: { type: String, default: "" },
    dlImage: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
