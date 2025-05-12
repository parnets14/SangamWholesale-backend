const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    bannerImg: {
      type: String
    },
    bannerTitle:{
      type :String,
    },
    bannerDesc:{
      type:String,
    }
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
