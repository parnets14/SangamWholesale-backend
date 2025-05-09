const mongoose = require("mongoose");

const buyonceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: [
      {
        productId: {
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
          default: "buyonce",
          required: true,
        },
        deliveryTime: {
          type: String,
          default: "04:00-07:00 AM",
        },
        deliveryDate: {
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
        subscriptionStatus: {
          type: String,
          enum: ["Active", "InActive"],
          default: "Active",
        },
      },
    ],
  },
  { timestamps: true }
);

const Buyonce = mongoose.model("Buyonce", buyonceSchema);
module.exports = Buyonce;
