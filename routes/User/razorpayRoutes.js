const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../../controllers/User/razorpayController');

// POST /api/payments/create-order
router.post('/create-order', createOrder);

// POST /api/payments/verify-payment
router.post('/verify-payment', verifyPayment);

module.exports = router;
