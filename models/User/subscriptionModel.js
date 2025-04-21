const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    frequency: {
      type: String,
      enum: ["daily", "custom", "interval"],
      required: true,
    },
    customDays: {
      type: [Number], // 0-6 (Sunday-Saturday)
      default: [],
    },
    intervalDays: {
      type: Number,
      default: null,
    },
    orderType: {
      type: String,
      default: "subscription",
      required: true,
    },
    deliveryTime: {
      type: String,
      default: "04:00-07:00 AM",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    status: {
      type: String,
      enum: ["onhold", "delivered", "upcoming", "vacation", "cancelled"],
      default: "upcoming",
    },
    paymentMethod: {
      type: String,
      default: "wallet",
    },
    discount: {
      type: Number,
      default: 0,
    },

  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;