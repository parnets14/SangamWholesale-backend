const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  purchaseType: {
    type: String,
    enum: ['Buy Once', 'Subscribe'],
    required: true
  },
  deliverySchedule: {
    type: String,
    required: function() { return this.purchaseType === 'Subscribe'; }
  },
  discount: {
    type: Number,
    default: 0
  },
  couponApplied: {
    type: String
  }
}, { timestamps: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  subtotal: {
    type: Number,
    default: 0
  },
  discountTotal: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  },
  offers: [{
    code: String,
    discount: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.discountTotal = this.items.reduce((sum, item) => sum + (item.discount || 0), 0) + this.offers.reduce((sum, offer) => sum + (offer.discount || 0), 0);
  this.grandTotal = this.subtotal - this.discountTotal + this.deliveryFee;
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;