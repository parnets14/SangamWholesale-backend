const mongoose = require("mongoose");

const tradingSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    Description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Trading = mongoose.model("Trading", tradingSchema);
module.exports = Trading;
