const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    otp: String,
    otpExpiry: Date,
    token: String,
    userDetails: {
      fullName: String,
      email: String,
      profileImage: String,
      isCompleted: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
