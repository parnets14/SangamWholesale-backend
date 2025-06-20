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
      required: [true, "Subcategory description is required"],
    },
    image: {
      type: String,
      required: [true, "Subcategory image is required"],
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
