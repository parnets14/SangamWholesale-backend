const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productType: {
    type: String,
    enum: ["buyonce", "subscription"],
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "items.productType",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },

  // For subscription products
  frequency: {
    type: String,
    enum: ["daily", "custom", "interval"],
    required: function () {
      return this.productType === "subscription";
    },
  },
  customDays: {
    type: [Number],
    validate: {
      validator: function (v) {
        return (
          this.productType !== "subscription" ||
          this.frequency !== "custom" ||
          (v && v.length > 0)
        );
      },
      message: "Custom days are required for custom frequency subscriptions",
    },
  },
  intervalDays: {
    type: Number,
    validate: {
      validator: function (v) {
        return (
          this.productType !== "subscription" ||
          this.frequency !== "interval" ||
          v > 0
        );
      },
      message:
        "Interval days are required for interval frequency subscriptions",
    },
  },
  startDate: {
    type: Date,
    required: function () {
      return this.productType === "subscription";
    },
  },
  endDate: {
    type: Date,
    required: function () {
      return this.productType === "subscription";
    },
  },
  // For both types
  deliveryTime: {
    type: String,
    default: "04:00-07:00 AM",
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    coupon: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate cart total
cartSchema.virtual("total").get(function () {
  return (
    this.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0) - this.discount
  );
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
