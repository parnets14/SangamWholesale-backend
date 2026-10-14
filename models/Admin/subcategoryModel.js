const mongoose = require("mongoose");

const subcategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subcategory name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      required: false,
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Subcategory = mongoose.model("Subcategory", subcategorySchema);
module.exports = Subcategory;
