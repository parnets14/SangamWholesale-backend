const express = require("express");
const router = express.Router();
const productController = require("../../controllers/Admin/productController");
const { adminProtect } = require("../../middleware/Middleware");
// const upload = require("../../middleware/multer");
const createUploader = require("../../middleware/multer");
// Admin-protected routes

// For categories
const uploadCategory = createUploader("products");
router.post(
  "/",
  adminProtect,
  uploadCategory.single("image"),
  productController.createProduct
);
router.get("/", productController.getAllProducts);
router.get("/category/:categoryId", productController.getProductsByCategory);
router.put("/:id",adminProtect,uploadCategory.single("image"),productController.updateProduct);
router.delete("/:id", adminProtect, productController.deleteProduct);

module.exports = router;
