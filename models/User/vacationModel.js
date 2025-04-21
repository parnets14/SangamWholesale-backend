const mongoose = require("mongoose");

const vacationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
   
  },
  { timestamps: true }
);

const Vacation = mongoose.model("Vacation", vacationSchema);
module.exports = Vacation;