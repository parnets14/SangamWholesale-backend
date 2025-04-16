const express = require("express");
const router = express.Router();
const productController = require("../../controllers/Admin/productController");
const { adminProtect } = require("../../middleware/Middleware");
const upload = require("../../middleware/multer");

// Admin-protected routes
router.post(
  "/",
  adminProtect,
  upload.single("image"),
  productController.createProduct
);

router.get("/all", productController.getAllProducts);
router.get("/category/:categoryId", productController.getProductsByCategory);
router.put(
  "/:id",
  adminProtect,
  upload.single("image"),
  productController.updateProduct
);
router.delete("/:id", adminProtect, productController.deleteProduct);

module.exports = router;
