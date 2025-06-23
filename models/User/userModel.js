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
      expires: 300,
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
      shopKYC: {
        udaymAadhar: { type: String },
        gstCertificate: { type: String },
        fssaiLicense: { type: String },
        drugLicense: { type: String },
        currentAccountCheque: { type: String },
        shopLicense: { type: String },
        tradeCertificate: { type: String },
        otherShopDocument: { type: String },
      },
      addressDetails: {
        shopName: { type: String },
        shopNumber: { type: String },
        areaName: { type: String },
        pincode: { type: String },
        city: { type: String },
        town: { type: String },
        deliveryContact: { type: String },
        saveAddress: { type: Boolean, default: false },
        default: { type: Boolean, default: true},
        shopOpenTime: { type: String },
        openClosedDays: {
          type: Map,
          of: String, // e.g., { sunday: "open", monday: "close", ... }
        },
        lunchTime: {
          lunchStart: { type: String },
          lunchEnd: { type: String },
        },
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
        taxCertificate: { type: String },
      },
      vacation: {
        startDate: { type: Date },
        endDate: { type: Date },
        vacationEnabled: { type: Boolean, default: false },
      },
      weeklyOff: {
        type: String, // "everyday" or "sat-sunday"
      },
      bankManagement: {
        accountNumber: { type: String },
        confirmAccountNumber: { type: String },
        accountName: { type: String },
        ifscCode: { type: String },
        bankDetails: { type: String },
        accountType: { type: String },
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
