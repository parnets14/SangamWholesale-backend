
const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["credit", "debit", "refund"],
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    reference: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    transactions: [transactionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastRecharge: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for faster queries
walletSchema.index({ user: 1 });
walletSchema.index({ "transactions.order": 1 });
walletSchema.index(
  { "transactions.reference": 1 },
  { unique: true, sparse: true }
);

// Virtual for available balance
walletSchema.virtual("availableBalance").get(function () {
  return this.balance;
});

// Pre-save hook to format balance
walletSchema.pre("save", function (next) {
  this.balance = parseFloat(this.balance.toFixed(2));
  next();
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
