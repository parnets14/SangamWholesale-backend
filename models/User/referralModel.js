// models/ReferralTransaction.js
const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "credited"], default: "pending" },
    // Additional fields as needed
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReferralTransaction", referralSchema);
