const mongoose = require("mongoose");

const buyonceSchema = new mongoose.Schema(
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
      default: "one Time",
      required: true,
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
      enum: ["onhold", "delivered", "upcomming", "vaction"],
      default: "upcomming",
    },
    paymentMethod: {
      type: String,
      default: "wallet",
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Buyonce = mongoose.model("Buyonce", buyonceSchema);
module.exports = Buyonce;
