const mongoose = require("mongoose");

const adminSchema = mongoose.Schema(
  {
    adminName: {
      type: String,
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
      unique: true,
    },
    adminPassword: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "admin",
    },
    token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const adminModel = mongoose.model("Admin", adminSchema);
module.exports = adminModel;
