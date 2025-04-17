const Product = require("../../models/Admin/productModel");
const Category = require("../../models/Admin/categoryModel");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Helper: Delete image file if operation fails
const cleanupImage = (file) => {
  if (file) fs.unlinkSync(file.path);
};

// Create Product (with category validation)
const createProduct = async (req, res) => {
  try {
    const { name, price, description, sizes, units, categoryId } = req.body;
    console.log("req.body", req.body);
    // Validate required fields
    if (
      !name ||
      !price ||
      !description ||
      !sizes ||
      !units ||
      !categoryId ||
      !req.file
    ) {
      cleanupImage(req.file);
      return res.status(400).json({
        success: false,
        message: "All fields including image are required",
      });
    }

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      cleanupImage(req.file);
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Create new product
    const product = await Product.create({
      name,
      price: parseFloat(price),
      description,
      sizes: JSON.parse(sizes),
      units: JSON.parse(units),
      image: req.file.filename,
      category: categoryId,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: {
        ...product._doc,
        image: `${req.protocol}://${req.get("host")}/uploads/products/${
          req.file.filename
        }`,
      },
    });
  } catch (error) {
    cleanupImage(req.file);
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// Get All Products (with category population)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).populate(
      "category",
      "name icon"
    ); // Include category details

    const productsWithImages = products.map((product) => ({
      ...product._doc,
      image: `${req.protocol}://${req.get("host")}/uploads/products/${
        product.image
      }`,
    }));

    res.status(200).json({ success: true, products: productsWithImages });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// Get Products by Category
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = await Product.find({
      category: categoryId,
      isActive: true,
    }).populate("category", "name");

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Category products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category products",
    });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, sizes, units, categoryId } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      cleanupImage(req.file);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update fields
    if (name) product.name = name;
    if (price) product.price = parseFloat(price);
    if (description) product.description = description;
    if (sizes) product.sizes = JSON.parse(sizes);
    if (units) product.units = JSON.parse(units);
    if (categoryId) product.category = categoryId;

    // Handle image update
    if (req.file) {
      const oldImage = path.join(
        __dirname,
        `../../uploads/products/${product.image}`
      );
      if (fs.existsSync(oldImage)) fs.unlinkSync(oldImage);
      product.image = req.file.filename;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated",
      product: {
        ...product._doc,
        image: req.file
          ? `${req.protocol}://${req.get("host")}/uploads/products/${
              req.file.filename
            }`
          : `${req.protocol}://${req.get("host")}/uploads/products/${
              product.image
            }`,
      },
    });
  } catch (error) {
    cleanupImage(req.file);
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

// Delete Product (Soft Delete)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

// Set storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/products"); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
  upload,
};
