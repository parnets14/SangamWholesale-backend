// routes/cart.js
const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/User/myCartController'); // Your cart controller
const {userProtect} = require('../../middleware/authMiddleware'); // Your JWT auth middleware

router.get('/', userProtect, cartController.getCart);
router.post('/', userProtect, cartController.addToCart);
router.put('/:productId', userProtect, cartController.updateCartItem);
router.delete('/:productId', userProtect, cartController.removeFromCart);
router.delete('/clear', userProtect, cartController.clearCart);

module.exports = router;