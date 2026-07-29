const express = require("express");
const router = express.Router();
const productController = require("../../controllers/Admin/productController");
const { adminProtect } = require("../../middleware/authMiddleware");
const createUploader = require("../../middleware/multer");

const uploadProductImages = createUploader("products");

// Product CRUD routes
router.post(
  "/",
  adminProtect,
  uploadProductImages.single("image"),
  productController.createProduct
);

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProduct);
router.put(
  "/:id",
  adminProtect,
  uploadProductImages.single("image"),
  productController.updateProduct
);
router.delete("/:id", adminProtect, productController.deleteProduct);

module.exports = router;