const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Subscriptions:[{
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
        type: [Number],
        default: null,
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
    }
    ],
   
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;
