const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    gst: {
      type: Number, // GST percentage per item, e.g. 5, 12, 18, 28
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      required: false,
      default: null,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String, // e.g. "kg", "litre", "piece"
      default: "piece",
    },
    quantity: {
      type: Number, // e.g. 1, 2, 3
      default: 1, // Default to 1 for single items
    },
    packSize: {
      type: Number, // unit conversion: "1 [unit] = [packSize] [baseUnit]" e.g. 1 bag = 30 kg
      default: null,
      min: 0,
    },
    baseUnit: {
      type: String, // base unit for the conversion, e.g. "kg"
      default: "",
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
