const mongoose = require("mongoose");

const buyonceItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    discount: {
      type: Number,
      default: 0,
    },
    couponApplied: {
      type: String,
    },
  },
  { timestamps: true }
);

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: [buyonceItemSchema],
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  discountTotal: {
    type: Number,
    default: 0,
  },
  deliveryFee: {
    type: Number,
    default: 0,
  },
  grandTotal: {
    type: Number,
    default: 0,
  },
  offers: [
    {
      code: String,
      discount: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to calculate totals
cartSchema.pre("save", function (next) {
  this.subtotal = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemDiscounts = this.items.reduce(
    (sum, item) => sum + (item.discount || 0),
    0
  );

  const offerDiscounts = this.offers.reduce(
    (sum, offer) => sum + (offer.discount || 0),
    0
  );

  this.discountTotal = itemDiscounts + offerDiscounts;
  this.grandTotal = this.subtotal - this.discountTotal + this.deliveryFee;

  next();
});

const BuyOnceCart = mongoose.model("BuyOnceCart", cartSchema);

module.exports = BuyOnceCart;
