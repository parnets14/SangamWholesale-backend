const mongoose = require("mongoose");

const diccoverSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a video title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters"]
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
  },
  { timestamps: true }
);

const Diccover = mongoose.model("Diccover", diccoverSchema);

module.exports = Diccover;