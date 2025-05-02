const mongoose = require("mongoose");

const discoverSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a video title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    videoFile: {
      filename: String,
      path: String,
      size: Number,
      mimetype: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Discover = mongoose.model("Discover", discoverSchema);

module.exports = Discover;
