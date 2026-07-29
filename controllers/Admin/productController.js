const Product = require("../../models/Admin/productModel");

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      subcategory,
      discountPrice,
      unit,
      quantity,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      image: req.file.filename.replace(/\\/g, "/"),
      discountPrice,
      unit,
      quantity,
      subcategory,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    const products = await Product.find()
      .populate({
        path: "subcategory",
        select: "name category",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// Get Single Product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: "subcategory",
      select: "name category",
      populate: {
        path: "category",
        select: "name",
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.name) {
      updates.name = updates.name.trim();
    }
    if (updates.price) {
      updates.price = parseFloat(updates.price);
    }
    if (updates.discount) {
      updates.discountPrice = parseFloat(updates.discountPrice);
    }
    if (updates.stock) {
      updates.stock = parseInt(updates.stock, 10);
    }
    if (updates.quantity) {
      updates.quantity = parseInt(updates.quantity, 10);
    }
    if (updates.unit) {
      updates.unit = updates.unit.trim();
    }
    if (updates.brand) {
      updates.brand = updates.brand.trim();
    }
    // if (description) {
    //   updates.description = updates.description.trim();
    // }

    if (req.file) {
      updates.image = req.file.filename.replace(/\\/g, "/");
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate({
      path: "subcategory",
      select: "name category",
      populate: {
        path: "category",
        select: "name",
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};
