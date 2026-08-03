const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Category description is required"],
    },
    image: {
      type: String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
