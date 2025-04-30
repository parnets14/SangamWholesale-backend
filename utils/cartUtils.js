const Buyonce = require('../models/User/buyonceModel');
const Subscription = require('../models/User/subscriptionModel');

// Get all cart items for a user
const getUserCartItems = async (userId) => {
  // Get all pending buyonce orders
  const buyonceOrders = await Buyonce.find({ 
    user: userId,
    'order.status': 'upcoming'
  }).populate({
    path: 'order.productId',
    select: 'name price images'
  });

  // Get all pending subscriptions
  const subscriptions = await Subscription.find({ 
    user: userId,
    'Subscriptions.status': 'upcoming'
  }).populate({
    path: 'Subscriptions.product',
    select: 'name price images'
  });

  return { buyonceOrders, subscriptions };
};

module.exports = { getUserCartItems };
