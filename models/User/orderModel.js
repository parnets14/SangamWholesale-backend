const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  sku: String,
  image: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    deliveryAddress: { type: String, required: true },
    addressName: String,
    addressContact: String,
    paymentMethod: { type: String, required: true }, // 'credit', 'upi', 'cod'
    orderNotes: String,
    subtotal: Number,
    gst: Number,
    total: Number,
    status: { type: String, default: "pending" }, // pending, confirmed, shipped, delivered, cancelled
    orderId: { type: String, unique: true }, // e.g., UD123456

    // ── Delivery lifecycle (delivery-partner app) ──────────────────────────
    // placed      -> just created, waiting for a partner to accept
    // accepted    -> a delivery partner claimed it
    // out_for_delivery -> partner started delivery, OTP generated for customer
    // delivered   -> customer's OTP verified, delivery complete
    // undelivered -> partner could not deliver
    deliveryStatus: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "out_for_delivery",
        "delivered",
        "undelivered",
      ],
      default: "placed",
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    deliveryOtp: String, // OTP shown to the customer; entered by the partner
    deliveryOtpExpiry: Date,
    deliveryRemarks: String,
    acceptedAt: Date,
    outForDeliveryAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
