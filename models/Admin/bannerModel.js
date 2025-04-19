const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    banner: {
      type: String,
      required: [true, "banner is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
