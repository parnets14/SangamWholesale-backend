// routes/wishlist.js
const express = require("express");
const router = express.Router();
const wishlistController = require("../../controllers/User/wishListController"); // Your wishlist controller
const { userProtect } = require("../../middleware/authMiddleware");

router.get("/", userProtect, wishlistController.getWishlist);
router.post("/", userProtect, wishlistController.addToWishlist);
router.delete(
  "/:productId",
  userProtect,
  wishlistController.removeFromWishlist
);

module.exports = router;
