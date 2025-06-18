const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
      expires: 300, // OTP expires in 5 minutes
    },
    otpExpiry: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profile: {
      isCompleted: {
        type: Boolean,
        default: false,
      },
      fullName: {
        type: String,
      },
      email: {
        type: String,
      },
    },
    business: {
      isCompleted: {
        type: Boolean,
        default: false,
      },
      businessName: {
        type: String,
      },
      businessType: {
        type: String,
      },
      category: {
        type: String,
      },
      frontImage: {
        type: String,
      },
      backImage: {
        type: String,
      },
    },
    token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
