const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DriverSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    blockstatus: {
      type: Boolean,
      default: true,
    },
    aadharFront: {
      type: String,
    },
    aadharBack: {
      type: String,
    },
    panImage: {
      type: String,
    },
    dlImage: {
      type: String,
    },
    driverId: {
      type: Number,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", DriverSchema);
