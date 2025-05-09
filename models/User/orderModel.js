// // models/Order/orderModel.js
// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     items: [
//       {
//         productType: {
//           type: String,
//           enum: ["buyonce", "subscription"],
//           required: true,
//         },
//         product: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         quantity: {
//           type: Number,
//           required: true,
//           min: 1,
//         },
//         price: {
//           type: Number,
//           required: true,
//         },
//       },
//     ],
//     deliveryAddress: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Address",
//       required: true,
//     },
//     totalAmount: {
//       type: Number,
//       required: true,
//     },
//     discount: {
//       type: Number,
//       default: 0,
//     },
//     finalAmount: {
//       type: Number,
//       required: true,
//     },
//     paymentMethod: {
//       type: String,
//       required: true,
//       enum: ["cod", "online", "wallet"],
//     },
//     paymentStatus: {
//       type: String,
//       enum: ["pending", "completed", "failed"],
//       default: "pending",
//     },
//     orderStatus: {
//       type: String,
//       enum: [
//         "pending",
//         "confirmed",
//         "processing",
//         "out_for_delivery",
//         "delivered",
//         "cancelled",
//       ],
//       default: "confirmed",
//     },
//     deliverySlot: {
//       type: String,
//       enum: ["morning", "afternoon", "evening"],
//       required: true,
//     },
//     deliveryDate: {
//       type: Date,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Order", orderSchema);





const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
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
  },
  price: {  // Snapshot of price at time of order
    type: Number,
    required: true,
  },
  // Subscription-specific fields
  frequency: {
    type: String,
    enum: ["daily", "custom", "interval"],
    required: function() {
      return this.productType === "subscription";
    }
  },
  customDays: [Number],
  intervalDays: Number,
  startDate: Date,
  endDate: Date,
  // Delivery details
  deliveryTime: String,
  deliverySlot: {
    type: String,
    enum: ["morning", "afternoon", "evening"]
  }
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    deliveryAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online", "wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "out_for_delivery", "delivered", "cancelled"],
      default: "confirmed",
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    // Original cart reference (optional)
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart"
    }
  },
  {
    timestamps: true,
  }
);

// Add virtual for populated products
orderSchema.virtual("products", {
  ref: doc => doc.productType === "buyonce" ? "Product" : "SubscriptionProduct",
  localField: "items.product",
  foreignField: "_id",
  justOne: false
});

module.exports = mongoose.model("Order", orderSchema);