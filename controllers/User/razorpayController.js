const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance with credentials from env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order and returns order_id, amount, currency.
 * Body: { amount (in rupees), currency?, receipt? }
 */
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    // Validate presence
    if (amount === undefined || amount === null) {
      return res.status(400).json({ message: 'Amount is required.' });
    }

    // Convert rupees → paise and validate minimum
    const amountInPaise = Math.round(Number(amount) * 100);
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({
        message: 'Amount must be at least ₹1 (100 paise).',
      });
    }

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Razorpay createOrder error:', error);

    // Razorpay auth failure
    if (error.statusCode === 401) {
      return res.status(401).json({ message: 'Razorpay authentication failed. Check API keys.' });
    }

    return res.status(500).json({
      message: 'Failed to create Razorpay order.',
      error: error.message || error,
    });
  }
};

/**
 * POST /api/payments/verify-payment
 * Verifies payment signature using HMAC-SHA256.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
const verifyPayment = (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate all three fields are present
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: 'Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature.',
      });
    }

    // Generate expected signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    const isValid =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(razorpay_signature, 'hex')
      );

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
    }

    return res.status(200).json({ success: true, message: 'Payment verified successfully.' });
  } catch (error) {
    console.error('Razorpay verifyPayment error:', error);
    return res.status(500).json({ message: 'Payment verification error.', error: error.message });
  }
};

module.exports = { createOrder, verifyPayment };
