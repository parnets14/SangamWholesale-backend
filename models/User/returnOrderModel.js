const mongoose = require("mongoose");

const returnOrderSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        sku: String,
        image: String,
        quantity: Number,
        reason: String, // Reason for return
        status: { type: String, default: "requested" } // requested, approved, rejected, processed
      }
    ],
    comment: String, // Optional: user comment
    status: { type: String, default: "requested" }, // Overall return status
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReturnOrder", returnOrderSchema);
