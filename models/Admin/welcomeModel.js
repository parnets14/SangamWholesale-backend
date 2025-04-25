

const mongoose = require("mongoose");

const welcomeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    image: {
      type: String,
      required: [true, "Icon is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Welcome = mongoose.model("Welcome", welcomeSchema);

module.exports = Welcome;
