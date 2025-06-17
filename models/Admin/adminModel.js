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
  },
  {
    timestamps: true,
  }
);

const adminModel = mongoose.model("admin", adminSchema);
module.exports = adminModel;
