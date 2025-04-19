const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
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
        orderType: {
          type: String,
          enum: ["buyonce", "subscription"],
          required: true,
        },
        frequency: {
          type: String,
          enum: ["daily", "custom", "interval"],
        },
        customDays: {
          type: [Number],
          default: [],
        },
        intervalDays: {
          type: Number,
          default: null,
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        selectedDeliveryTime: {
          type: String,
          default: "04:00-07:00 AM",
        },
        selectedAddress: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Address",
          required: true,
        },
      },
    ],
    discount: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "onhold", "delivered", "upcoming", "vacation"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
