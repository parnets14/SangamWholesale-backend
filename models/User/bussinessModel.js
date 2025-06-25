const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    businessType: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    frontImage: {
      type: String,
      required: true,
    },
    backImage: {
      type: String,
      required: true,
    },
    establishmentYear: {
      type: Number,
    },
    description: {
      type: String,
    },
    panAndGst: {
      panImage: { type: String },
      gstImage: { type: String },
      fssaiId: { type: String },
      taxCertificateImage: { type: String },
    },
    vacation: {
      startDate: { type: Date },
      endDate: { type: Date },
      vacationEnabled: { type: Boolean, default: false },
    },
    weeklyOff: {
      type: String, // "everyday open"
      sunday: ["open", "close"],
      monday: ["open", "close"],
      tuesday: ["open", "close"],
      wednesday: ["open", "close"],
      thursday: ["open", "close"],
      friday: ["open", "close"],
      saturday: ["open", "close"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Business", businessSchema);