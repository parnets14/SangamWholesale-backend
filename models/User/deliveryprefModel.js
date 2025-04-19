const mongoose = require("mongoose");

const deliveryPrefSchema = new mongoose.Schema(
  {
    preference: {
      type: String,
      enum: [
        "Ring Door Bell",
        "Drop at the Door",
        "In Hand Delivery",
        "Keep in Bag",
        "No Preference",
      ],
      required: [true, "Delivery preference is required"],
    },
    instructions: {
      type: String,
      maxlength: [1000, "Instructions cannot exceed 1000 characters"],
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryPreference", deliveryPrefSchema);
