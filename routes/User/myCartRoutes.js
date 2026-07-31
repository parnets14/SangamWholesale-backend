// routes/cart.js
const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/User/myCartController'); // Your cart controller
const {userProtect} = require('../../middleware/authMiddleware'); // Your JWT auth middleware

router.get('/', userProtect, cartController.getCart);
router.post('/', userProtect, cartController.addToCart);
router.put('/:productId', userProtect, cartController.updateCartItem);
// /clear MUST come before /:productId or Express matches "clear" as a productId param
router.delete('/clear', userProtect, cartController.clearCart);
router.delete('/:productId', userProtect, cartController.removeFromCart);

module.exports = router;