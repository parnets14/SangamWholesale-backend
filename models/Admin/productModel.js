const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    image: {
      type: String, // Stores URL or file path
      required: [true, "Product image is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    sizes: {
      type: [String], // Array of size options (e.g., ["200g", "500g"])
      required: [true, "At least one size option is required"],
      validate: {
        validator: function (sizes) {
          return sizes.length > 0; // Ensure at least one size
        },
        message: "At least one size option is required",
      },
    },
    units: {
      type: [String], // Array of unit options (e.g., ["500ml", "250ml"])
      required: [true, "At least one unit option is required"],
      validate: {
        validator: function (units) {
          return units.length > 0; // Ensure at least one unit
        },
        message: "At least one unit option is required",
      },
    },
    isActive: {
      type: Boolean,
      default: true, 
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", 
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;