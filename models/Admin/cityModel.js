const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
      unique: true,
    },
    icon: {
      type: String,
      required: [true, "Icon is required"],
    },
    iconPublicId: { 
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const City = mongoose.model("City", citySchema);

module.exports = City;